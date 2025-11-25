import { useState, useEffect } from "react";
import { History, Clock, Trash2, Server, Monitor, Box, Copy, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { getHistory, clearHistory, removeFromHistory } from "@/lib/history";
import type { ConversionHistoryItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function HistoryPanel({ refreshTrigger }: { refreshTrigger: number }) {
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadHistory = () => {
    setHistory(getHistory());
  };

  useEffect(() => {
    loadHistory();
  }, [refreshTrigger]);

  const handleClear = () => {
    clearHistory();
    loadHistory();
  };

  const handleRemoveItem = (id: string) => {
    removeFromHistory(id);
    loadHistory();
  };

  const handleCopyName = async (item: ConversionHistoryItem) => {
    try {
      await navigator.clipboard.writeText(item.fileName);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  if (history.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full mt-6 pt-6 border-t border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <History className="w-4 h-4" />
          <h3>Recent Conversions</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClear} className="h-7 text-xs text-muted-foreground hover:text-destructive">
          <Trash2 className="w-3 h-3 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <AnimatePresence mode="popLayout">
          {history.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={() => handleCopyName(item)}
              className="group relative bg-muted/30 border border-border/50 rounded-lg p-3 flex items-center justify-between gap-3 hover:bg-muted/60 transition-all cursor-pointer hover:border-primary/20 active:scale-[0.99]"
              title="Click to copy filename"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={cn("p-2 rounded-md shrink-0 transition-colors", item.mode === "server" ? "bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20" : "bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20")}>
                  {item.mode === "server" ? <Server className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm truncate">{item.name}</h4>
                    {copiedId === item.id && (
                      <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-green-500 flex items-center gap-1 bg-green-500/10 px-1.5 rounded">
                        <Check className="w-3 h-3" /> Copied!
                      </motion.span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded opacity-70">{item.version}</span>
                    <span className="opacity-30">•</span>
                    <span className="flex items-center gap-1 opacity-70">
                      <Clock className="w-3 h-3" />
                      {new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveItem(item.id);
                  }}
                  title="Remove from history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>

                <div className="h-7 w-7 flex items-center justify-center text-muted-foreground/30 group-hover:text-primary transition-colors">{copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
