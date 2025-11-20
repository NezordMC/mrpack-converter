import { motion } from "framer-motion";
import { Box, Layers, Gamepad2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ModrinthManifest } from "@/lib/types";

interface PackDetailsProps {
  manifest: ModrinthManifest;
  onStartConversion: () => void;
  onCancel: () => void;
}

export default function PackDetails({ manifest, onStartConversion, onCancel }: PackDetailsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl bg-card border rounded-xl overflow-hidden shadow-xl"
    >
      {/* Header Modpack */}
      <div className="p-6 border-b bg-muted/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{manifest.name}</h2>
            <p className="text-muted-foreground text-sm mt-1">v{manifest.versionId}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <Box className="w-6 h-6" />
          </div>
        </div>
        
        {/* Summary Description */}
        {manifest.summary && (
          <p className="mt-4 text-sm text-muted-foreground/80 leading-relaxed border-l-2 border-primary/30 pl-3">
            {manifest.summary}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-px bg-border">
        <div className="bg-card p-4 flex items-center gap-3">
          <Gamepad2 className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase">Minecraft</p>
            <p className="font-semibold">{manifest.dependencies.minecraft}</p>
          </div>
        </div>
        <div className="bg-card p-4 flex items-center gap-3">
          <Layers className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase">Loader</p>
            <p className="font-semibold">
              {manifest.dependencies["fabric-loader"] ? "Fabric" : 
               manifest.dependencies.forge ? "Forge" : 
               manifest.dependencies["neo-forge"] ? "NeoForge" : "Unknown"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-muted/50 flex items-center justify-between gap-3 border-t text-sm">
        <span className="text-muted-foreground">Contains <strong>{manifest.files.length}</strong> mods/files</span>
      </div>

      {/* Actions */}
      <div className="p-6 flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onStartConversion} className="gap-2">
          Convert to ZIP <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
