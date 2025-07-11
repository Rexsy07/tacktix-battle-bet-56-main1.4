
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface FileInputProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  accept?: string;
  className?: string;
}

export const FileInput = ({
  file,
  onFileChange,
  disabled = false,
  accept = "image/*",
  className,
}: FileInputProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`w-full ${className || ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept={accept}
        disabled={disabled}
      />

      {!file ? (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            ${isDragging ? "border-tacktix-blue bg-tacktix-blue/5" : "border-gray-600"} 
            ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-tacktix-blue hover:bg-tacktix-blue/5"}
          `}
          onClick={disabled ? undefined : handleButtonClick}
        >
          <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-white text-sm font-medium">
            Drag and drop your file here or click to browse
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Maximum file size: 10MB
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-tacktix-dark-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-tacktix-dark flex items-center justify-center rounded-md">
                <Upload className="h-6 w-6 text-tacktix-blue" />
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!disabled && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Also add default export to prevent import issues
export default FileInput;
