import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Layers, Gamepad2, ArrowRight, FileCode, Search, File, ChevronDown, ChevronUp, CheckSquare, Server, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { ModrinthManifest } from "@/lib/types";

interface PackDetailsProps {
  manifest: ModrinthManifest;
  onStartConversion: (filteredManifest: ModrinthManifest, isServerMode: boolean, selectedLoader: string) => void;
  onCancel: () => void;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const CLIENT_KEYWORDS = [
  "sodium",
  "iris",
  "optifine",
  "zoomify",
  "modmenu",
  "authme",
  "skin",
  "capes",
  "shader",
  "toast",
  "xaero",
  "journey",
  "rei",
  "jei",
  "emi",
  "jade",
  "wthit",
  "appleskin",
  "controlling",
  "mouse",
  "catalogue",
  "lazydfu",
  "ferrite",
  "krypton",
  "dashloader",
  "sound",
  "ambient",
  "music",
  "blur",
  "gamma",
  "fullbright",
  "dynamiclights",
  "entityculling",
  "indium",
  "continuity",
  "cit",
  "cem",
  "3dskin",
  "physics",
  "presence",
  "notenoughanimations",
  "freecam",
];

export default function PackDetails({ manifest, onStartConversion, onCancel }: PackDetailsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFiles, setShowFiles] = useState(false);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [isServerMode, setIsServerMode] = useState(false);

  const availableLoaders = [
    manifest.dependencies["fabric-loader"] ? "fabric-server-launch.jar" : null,
    manifest.dependencies["forge"] ? "forge-server.jar" : null,
    manifest.dependencies["neo-forge"] ? "neoforge-server.jar" : null,
    "server.jar",
  ].filter(Boolean) as string[];

  const [selectedLoader, setSelectedLoader] = useState<string>(availableLoaders[0] || "server.jar");

  useEffect(() => {
    const allPaths = new Set(manifest.files.map((f) => f.path));
    setSelectedPaths(allPaths);
  }, [manifest]);

  const filteredFiles = manifest.files.filter((f) => f.path.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleServerModeToggle = (checked: boolean) => {
    setIsServerMode(checked);
    if (checked) {
      const serverFriendlyFiles = new Set<string>();
      manifest.files.forEach((f) => {
        const fileName = f.path.split("/").pop()?.toLowerCase() || "";
        const isMarkedUnsupported = f.env?.server === "unsupported";
        const isKeywordClientOnly = CLIENT_KEYWORDS.some((keyword) => fileName.includes(keyword));
        const isClientOnly = isMarkedUnsupported || isKeywordClientOnly;

        if (!isClientOnly) {
          serverFriendlyFiles.add(f.path);
        }
      });
      setSelectedPaths(serverFriendlyFiles);
    } else {
      setSelectedPaths(new Set(manifest.files.map((f) => f.path)));
    }
  };

  const toggleFile = (path: string) => {
    const next = new Set(selectedPaths);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setSelectedPaths(next);
  };

  const toggleSelectAll = () => {
    if (selectedPaths.size === manifest.files.length) setSelectedPaths(new Set());
    else setSelectedPaths(new Set(manifest.files.map((f) => f.path)));
  };

  const handleConvertClick = () => {
    const finalFiles = manifest.files.filter((f) => selectedPaths.has(f.path));
    const newManifest = { ...manifest, files: finalFiles };
    onStartConversion(newManifest, isServerMode, selectedLoader);
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

      <div className="p-6 pb-4 bg-card flex flex-col gap-4">
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md transition-colors ${isServerMode ? "bg-orange-500/20 text-orange-500" : "bg-orange-500/10 text-orange-500"}`}>
              <Server className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="server-mode" className="text-sm font-medium cursor-pointer">
                Server Pack Mode
              </Label>
              <p className="text-[10px] text-muted-foreground">Auto-remove client mods & generate scripts</p>
            </div>
          </div>
          <Switch id="server-mode" checked={isServerMode} onCheckedChange={handleServerModeToggle} />
        </div>

        {isServerMode && (
          <div className="p-3 border rounded-lg bg-muted/30 space-y-2 animate-in fade-in slide-in-from-top-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Target Loader File</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableLoaders.map((loader) => (
                <div
                  key={loader}
                  onClick={() => setSelectedLoader(loader)}
                  className={`cursor-pointer border rounded px-3 py-2 text-xs flex items-center justify-between transition-all ${
                    selectedLoader === loader ? "border-primary bg-primary/5 text-primary shadow-sm" : "hover:bg-accent/50 bg-background"
                  }`}
                >
                  <span className="font-mono truncate" title={loader}>
                    {loader}
                  </span>
                  {selectedLoader === loader && <CheckCircle className="w-3 h-3" />}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">This filename will be used in start.bat/start.sh</p>
          </div>
        )}

        <Button onClick={handleConvertClick} size="lg" disabled={selectedCount === 0} className="w-full gap-2 text-lg shadow-lg shadow-primary/20 transition-all">
          {selectedCount === 0 ? "Select files to convert" : isServerMode ? "Generate Server Pack" : "Convert to ZIP"}
          <ArrowRight className="w-5 h-5" />
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
                      filteredFiles.map((file) => {
                        const fileName = file.path.split("/").pop() || "";
                        const isJar = fileName?.endsWith(".jar");
                        const isSelected = selectedPaths.has(file.path);
                        const isMarkedUnsupported = file.env?.server === "unsupported";
                        const isKeywordClientOnly = CLIENT_KEYWORDS.some((k) => fileName.toLowerCase().includes(k));
                        const isLikelyClient = isMarkedUnsupported || isKeywordClientOnly;

                        return (
                          <div
                            key={file.path}
                            onClick={() => toggleFile(file.path)}
                            className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors text-xs group border border-transparent ${isSelected ? "bg-accent/40 border-primary/10" : "hover:bg-accent/30"} ${
                              !isSelected && isLikelyClient && isServerMode ? "opacity-50 grayscale-[0.5]" : ""
                            }`}
                          >
                            <Checkbox checked={isSelected} onCheckedChange={() => toggleFile(file.path)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                            <div className={`p-1 rounded-md shrink-0 ${isJar ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"}`}>{isJar ? <Box className="w-3 h-3" /> : <File className="w-3 h-3" />}</div>
                            <div className="flex-1 min-w-0">
                              <p className={`truncate font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>{fileName}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-muted-foreground text-[10px] truncate opacity-60">{file.path}</p>
                                {isLikelyClient && <span className="text-[9px] px-1.5 py-0 rounded bg-red-500/10 text-red-500 font-mono border border-red-500/20">CLIENT MOD</span>}
                              </div>
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
