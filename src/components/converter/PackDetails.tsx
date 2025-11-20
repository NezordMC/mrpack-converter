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

  const selectedCount = selectedPaths.size;
  const totalCount = manifest.files.length;
  const isAllSelected = selectedCount === totalCount;

  const totalSize = manifest.files.filter((f) => selectedPaths.has(f.path)).reduce((acc, f) => acc + f.fileSize, 0);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl mx-auto space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metadata Card */}
        <div className="md:col-span-2 bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Box className="w-24 h-24" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-foreground tracking-tight">{manifest.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono border border-primary/20">v{manifest.versionId}</span>
            </div>
            <p className="text-muted-foreground line-clamp-2 max-w-md">{manifest.summary || "No description provided for this modpack."}</p>
          </div>
          <div className="mt-6 flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Valid Manifest</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Ready to Convert</span>
            </div>
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-4 flex flex-col">
          <div className="flex-1 bg-card border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase">Minecraft</p>
              <p className="font-mono font-semibold">{manifest.dependencies.minecraft}</p>
            </div>
          </div>
          <div className="flex-1 bg-card border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg text-green-500">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase">Loader</p>
              <p className="font-mono font-semibold capitalize">{manifest.dependencies["fabric-loader"] ? "Fabric" : manifest.dependencies.forge ? "Forge" : manifest.dependencies["neo-forge"] ? "NeoForge" : "Unknown"}</p>
            </div>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="md:col-span-2 bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md transition-colors ${isServerMode ? "bg-orange-500/20 text-orange-500" : "bg-muted text-muted-foreground"}`}>
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Server Pack Mode</h3>
                <p className="text-xs text-muted-foreground">Optimize for server deployment</p>
              </div>
            </div>
            <Switch id="server-mode" checked={isServerMode} onCheckedChange={handleServerModeToggle} />
          </div>

          <AnimatePresence>
            {isServerMode && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="pt-4 border-t mt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Select Server Loader</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableLoaders.map((loader) => (
                      <div
                        key={loader}
                        onClick={() => setSelectedLoader(loader)}
                        className={`cursor-pointer border rounded-lg px-4 py-3 text-sm flex items-center justify-between transition-all ${
                          selectedLoader === loader ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20" : "hover:bg-accent/50 bg-background"
                        }`}
                      >
                        <span className="font-mono truncate" title={loader}>
                          {loader}
                        </span>
                        {selectedLoader === loader && <CheckCircle className="w-4 h-4" />}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Card */}
        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col justify-center space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Selected Files</span>
              <span className="font-mono">
                {selectedCount} / {totalCount}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Size</span>
              <span className="font-mono">{formatBytes(totalSize)}</span>
            </div>
          </div>
          <Button onClick={handleConvertClick} size="lg" disabled={selectedCount === 0} className="w-full gap-2 shadow-lg shadow-primary/20">
            {isServerMode ? "Generate Server Pack" : "Convert to ZIP"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* File List Section */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <button onClick={() => setShowFiles(!showFiles)} className="w-full flex items-center justify-between p-4 hover:bg-accent/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <FileCode className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-sm">Pack Contents</h3>
              <p className="text-xs text-muted-foreground">Customize which files to include</p>
            </div>
          </div>
          {showFiles ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </button>

        <AnimatePresence>
          {showFiles && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t">
              <div className="p-4 space-y-4 bg-muted/5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search files..." className="pl-9 bg-background" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <Button variant="outline" onClick={toggleSelectAll} className="gap-2">
                    <CheckSquare className={`w-4 h-4 ${isAllSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="hidden sm:inline">Select All</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all ${isSelected ? "bg-background border-primary/30 shadow-sm" : "bg-muted/30 border-transparent hover:bg-muted/50"} ${
                            !isSelected && isLikelyClient && isServerMode ? "opacity-50 grayscale" : ""
                          }`}
                        >
                          <Checkbox checked={isSelected} onCheckedChange={() => toggleFile(file.path)} />
                          <div className={`p-2 rounded-md shrink-0 ${isJar ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"}`}>{isJar ? <Box className="w-4 h-4" /> : <File className="w-4 h-4" />}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`truncate font-medium text-sm ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>{fileName}</p>
                              {isLikelyClient && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-mono border border-red-500/20">CLIENT</span>}
                            </div>
                            <p className="text-xs text-muted-foreground truncate opacity-70 font-mono">{file.path}</p>
                          </div>
                          <span className="text-xs text-muted-foreground font-mono shrink-0 bg-muted px-2 py-1 rounded">{formatBytes(file.fileSize)}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No files found matching "{searchTerm}"</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center pt-4">
        <Button variant="ghost" onClick={onCancel} className="text-muted-foreground hover:text-destructive">
          Cancel Selection
        </Button>
      </div>
    </motion.div>
  );
}
