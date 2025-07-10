"use client";

import { X, File } from "lucide-react";
import { useState, useEffect } from "react";
import { DropZone } from "@/components/ui/drop-zone";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";

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

  const handleFilesDrop = (newFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      direction="bottom"
    >
      <DrawerContent className="h-[95vh] max-h-[95vh] !mt-0 !max-h-[95vh]">
        <DrawerHeader className="border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <DrawerTitle className="font-semibold text-2xl">
              Upload Receipts
            </DrawerTitle>
            <DrawerClose asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="py-4 sm:py-8 px-4 sm:px-6 flex-grow overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-8 h-full">
            <DropZone
              className="h-full md:col-span-3"
              onFilesDrop={handleFilesDrop}
              title="Drag and drop receipts here"
              description="Supports JPG, PNG, and PDF files up to 10MB each"
              buttonText="Browse Files"
              acceptedFileTypes="image/jpeg,image/png,application/pdf"
            />

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
                            <p className="font-medium truncate max-w-[150px] sm:max-w-[250px]">
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

        <DrawerFooter className="border-t sticky bottom-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-500">
              {files.length > 0
                ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
                : "No files selected"}
            </div>
            <Button
              className="px-8 py-6 text-base"
              disabled={files.length === 0}
            >
              Upload Files
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
