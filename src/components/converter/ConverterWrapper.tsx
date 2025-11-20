import { useState } from "react";
import Dropzone from "./Dropzone";
import PackDetails from "./PackDetails";
import { ConverterEngine } from "@/lib/converter-engine";
import type { ModrinthManifest } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function ConverterWrapper() {
  const [manifest, setManifest] = useState<ModrinthManifest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ConverterEngine.readManifest(file);
      setManifest(data);
    } catch (err) {
      console.error(err);
      setError("Failed to parse .mrpack file. Is it valid?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartConversion = () => {
    alert("Soon!");
  };

  const handleCancel = () => {
    setManifest(null);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Reading modpack manifest...</p>
      </div>
    );
  }

  if (manifest) {
    return (
      <PackDetails 
        manifest={manifest} 
        onStartConversion={handleStartConversion}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      <Dropzone onFileSelect={handleFileSelect} isProcessing={isLoading} />
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-center text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
