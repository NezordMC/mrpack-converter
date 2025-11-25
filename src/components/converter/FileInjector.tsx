import { useState, useCallback } from "react";
import { UploadCloud, FilePlus, X, File as FileIcon, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileInjectorProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export default function FileInjector({ files, onFilesChange }: FileInjectorProps) {
  const [isDragActive, setIsDragActive] = useState(false);

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

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const newFiles = Array.from(e.dataTransfer.files);
        // Filter duplikat berdasarkan nama
        const uniqueNewFiles = newFiles.filter((nf) => !files.some((ef) => ef.name === nf.name));
        onFilesChange([...files, ...uniqueNewFiles]);
      }
    },
    [files, onFilesChange]
  );

  const handleRemove = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <FilePlus className="w-4 h-4 text-primary" />
          Inject Additional Files
        </h3>
        <span className="text-xs text-muted-foreground">Drag & drop mods (.jar) or configs</span>
      </div>

      <div
        className={cn("relative border-2 border-dashed rounded-lg p-4 transition-all text-center cursor-pointer", isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/5")}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById("inject-upload")?.click()}
      >
        <input
          id="inject-upload"
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              const newFiles = Array.from(e.target.files);
              const uniqueNewFiles = newFiles.filter((nf) => !files.some((ef) => ef.name === nf.name));
              onFilesChange([...files, ...uniqueNewFiles]);
            }
          }}
        />

        <div className="flex flex-col items-center gap-2 py-2">
          <div className="p-2 bg-background rounded-full shadow-sm ring-1 ring-muted">
            <UploadCloud className={cn("w-5 h-5", isDragActive ? "text-primary" : "text-muted-foreground")} />
          </div>
          <p className="text-xs text-muted-foreground">{isDragActive ? "Drop files to inject!" : "Click or drag files here"}</p>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>.jar files go to /mods, others to root.</span>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
              {files.map((file, idx) => (
                <motion.div
                  key={`${file.name}-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/40 border border-border text-xs"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileIcon className="w-3 h-3 flex-shrink-0 text-blue-500" />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-medium">{file.name}</span>
                      <span className="text-[10px] text-muted-foreground">{formatBytes(file.size)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(idx);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
