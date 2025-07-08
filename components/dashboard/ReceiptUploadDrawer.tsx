"use client";

import { X, Upload, File } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";

interface ReceiptUploadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialFiles?: File[];
}

export default function ReceiptUploadDrawer({
  isOpen,
  onClose,
  initialFiles = [],
}: ReceiptUploadDrawerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  // Handle initialFiles when they change
  useEffect(() => {
    if (initialFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...initialFiles]);
    }
  }, [initialFiles]);

  // Clear files when drawer closes
  useEffect(() => {
    if (!isOpen) {
      // Clear files after the closing animation completes
      const timer = setTimeout(() => {
        setFiles([]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`fixed inset-0 bg-white transform transition-transform duration-300 z-50 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full w-full overflow-hidden">
          <div className="flex items-center justify-between py-6 px-6 border-b sticky top-0 bg-white z-10">
            <h2 className="font-semibold text-2xl">Upload Receipts</h2>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-10 w-10"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="py-8 px-6 flex-grow overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 h-full">
              <div
                className={`border-2 border-dashed rounded-xl h-[500px] md:col-span-3 flex flex-col items-center justify-center p-8 text-center transition-all duration-200 ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 scale-[1.02]"
                    : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <div className="p-6 bg-blue-50 rounded-full mb-6">
                  <Upload className="h-14 w-14 text-blue-500" />
                </div>
                <h3 className="text-xl font-medium mb-3">
                  Drag and drop receipts here
                </h3>
                <p className="text-base text-muted-foreground mb-6 max-w-xs">
                  Supports JPG, PNG, and PDF files up to 10MB each
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,application/pdf"
                  className="hidden"
                  id="receipt-upload"
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8"
                  onClick={() =>
                    document.getElementById("receipt-upload")?.click()
                  }
                >
                  Browse Files
                </Button>
              </div>

              <div className="flex flex-col h-full">
                {files.length > 0 ? (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">
                        Selected Files ({files.length})
                      </h3>
                      {files.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setFiles([])}
                        >
                          Clear All
                        </Button>
                      )}
                    </div>

                    <div
                      className="flex-grow overflow-y-auto pr-2 space-y-2"
                      style={{ maxHeight: "calc(100vh - 250px)" }}
                    >
                      {files.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-100"
                        >
                          <div className="flex items-center overflow-hidden">
                            <div className="bg-blue-100 p-2 rounded mr-3">
                              <File className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="font-medium truncate max-w-[250px]">
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-50 hover:text-red-500"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-slate-50/50">
                    <File className="h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 mb-2">
                      No Files Selected
                    </h3>
                    <p className="text-sm text-slate-500 max-w-xs">
                      Files you select or drop will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="py-6 px-6 border-t sticky bottom-0 bg-white z-10">
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-500">
                {files.length > 0
                  ? `${files.length} file${
                      files.length > 1 ? "s" : ""
                    } selected`
                  : "No files selected"}
              </div>
              <Button
                className="px-8 py-6 text-base"
                disabled={files.length === 0}
              >
                Upload Files
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
