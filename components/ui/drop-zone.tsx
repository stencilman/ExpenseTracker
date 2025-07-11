"use client";
import * as React from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DropZoneProps extends React.HTMLAttributes<HTMLDivElement> {
  onFilesDrop: (files: File[]) => void;
  dragActive?: boolean;
  size?: "sm" | "lg";
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  buttonText?: string;
  acceptedFileTypes?: string;
  className?: string;
  children?: React.ReactNode;
}

export function DropZone({
  onFilesDrop,
  dragActive = false,
  size = "lg",
  title = "Drag and drop files here",
  description = "Supports JPG, PNG, and PDF files up to 10MB each",
  icon = <Upload className="h-14 w-14 text-blue-500" />,
  buttonText = "Browse Files",
  acceptedFileTypes = "image/jpeg,image/png,application/pdf",
  className,
  children,
  ...props
}: DropZoneProps) {
  const [isDragActive, setIsDragActive] = React.useState(dragActive);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const newFiles = Array.from(e.dataTransfer.files);
        onFilesDrop(newFiles);
      }
    },
    [onFilesDrop]
  );

  const handleFileChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files);
        onFilesDrop(newFiles);
      }
    },
    [onFilesDrop]
  );

  const handleButtonClick = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-xl transition-all duration-200",
        size === "sm"
          ? "h-[100px] px-6 flex flex-row items-center justify-between gap-4"
          : "flex flex-col items-center justify-center p-8 text-center",
        isDragActive
          ? "border-blue-500 bg-blue-50 scale-[1.02]"
          : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50",
        className
      )}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      {...props}
    >
      {children || (
        <>
          {size === "sm" ? (
            <>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-full">
                  <Upload className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-medium">{title}</h3>
                </div>
              </div>
              <input
                type="file"
                multiple
                accept={acceptedFileTypes}
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                size="sm"
                className="px-4 flex-shrink-0"
                onClick={handleButtonClick}
              >
                {buttonText}
              </Button>
            </>
          ) : (
            <>
              <div className="p-6 bg-blue-50 rounded-full mb-6">{icon}</div>
              <h3 className="text-xl font-medium mb-3">{title}</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-xs">
                {description}
              </p>
              <input
                type="file"
                multiple
                accept={acceptedFileTypes}
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                size="lg"
                className="px-8"
                onClick={handleButtonClick}
              >
                {buttonText}
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}
