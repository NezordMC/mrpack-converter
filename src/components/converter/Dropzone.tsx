import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileArchive, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export default function Dropzone({ onFileSelect, isProcessing }: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndPass(file);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndPass(e.target.files[0]);
    }
  };

  const validateAndPass = (file: File) => {
    if (!file.name.endsWith(".mrpack")) {
      setError("Invalid file type. Please upload a .mrpack file.");
      return;
    }
    onFileSelect(file);
  };

  return (
    <div className="w-full">
      <motion.div
        animate={{
          scale: isDragActive ? 1.02 : 1,
          borderColor: isDragActive ? "var(--primary)" : "var(--border)",
          backgroundColor: isDragActive ? "rgba(var(--primary-rgb), 0.05)" : "transparent",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        
        className={cn(
          "relative group cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors hover:bg-accent/50",
          isProcessing && "opacity-50 pointer-events-none cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".mrpack"
          onChange={handleChange}
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-background rounded-full shadow-sm ring-1 ring-muted group-hover:ring-primary/50 transition-all">
            {isDragActive ? (
              <Upload className="w-8 h-8 text-primary animate-bounce" />
            ) : (
              <FileArchive className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-lg font-medium">
              {isDragActive ? "Drop file here!" : "Click to upload or drag & drop"}
            </p>
            <p className="text-sm text-muted-foreground">
              Only <span className="font-mono text-primary">.mrpack</span> files are supported
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-destructive/15 text-destructive text-sm rounded-lg flex items-center justify-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
