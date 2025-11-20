import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Layers, Gamepad2, ArrowRight, FileCode, Search, File, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ModrinthManifest } from "@/lib/types";

interface PackDetailsProps {
  manifest: ModrinthManifest;
  onStartConversion: () => void;
  onCancel: () => void;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function PackDetails({ manifest, onStartConversion, onCancel }: PackDetailsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFiles, setShowFiles] = useState(false);

  const filteredFiles = manifest.files.filter((f) => f.path.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl bg-card border rounded-xl overflow-hidden shadow-2xl">
      <div className="p-6 bg-muted/10 border-b">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{manifest.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">v{manifest.versionId}</span>
              <span className="text-xs text-muted-foreground">• {manifest.files.length} files attached</span>
            </div>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg text-primary shrink-0">
            <Box className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border">
        <div className="bg-card p-4 flex items-center gap-3 justify-center text-center sm:justify-start sm:text-left">
          <Gamepad2 className="w-5 h-5 text-blue-500 hidden sm:block" />
          <div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Minecraft</p>
            <p className="font-semibold text-sm">{manifest.dependencies.minecraft}</p>
          </div>
        </div>
        <div className="bg-card p-4 flex items-center gap-3 justify-center text-center sm:justify-start sm:text-left">
          <Layers className="w-5 h-5 text-green-500 hidden sm:block" />
          <div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Loader</p>
            <p className="font-semibold text-sm">{manifest.dependencies["fabric-loader"] ? "Fabric" : manifest.dependencies.forge ? "Forge" : manifest.dependencies["neo-forge"] ? "NeoForge" : "Unknown"}</p>
          </div>
        </div>  
      </div>

      <div className="p-6 pb-2 bg-card flex flex-col gap-3">
        <Button onClick={onStartConversion} size="lg" className="w-full gap-2 text-lg shadow-lg shadow-primary/20">
          Convert to ZIP <ArrowRight className="w-5 h-5" />
        </Button>
        <Button variant="ghost" onClick={onCancel} className="w-full text-muted-foreground hover:text-destructive">
          Cancel Operation
        </Button>
      </div>

      <div className="px-6 pb-6">
        <div className="border-t pt-4">
          <button onClick={() => setShowFiles(!showFiles)} className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group py-2">
            <span className="flex items-center gap-2">
              <FileCode className="w-4 h-4" />
              View Pack Contents ({manifest.files.length})
            </span>
            {showFiles ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showFiles && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="pt-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search filename..." className="pl-8 h-9 text-sm bg-muted/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>

                  <div className="max-h-[250px] overflow-y-auto space-y-1 pr-1 custom-scrollbar border rounded-md p-1">
                    {filteredFiles.length > 0 ? (
                      filteredFiles.map((file, idx) => {
                        const fileName = file.path.split("/").pop();
                        const isJar = fileName?.endsWith(".jar");

                        return (
                          <div key={idx} className="flex items-center gap-3 p-2 rounded hover:bg-accent/50 transition-colors text-xs">
                            <div className={`p-1 rounded-md shrink-0 ${isJar ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"}`}>{isJar ? <Box className="w-3 h-3" /> : <File className="w-3 h-3" />}</div>
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium text-foreground/90">{fileName}</p>
                              <p className="text-muted-foreground text-[10px] truncate opacity-70">{file.path}</p>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono shrink-0">{formatBytes(file.fileSize)}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-xs text-muted-foreground py-4">No match found.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
