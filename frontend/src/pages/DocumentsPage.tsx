import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { FiUploadCloud, FiFile } from "react-icons/fi";

import { Document } from "../types";

export default function DocumentUpload({
  onUploadSuccess,
}: {
  onUploadSuccess?: (doc: Document) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files[0]) return;

    const file = files[0];
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Only PDF and images allowed");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File too large (max 50MB)");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Document uploaded successfully!");
      if (onUploadSuccess) onUploadSuccess(response.data.document);
    } catch (error: any) {
      toast.error(
        "Upload failed: " + (error.response?.data?.error || error.message),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`relative overflow-hidden glass rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 border-2 ${
          isDragging
            ? "border-blue-500 bg-blue-500/10 scale-105 shadow-2xl"
            : "border-white/10 hover:border-blue-500/50 hover:bg-white/5"
        }`}
      >
        <input
          type="file"
          id="file"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
        />

        <label
          htmlFor="file"
          className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
        >
          <div
            className={`p-4 rounded-full mb-4 transition-colors duration-300 ${isDragging ? "bg-blue-500 text-white" : "bg-white/5 text-blue-500"}`}
          >
            {isLoading ? (
              <svg
                className="animate-spin w-10 h-10"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <FiUploadCloud className="w-10 h-10" />
            )}
          </div>

          <h3 className="text-xl font-bold text-foreground mb-2">
            {isLoading ? "Uploading securely..." : "Drag & drop documents here"}
          </h3>
          <p className="text-neutral-400 text-sm max-w-sm mx-auto">
            Securely upload PDFs and images for automated AI fraud analysis. Max
            file size: 50MB.
          </p>

          {!isLoading && (
            <div className="mt-6 flex items-center justify-center space-x-2 text-xs font-medium text-neutral-500">
              <span className="flex items-center">
                <FiFile className="mr-1" /> PDF
              </span>
              <span>&bull;</span>
              <span className="flex items-center">
                <FiFile className="mr-1" /> JPEG
              </span>
              <span>&bull;</span>
              <span className="flex items-center">
                <FiFile className="mr-1" /> PNG
              </span>
            </div>
          )}
        </label>
      </div>
    </div>
  );
}
