import { useState, useRef } from "react";
import { Search, X, ChevronDown, Loader2, Package, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModpackFinderProps {
  onUrlSubmit: (url: string) => void;
  isProcessing?: boolean;
}

interface SearchResult {
  project_id: string;
  title: string;
  description: string;
  icon_url: string;
  author: string;
  follows: number;
  slug: string;
}

interface ProjectVersion {
  id: string;
  name: string;
  version_number: string;
  game_versions: string[];
  loaders: string[];
  files: {
    url: string;
    primary: boolean;
    filename: string;
  }[];
  version_type: "release" | "beta" | "alpha";
  date_published: string;
}

export default function ModpackFinder({ onUrlSubmit, isProcessing }: ModpackFinderProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPack, setSelectedPack] = useState<SearchResult | null>(null);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

  // Selection state
  const [selectedMcVersion, setSelectedMcVersion] = useState<string>("");
  const [availableMcVersions, setAvailableMcVersions] = useState<string[]>([]);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.modrinth.com/v2/search?query=${encodeURIComponent(value)}&facets=[["project_type:modpack"]]&limit=5`);
        if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);

        const data = await res.json();
        if (data && Array.isArray(data.hits)) {
          setResults(data.hits);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Failed to search modpacks:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelectPack = async (pack: SearchResult) => {
    setSelectedPack(pack);
    setIsLoadingVersions(true);
    setVersions([]);
    setSelectedMcVersion("");

    try {
      const res = await fetch(`https://api.modrinth.com/v2/project/${pack.project_id}/version`);
      const data: ProjectVersion[] = await res.json();

      // Filter for .mrpack files only
      const validVersions = data.filter((v) => v.files.some((f) => f.filename.endsWith(".mrpack")));

      setVersions(validVersions);

      // Extract unique MC versions
      const mcVersions = Array.from(new Set(validVersions.flatMap((v) => v.game_versions))).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

      setAvailableMcVersions(mcVersions);
      if (mcVersions.length > 0) {
        setSelectedMcVersion(mcVersions[0]);
      }
    } catch (error) {
      console.error("Failed to fetch versions:", error);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleConvert = () => {
    if (!selectedPack || !selectedMcVersion) return;

    // Find best version for selected MC version
    // Priority: Release > Beta > Alpha
    const compatibleVersions = versions.filter((v) => v.game_versions.includes(selectedMcVersion));

    if (compatibleVersions.length === 0) return;

    const bestVersion = compatibleVersions.find((v) => v.version_type === "release") || compatibleVersions.find((v) => v.version_type === "beta") || compatibleVersions[0];

    const file = bestVersion.files.find((f) => f.filename.endsWith(".mrpack")) || bestVersion.files[0];

    if (file) {
      onUrlSubmit(file.url);
    }
  };

  const clearSelection = () => {
    setSelectedPack(null);
    setVersions([]);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border/50">
      <div className="flex items-center gap-2 text-lg font-semibold text-foreground/90">
        <Search className="w-5 h-5 text-primary" />
        <h3>Find Modpack</h3>
      </div>

      {!selectedPack ? (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search modpacks (e.g. Fabulously Optimized)..." className="pl-9" value={query} onChange={(e) => handleSearch(e.target.value)} disabled={isProcessing} />
            {isSearching && (
              <div className="absolute right-3 top-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {Array.isArray(results) &&
                results.map((result) => (
                  <motion.div
                    key={result.project_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="group flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/50 hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => handleSelectPack(result)}
                  >
                    {result.icon_url ? (
                      <img src={result.icon_url} alt={result.title} className="w-12 h-12 rounded-lg object-cover bg-muted" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{result.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground/70">
                        <span>by {result.author}</span>
                        <span>•</span>
                        <span>{result.follows} follows</span>
                      </div>
                    </div>

                    <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Select
                    </Button>
                  </motion.div>
                ))}
            </AnimatePresence>

            {query && results.length === 0 && !isSearching && <div className="text-center py-8 text-muted-foreground text-sm">No modpacks found for "{query}"</div>}
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-background/50 rounded-xl border border-border p-4 space-y-4">
          <div className="flex items-start gap-4">
            {selectedPack.icon_url ? (
              <img src={selectedPack.icon_url} alt={selectedPack.title} className="w-16 h-16 rounded-xl shadow-sm" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg">{selectedPack.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{selectedPack.description}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={clearSelection} className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Minecraft Version</label>
              {isLoadingVersions ? (
                <div className="h-10 w-full bg-muted/50 animate-pulse rounded-md" />
              ) : (
                <div className="relative">
                  <select
                    className="w-full h-10 pl-3 pr-10 bg-background border border-input rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    value={selectedMcVersion}
                    onChange={(e) => setSelectedMcVersion(e.target.value)}
                    disabled={isProcessing}
                  >
                    {availableMcVersions.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                </div>
              )}
            </div>

            <Button className="w-full gap-2" onClick={handleConvert} disabled={isProcessing || isLoadingVersions || !selectedMcVersion}>
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Convert {selectedPack.title} {selectedMcVersion}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
