import { useState, useEffect } from "react";
import { Settings2, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import type { ServerScriptOptions } from "@/lib/types";

interface ServerScriptConfigProps {
  defaultJarName: string;
  onChange: (options: ServerScriptOptions) => void;
}

export default function ServerScriptConfig({ defaultJarName, onChange }: ServerScriptConfigProps) {
  const [config, setConfig] = useState<ServerScriptOptions>({
    minRam: 4,
    maxRam: 8,
    javaFlags: "-XX:+UseG1GC -Dsun.rmi.dgc.server.gcInterval=2147483646 -XX:+UnlockExperimentalVMOptions -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M",
    serverJarName: defaultJarName,
  });

  useEffect(() => {
    setConfig((prev) => ({ ...prev, serverJarName: defaultJarName }));
  }, [defaultJarName]);

  useEffect(() => {
    onChange(config);
  }, [config, onChange]);

  const handleChange = (key: keyof ServerScriptOptions, value: string | number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="pt-4 border-t border-dashed">
      <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-primary">
        <Settings2 className="w-4 h-4" />
        <span>Startup Script Configuration</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Min RAM (GB)</Label>
          <Input type="number" min={1} value={config.minRam} onChange={(e) => handleChange("minRam", parseInt(e.target.value) || 1)} className="bg-background font-mono" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Max RAM (GB)</Label>
          <Input type="number" min={1} value={config.maxRam} onChange={(e) => handleChange("maxRam", parseInt(e.target.value) || 1)} className="bg-background font-mono" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Server JAR Filename</Label>
          <Input value={config.serverJarName} onChange={(e) => handleChange("serverJarName", e.target.value)} className="bg-background font-mono" placeholder="server.jar" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Java Flags (Aikar's optimized flags default)</Label>
            <Info className="w-3 h-3 text-muted-foreground" title="Advanced Java arguments" />
          </div>
          <Input value={config.javaFlags} onChange={(e) => handleChange("javaFlags", e.target.value)} className="bg-background font-mono text-xs" />
        </div>
      </div>
    </motion.div>
  );
}
