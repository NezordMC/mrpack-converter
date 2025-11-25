import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Dropzone from "./Dropzone";
import ModpackFinder from "./ModpackFinder";
import PackDetails from "./PackDetails";
import CacheManager from "./CacheManager";
import { Progress } from "@/components/ui/progress";
import { ConverterEngine } from "@/lib/converter-engine";
import type { ModrinthManifest } from "@/lib/types";
import { Loader2, Terminal, CheckCircle2, Download, RefreshCcw, AlertCircle, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConverterWrapper() {
  const [manifest, setManifest] = useState<ModrinthManifest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(0);
  const [currentLog, setCurrentLog] = useState("Initializing...");
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [rawFile, setRawFile] = useState<File | null>(null);

  useEffect(() => {
    if (isDone && "vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }, [isDone]);

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      setRawFile(file);
      const data = await ConverterEngine.readManifest(file);
      setManifest(data);
    } catch (err) {
      console.error(err);
      setError("Failed to parse .mrpack file. Ensure it is a valid Modrinth Modpack.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    processFile(file);
  };

  const handleUrlSubmit = async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const file = await ConverterEngine.downloadFileFromUrl(url);
      processFile(file);
    } catch (err) {
      console.error(err);
      setError("Failed to download. Check CORS or try downloading the file manually first.");
      setIsLoading(false);
    }
  };

  const handleStartConversion = async (manifestOverride?: ModrinthManifest, isServerMode: boolean = false, selectedLoader: string = "server.jar", useCorsProxy: boolean = false) => {
    const targetManifest = manifestOverride || manifest;
    if (!targetManifest || !rawFile) return;

    setIsConverting(true);
    setIsDone(false);
    setIsPaused(false);
    setProgress(0);
    setEta(0);
    setError(null);

    try {
      await ConverterEngine.convert(
        rawFile,
        targetManifest,
        (log, prog, estimatedTime) => {
          setCurrentLog(log);
          setProgress(prog);
          setEta(estimatedTime);
        },
        { serverMode: isServerMode, selectedLoader, useCorsProxy } 
      );
      setIsDone(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred during conversion.");
      setIsConverting(false);
    } finally {
      setIsConverting(false);
      setIsPaused(false);
    }
  };

  const togglePause = () => {
    if (isPaused) {
      ConverterEngine.resume();
      setIsPaused(false);
    } else {
      ConverterEngine.pause();
      setIsPaused(true);
    }
  };

  const handleCancel = () => {
    ConverterEngine.terminate();
    setManifest(null);
    setError(null);
    setRawFile(null);
    setIsConverting(false);
    setIsPaused(false);
  };

  const handleReset = () => {
    setManifest(null);
    setRawFile(null);
    setIsDone(false);
    setError(null);
    setProgress(0);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || seconds === Infinity) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isConverting) {
    return (
      <>
        <motion.div className="fixed top-0 left-0 h-1 bg-primary z-50" initial={{ width: "0%" }} animate={{ width: `${progress}%` }} transition={{ ease: "linear" }} />
        <div className="w-full max-w-xl bg-card border rounded-xl p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
              {isPaused ? "Conversion Paused" : "Converting Pack..."}
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-ping" />
            </h3>
            <p className="text-muted-foreground text-sm">{isPaused ? "Click resume to continue." : "Please do not close this tab."}</p>
          </div>

          <div className="space-y-2">
            <Progress value={progress} className={`h-3 transition-all ${isPaused ? "opacity-50" : ""}`} />
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>{Math.round(progress)}%</span>
              <span>ETA: {formatTime(eta)}</span>
            </div>
          </div>

          <div className="bg-zinc-950 rounded-lg p-4 font-mono text-xs text-green-400 h-32 overflow-y-auto flex flex-col-reverse border border-white/10 shadow-inner relative">
            {isPaused && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
                <Pause className="w-8 h-8 text-white opacity-50" />
              </div>
            )}
            <p className="break-all">&gt; {currentLog}</p>
            <div className="flex items-center gap-2 opacity-50 mb-2 border-b border-white/10 pb-1">
              <Terminal className="w-3 h-3" />
              <span>Worker Logs</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleCancel} className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10">
              Cancel
            </Button>
            <Button onClick={togglePause} className="flex-1 gap-2" variant={isPaused ? "default" : "secondary"}>
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Reading modpack structure...</p>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="w-full max-w-xl bg-card border border-green-500/20 rounded-xl p-8 space-y-6 shadow-2xl text-center animate-in zoom-in-95 duration-300">
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="p-4 bg-green-500/10 rounded-full text-green-500 ring-1 ring-green-500/20 shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)]"
          >
            <CheckCircle2 className="w-12 h-12" />
          </motion.div>
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
        </div>
        <CacheManager />
      </div>
    );
  }

  if (manifest) {
    return <PackDetails manifest={manifest} onStartConversion={handleStartConversion} onCancel={handleCancel} />;
  }

  return (
    <div className="w-full max-w-2xl backdrop-blur-xl bg-black/40 border border-white/10 p-1 rounded-2xl shadow-2xl ring-1 ring-white/5 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card/50 rounded-xl p-6 md:p-8 space-y-4">
        <Dropzone onFileSelect={handleFileSelect} onUrlSubmit={handleUrlSubmit} isProcessing={isLoading} />
        <ModpackFinder onUrlSubmit={handleUrlSubmit} isProcessing={isLoading} />
        <CacheManager />
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-3 text-sm font-medium border border-destructive/20 animate-in shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
