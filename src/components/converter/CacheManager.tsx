import { useState, useEffect } from "react";
import { Database, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CACHE_NAME } from "@/lib/constants";
import { formatBytes } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CacheManager() {
  const [stats, setStats] = useState<{ count: number; size: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  const checkCache = async () => {
    setIsLoading(true);
    try {
      if (!("caches" in window)) return;

      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      let totalSize = 0;

      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const length = response.headers.get("content-length");
          if (length) {
            totalSize += parseInt(length, 10);
          }
        }
      }

      setStats({ count: keys.length, size: totalSize });
    } catch (error) {
      console.error("Failed to check cache:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async () => {
    setIsClearing(true);
    try {
      if ("caches" in window) {
        await caches.delete(CACHE_NAME);
        await checkCache();
      }
    } catch (error) {
      console.error("Failed to clear cache:", error);
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    checkCache();
  }, []);

  if (!stats || stats.count === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full mt-6 pt-6 border-t border-border/50">
      <div className="bg-muted/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium text-sm">Offline Cache Storage</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>{stats.count} files cached</span>
              <span>•</span>
              <span>~{formatBytes(stats.size)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="ghost" size="sm" onClick={checkCache} disabled={isLoading} className="h-8">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="destructive" size="sm" onClick={clearCache} disabled={isClearing} className="h-8 gap-2 flex-1 sm:flex-none text-xs">
            {isClearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Clear Storage
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
