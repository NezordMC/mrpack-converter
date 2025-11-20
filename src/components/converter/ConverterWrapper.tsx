import { useState } from "react";
import Dropzone from "./Dropzone";
import PackDetails from "./PackDetails";
import { Progress } from "@/components/ui/progress";
import { ConverterEngine } from "@/lib/converter-engine";
import type { ModrinthManifest } from "@/lib/types";
import { Loader2, Terminal } from "lucide-react";

export default function ConverterWrapper() {
  const [manifest, setManifest] = useState<ModrinthManifest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const [progress, setProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState("Initializing...");
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      setRawFile(file);

      const data = await ConverterEngine.readManifest(file);
      setManifest(data);
    } catch (err) {
      console.error(err);
      setError("Failed to parse .mrpack file. Is it valid?");
    } finally {
      setIsLoading(false);
    }
  };

  const [rawFile, setRawFile] = useState<File | null>(null);

  const handleStartConversion = async () => {
    if (!manifest || !rawFile) return;

    setIsConverting(true);
    setProgress(0);

    try {
      await ConverterEngine.convert(rawFile, manifest, (log, prog) => {
        setCurrentLog(log);
        setProgress(prog);
      });
    } catch (err) {
      setError("Conversion failed. Check console for details.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleCancel = () => {
    setManifest(null);
    setError(null);
    setRawFile(null);
    setIsConverting(false);
  };

  if (isConverting) {
    return (
      <div className="w-full max-w-xl bg-card border rounded-xl p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold animate-pulse">Converting Pack...</h3>
          <p className="text-muted-foreground">Please do not close this tab.</p>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>{Math.round(progress)}%</span>
            <span>{manifest?.files.length} files</span>
          </div>
        </div>

        <div className="bg-black/80 rounded-lg p-4 font-mono text-xs text-green-400 h-24 overflow-hidden flex flex-col justify-end border border-white/10">
          <div className="flex items-center gap-2 opacity-50 mb-1">
            <Terminal className="w-3 h-3" />
            <span>Logs</span>
          </div>
          <p className="truncate">&gt; {currentLog}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Reading modpack manifest...</p>
      </div>
    );
  }

  if (manifest) {
    return <PackDetails manifest={manifest} onStartConversion={handleStartConversion} onCancel={handleCancel} />;
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      <Dropzone onFileSelect={handleFileSelect} isProcessing={isLoading} />
      {error && <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-center text-sm font-medium border border-destructive/20">{error}</div>}
    </div>
  );
}
