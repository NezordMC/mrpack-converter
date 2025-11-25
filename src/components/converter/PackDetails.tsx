import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Layers, Gamepad2, ArrowRight, Search, File, ChevronDown, ChevronUp, CheckSquare, Server, CheckCircle, Globe, Monitor, Shield, Filter, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ModrinthManifest, ModrinthFile, ServerScriptOptions } from "@/lib/types";
import ServerScriptConfig from "./ServerScriptConfig";
import FileInjector from "./FileInjector";

interface PackDetailsProps {
  manifest: ModrinthManifest;
  onStartConversion: (filteredManifest: ModrinthManifest, isServerMode: boolean, selectedLoader: string, useCorsProxy: boolean, scriptOptions?: ServerScriptOptions, injectedFiles?: File[]) => void;
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

type FileEnvStatus = "client" | "server" | "both" | "unknown";

const getFileEnvStatus = (file: ModrinthFile): FileEnvStatus => {
  if (!file.env) return "unknown";
  const { client, server } = file.env;

  if (client === "required" && server === "unsupported") return "client";
  if (client === "unsupported" && server === "required") return "server";
  if (server === "unsupported") return "client";
  return "both";
};

const EnvBadge = ({ status, className }: { status: string; className?: string }) => {
  const styles = {
    required: "bg-red-500/10 text-red-500 border-red-500/20",
    optional: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    unsupported: "bg-muted text-muted-foreground border-border",
  };

  const label = status === "unsupported" ? "No" : status === "required" ? "Req" : "Opt";
  const style = styles[status as keyof typeof styles] || styles.unsupported;

  return <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-mono uppercase tracking-tight", style, className)}>{label}</span>;
};

export default function PackDetails({ manifest, onStartConversion, onCancel }: PackDetailsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [isServerMode, setIsServerMode] = useState(false);
  const [useCorsProxy, setUseCorsProxy] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "selected" | "excluded" | "client-only">("all");
  const [isFileListOpen, setIsFileListOpen] = useState(true);
  const [scriptOptions, setScriptOptions] = useState<ServerScriptOptions | undefined>(undefined);
  const [injectedFiles, setInjectedFiles] = useState<File[]>([]);

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

  const handleServerModeToggle = (checked: boolean) => {
    setIsServerMode(checked);
    if (checked) {
      const serverFriendlyFiles = new Set<string>();
      manifest.files.forEach((f) => {
        const fileName = f.path.split("/").pop()?.toLowerCase() || "";
        const envStatus = getFileEnvStatus(f);

        const isExplicitClient = envStatus === "client";
        const isKeywordClient = CLIENT_KEYWORDS.some((keyword) => fileName.includes(keyword));

        if (!isExplicitClient && !isKeywordClient) {
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

  const filteredFiles = useMemo(() => {
    return manifest.files.filter((f) => {
      const matchesSearch = f.path.toLowerCase().includes(searchTerm.toLowerCase());
      const isSelected = selectedPaths.has(f.path);
      const envStatus = getFileEnvStatus(f);
      const fileName = f.path.split("/").pop()?.toLowerCase() || "";
      const isKeywordClient = CLIENT_KEYWORDS.some((k) => fileName.includes(k));

      if (!matchesSearch) return false;

      if (filterMode === "selected") return isSelected;
      if (filterMode === "excluded") return !isSelected;
      if (filterMode === "client-only") return envStatus === "client" || isKeywordClient;

      return true;
    });
  }, [manifest.files, searchTerm, selectedPaths, filterMode]);

  const selectedCount = selectedPaths.size;
  const totalCount = manifest.files.length;
  const totalSize = manifest.files.filter((f) => selectedPaths.has(f.path)).reduce((acc, f) => acc + f.fileSize, 0);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl mx-auto space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Globe className="w-4 h-4 text-blue-500" />
              <span>{totalCount} Files</span>
            </div>
          </div>
        </div>

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

        <div className="md:col-span-2 bg-card border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
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
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-4">
                <div className="pt-4 border-t">
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

                {/* Insert Config Component Here */}
                <ServerScriptConfig defaultJarName={selectedLoader} onChange={setScriptOptions} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md transition-colors ${useCorsProxy ? "bg-purple-500/20 text-purple-500" : "bg-muted text-muted-foreground"}`}>
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Use CORS Proxy</h3>
                <p className="text-xs text-muted-foreground">Fixes download errors for external files</p>
              </div>
            </div>
            <Switch id="cors-proxy" checked={useCorsProxy} onCheckedChange={setUseCorsProxy} />
          </div>

          <div className="pt-4 border-t border-dashed">
             <FileInjector files={injectedFiles} onFilesChange={setInjectedFiles} />
          </div>
        </div>

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
          <Button
            onClick={() => onStartConversion({ ...manifest, files: manifest.files.filter((f) => selectedPaths.has(f.path)) }, isServerMode, selectedLoader, useCorsProxy, scriptOptions, injectedFiles)}
            size="lg"
            disabled={selectedCount === 0}
            className="w-full gap-2 shadow-lg shadow-primary/20"
          >
            {isServerMode ? "Generate Server Pack" : "Convert to ZIP"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* File List Section */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search files..." className="pl-9 bg-background h-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => setIsFileListOpen(!isFileListOpen)}>
              {isFileListOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            <div className="flex bg-muted rounded-lg p-1 shrink-0">
              {(["all", "selected", "excluded", "client-only"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={cn("px-3 py-1 rounded-md text-xs font-medium capitalize transition-all", filterMode === mode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  {mode.replace("-", " ")}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="h-8 text-xs shrink-0">
              {selectedPaths.size === manifest.files.length ? "Unselect All" : "Select All"}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isFileListOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => {
                    const fileName = file.path.split("/").pop() || "";
                    const isJar = fileName?.endsWith(".jar");
                    const isSelected = selectedPaths.has(file.path);
                    const envStatus = getFileEnvStatus(file);
                    const isKeywordClient = CLIENT_KEYWORDS.some((k) => fileName.toLowerCase().includes(k));

                    return (
                      <div
                        key={file.path}
                        onClick={() => toggleFile(file.path)}
                        className={cn(
                          "group flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-all",
                          isSelected ? "bg-background border-border hover:border-primary/30" : "bg-muted/30 border-transparent hover:bg-muted/50 opacity-60 hover:opacity-80"
                        )}
                      >
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleFile(file.path)} />

                        <div className={cn("p-2 rounded-md shrink-0 transition-colors", isJar ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500")}>{isJar ? <Box className="w-4 h-4" /> : <File className="w-4 h-4" />}</div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center gap-2">
                            <p className={cn("truncate font-medium text-sm transition-colors", isSelected ? "text-foreground" : "text-muted-foreground line-through decoration-border")}>{fileName}</p>
                            {isKeywordClient && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 font-mono border border-yellow-500/20 flex items-center gap-1">
                                <Monitor className="w-3 h-3" /> Client
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate opacity-60 font-mono">{file.path}</p>
                        </div>

                        {file.env && (
                          <div className="hidden sm:flex items-center gap-2 mr-2">
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Cli</span>
                                <EnvBadge status={file.env.client} />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Srv</span>
                                <EnvBadge status={file.env.server} />
                              </div>
                            </div>
                          </div>
                        )}

                        <span className="text-xs text-muted-foreground font-mono shrink-0 bg-muted px-2 py-1 rounded w-[70px] text-right">{formatBytes(file.fileSize)}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-3">
                    <Filter className="w-8 h-8 opacity-20" />
                    <p>No files match the current filter</p>
                    {filterMode !== "all" && (
                      <Button variant="link" onClick={() => setFilterMode("all")} className="h-auto p-0">
                        Clear filters
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center pt-4">
        <Button variant="ghost" onClick={onCancel} className="text-muted-foreground hover:text-destructive gap-2">
          <XCircle className="w-4 h-4" />
          Cancel Selection
        </Button>
      </div>
    </motion.div>
  );
}
