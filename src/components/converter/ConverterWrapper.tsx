import { useState } from "react";
import Dropzone from "./Dropzone";
import PackDetails from "./PackDetails";
import { Progress } from "@/components/ui/progress";
import { ConverterEngine } from "@/lib/converter-engine";
import type { ModrinthManifest } from "@/lib/types";
import { Loader2, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, RefreshCcw } from "lucide-react";

export default function ConverterWrapper() {
  const [manifest, setManifest] = useState<ModrinthManifest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const [progress, setProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState("Initializing...");
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

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

  const handleStartConversion = async (manifestOverride?: ModrinthManifest) => {
    const targetManifest = manifestOverride || manifest;

    if (!targetManifest || !rawFile) return;

    setIsConverting(true);
    setIsDone(false);
    setProgress(0);

    try {
      await ConverterEngine.convert(rawFile, targetManifest, (log, prog) => {
        setCurrentLog(log);
        setProgress(prog);
      });
      setIsDone(true);
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

  const handleReset = () => {
    setManifest(null);
    setRawFile(null);
    setIsDone(false);
    setError(null);
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

  if (isDone) {
    return (
      <div className="w-full max-w-xl bg-card border border-green-500/20 rounded-xl p-8 space-y-6 shadow-2xl text-center animate-in zoom-in-95 duration-300">
        <div className="flex justify-center">
          <div className="p-4 bg-green-500/10 rounded-full text-green-500 ring-1 ring-green-500/20">
            <CheckCircle2 className="w-12 h-12" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-foreground">Conversion Complete!</h3>
          <p className="text-muted-foreground">Your download should have started automatically.</p>
        </div>

        <div className="flex gap-3 justify-center pt-4">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            Convert Another
          </Button>
          <Button variant="secondary" onClick={() => alert("Cek folder download browser Anda!")} className="gap-2">
            <Download className="w-4 h-4" />
            Download Again
          </Button>
        </div>
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
