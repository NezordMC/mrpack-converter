import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileArchive, AlertCircle, Link as LinkIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  isProcessing?: boolean;
}

export default function Dropzone({ onFileSelect, onUrlSubmit, isProcessing }: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      setError(null);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        validateAndPass(file);
      }
    },
    [onFileSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndPass(e.target.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    try {
      new URL(urlInput);
      onUrlSubmit(urlInput);
    } catch (err) {
      setError("Please enter a valid URL starting with http:// or https://");
    }
  };

  const validateAndPass = (file: File) => {
    if (!file.name.endsWith(".mrpack")) {
      setError("Invalid file extension. Only .mrpack files are supported.");
      return;
    }

    if (file.size === 0) {
      setError("File is empty.");
      return;
    }

    onFileSelect(file);
  };

  return (
    <div className="w-full space-y-8">
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
        <input id="file-upload" type="file" className="hidden" accept=".mrpack" onChange={handleChange} disabled={isProcessing} />

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-background rounded-full shadow-sm ring-1 ring-muted group-hover:ring-primary/50 transition-all">
            {isDragActive ? <Upload className="w-8 h-8 text-primary animate-bounce" /> : <FileArchive className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />}
          </div>

          <div className="space-y-1">
            <p className="text-lg font-medium">{isDragActive ? "Drop file here!" : "Click to upload or drag & drop"}</p>
            <p className="text-sm text-muted-foreground">
              Only <span className="font-mono text-primary">.mrpack</span> files are supported
            </p>
          </div>
        </div>
      </motion.div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or download from URL</span>
        </div>
      </div>

      <form onSubmit={handleUrlSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Paste direct .mrpack link here..." className="pl-9" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} disabled={isProcessing} />
        </div>
        <Button type="submit" disabled={isProcessing || !urlInput}>
          Convert
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </form>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-3 bg-destructive/15 text-destructive text-sm rounded-lg flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
