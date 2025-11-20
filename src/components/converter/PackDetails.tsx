import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Layers, Gamepad2, ArrowRight, FileCode, Search, File, ChevronDown, ChevronUp, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { ModrinthManifest } from "@/lib/types";

interface PackDetailsProps {
  manifest: ModrinthManifest;
  onStartConversion: (filteredManifest: ModrinthManifest) => void;
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

  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());

  useEffect(() => {
    const allPaths = new Set(manifest.files.map((f) => f.path));
    setSelectedPaths(allPaths);
  }, [manifest]);

  const filteredFiles = manifest.files.filter((f) => f.path.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleFile = (path: string) => {
    const next = new Set(selectedPaths);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }
    setSelectedPaths(next);
  };

  const toggleSelectAll = () => {
    if (selectedPaths.size === manifest.files.length) {
      setSelectedPaths(new Set());
    } else {
      setSelectedPaths(new Set(manifest.files.map((f) => f.path)));
    }
  };

  const handleConvertClick = () => {
    const finalFiles = manifest.files.filter((f) => selectedPaths.has(f.path));

    const newManifest = {
      ...manifest,
      files: finalFiles,
    };

    onStartConversion(newManifest);
  };

  const selectedCount = selectedPaths.size;
  const totalCount = manifest.files.length;
  const isAllSelected = selectedCount === totalCount;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl bg-card border rounded-xl overflow-hidden shadow-2xl">
      <div className="p-6 bg-muted/10 border-b">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground font-heading">{manifest.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">v{manifest.versionId}</span>
              <span className="text-xs text-muted-foreground">
                • {selectedCount} of {totalCount} files selected
              </span>
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
        <Button
          onClick={handleConvertClick}
          size="lg"
          disabled={selectedCount === 0}
          className="w-full gap-2 text-lg shadow-lg shadow-primary/20"
        >
          {selectedCount === 0 ? "Select files to convert" : "Convert to ZIP"}
          <ArrowRight className="w-5 h-5" />
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
              {showFiles ? "Hide" : "Customize"} Pack Contents
            </span>
            {showFiles ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showFiles && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="pt-4 space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Search filename..." className="pl-8 h-9 text-sm bg-muted/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <Button variant="outline" size="sm" onClick={toggleSelectAll} className="shrink-0 text-xs px-3" title={isAllSelected ? "Deselect All" : "Select All"}>
                      <CheckSquare className={`w-4 h-4 ${isAllSelected ? "text-primary" : "text-muted-foreground"}`} />
                    </Button>
                  </div>

                  <div className="max-h-[250px] overflow-y-auto space-y-1 pr-1 custom-scrollbar border rounded-md p-1 bg-background/50">
                    {filteredFiles.length > 0 ? (
                      filteredFiles.map((file, idx) => {
                        const fileName = file.path.split("/").pop();
                        const isJar = fileName?.endsWith(".jar");
                        const isSelected = selectedPaths.has(file.path);

                        return (
                          <div
                            key={file.path}
                            onClick={() => toggleFile(file.path)}
                            className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors text-xs group border border-transparent ${isSelected ? "bg-accent/40 border-primary/10" : "hover:bg-accent/30"}`}
                          >
                            <Checkbox checked={isSelected} onCheckedChange={() => toggleFile(file.path)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />

                            <div className={`p-1 rounded-md shrink-0 ${isJar ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"}`}>{isJar ? <Box className="w-3 h-3" /> : <File className="w-3 h-3" />}</div>

                            <div className="flex-1 min-w-0">
                              <p className={`truncate font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>{fileName}</p>
                              <p className="text-muted-foreground text-[10px] truncate opacity-60">{file.path}</p>
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
