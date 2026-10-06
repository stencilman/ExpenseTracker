/**
 * Expense.receiptUrls has held three shapes over time: a bare S3 key (current),
 * a "/api/files/<key>" proxy path, and a full amazonaws.com URL. Normalise any
 * of them to the S3 object key.
 */
export function toS3Key(receiptUrl: string | null | undefined): string | null {
  if (!receiptUrl) return null;

  if (receiptUrl.startsWith("/api/files/")) {
    return decodeURIComponent(receiptUrl.slice("/api/files/".length)) || null;
  }

  if (receiptUrl.includes("amazonaws.com")) {
    try {
      const pathParts = new URL(receiptUrl).pathname.split("/");
      return decodeURIComponent(pathParts[pathParts.length - 1]) || null;
    } catch {
      return null;
    }
  }

  return receiptUrl;
}
