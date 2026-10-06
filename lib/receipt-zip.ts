import { CsvValue, toCsv } from "@/lib/csv";
import type { ReceiptFileEntry } from "@/lib/receipt-export";
import archiver from "archiver";
import { Readable } from "stream";

/** S3 objects fetched ahead of the one currently being zipped. */
const PREFETCH = 3;

const MANIFEST_COLUMNS = [
  "File",
  "Included",
  "Expense #",
  "Date",
  "Merchant",
  "Category",
  "Amount",
  "Claim Reimbursement",
  "Status",
  "Report #",
  "Report Title",
];

const CONTENT_TYPE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

/** Loads one stored object; the route passes getS3ObjectStream. */
export type FetchObject = (
  key: string
) => Promise<{ body: NodeJS.ReadableStream; contentType?: string }>;

type FetchResult =
  | { ok: true; body: NodeJS.ReadableStream; contentType?: string }
  | { ok: false };

async function fetchReceipt(
  entry: ReceiptFileEntry,
  fetchObject: FetchObject
): Promise<FetchResult> {
  if (!entry.key) return { ok: false };
  try {
    return { ok: true, ...(await fetchObject(entry.key)) };
  } catch (error) {
    console.error(`Receipt ${entry.key} could not be fetched:`, error);
    return { ok: false };
  }
}

function manifestRow(
  entry: ReceiptFileEntry,
  fileName: string,
  included: boolean
): CsvValue[] {
  const { expense } = entry;
  return [
    fileName,
    included ? "Yes" : "Missing",
    expense.id,
    expense.date.toISOString().slice(0, 10),
    expense.merchant,
    expense.category,
    expense.amount.toFixed(2),
    expense.claimReimbursement ? "Yes" : "No",
    expense.status,
    expense.report?.id ?? "",
    expense.report?.title ?? "",
  ];
}

/**
 * Append a stream and wait until the archive has written it, so S3 bodies are
 * consumed one at a time. Rejects if the archive errors or is torn down (e.g.
 * the client disconnected) before the entry completes.
 */
function appendAndWait(archive: archiver.Archiver, body: Readable, name: string) {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      archive.off("entry", onEntry);
      archive.off("error", onError);
      archive.off("close", onClose);
    };
    const onEntry = () => {
      cleanup();
      resolve();
    };
    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };
    const onClose = () => onError(new Error("Archive closed before entry was written"));

    archive.on("entry", onEntry);
    archive.on("error", onError);
    archive.on("close", onClose);
    archive.append(body, { name });
  });
}

/**
 * Append every receipt to the archive in order, then the manifest. Entries are
 * written one at a time with a small prefetch so only a handful of S3
 * connections are open, and the archive's own backpressure paces the S3 reads.
 */
export async function writeReceiptArchive(
  archive: archiver.Archiver,
  entries: ReceiptFileEntry[],
  fetchObject: FetchObject,
  signal?: AbortSignal
) {
  const rows: CsvValue[][] = [MANIFEST_COLUMNS];
  const pending = entries
    .slice(0, PREFETCH)
    .map((entry) => fetchReceipt(entry, fetchObject));
  let next = 0;

  try {
    for (; next < entries.length; next++) {
      if (signal?.aborted) throw new Error("Client aborted the download");

      const entry = entries[next];
      const result = await pending[next];
      if (next + PREFETCH < entries.length) {
        pending.push(fetchReceipt(entries[next + PREFETCH], fetchObject));
      }

      const extension =
        entry.extension ??
        (result.ok && result.contentType
          ? CONTENT_TYPE_EXTENSIONS[result.contentType]
          : undefined);
      const fileName = extension ? `${entry.basePath}.${extension}` : entry.basePath;

      if (!result.ok) {
        rows.push(manifestRow(entry, fileName, false));
        continue;
      }

      await appendAndWait(archive, result.body as Readable, fileName);
      rows.push(manifestRow(entry, fileName, true));
    }
  } catch (error) {
    // Release any S3 connections that were prefetched but never consumed.
    for (const fetched of pending.slice(next + 1)) {
      fetched.then((r) => r.ok && (r.body as Readable).destroy());
    }
    throw error;
  }

  archive.append(toCsv(rows), { name: "manifest.csv" });
  await archive.finalize();
}
