import saveAs from "file-saver";
import type { ModrinthManifest, ConversionOptions, WorkerResponse } from "./types";

type ProgressCallback = (log: string, progress: number) => void;

export class ConverterEngine {
  static async downloadFileFromUrl(url: string): Promise<File> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download file: ${response.statusText}`);
    const blob = await response.blob();
    const fileName = url.split("/").pop() || "modpack.mrpack";
    return new File([blob], fileName, { type: "application/octet-stream" });
  }

  static readManifest(file: File): Promise<ModrinthManifest> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL("./converter.worker.ts", import.meta.url), { type: "module" });

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const { type } = event.data;
        if (type === "MANIFEST_READ") {
          resolve((event.data as any).manifest);
          worker.terminate();
        } else if (type === "ERROR") {
          reject(new Error((event.data as any).error));
          worker.terminate();
        }
      };

      worker.onerror = (err) => {
        reject(err);
        worker.terminate();
      };

      worker.postMessage({ type: "READ_MANIFEST", file });
    });
  }

  static convert(
    file: File, 
    manifest: ModrinthManifest, 
    onProgress: ProgressCallback, 
    options: ConversionOptions = { serverMode: false }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL("./converter.worker.ts", import.meta.url), { type: "module" });

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const data = event.data;

        switch (data.type) {
          case "PROGRESS":
            onProgress(data.log, data.progress);
            break;
          case "DONE":
            saveAs(data.blob, data.fileName);
            worker.terminate();
            resolve();
            break;
          case "ERROR":
            reject(new Error(data.error));
            worker.terminate();
            break;
        }
      };

      worker.onerror = (err) => {
        reject(err);
        worker.terminate();
      };

      worker.postMessage({ type: "CONVERT", file, manifest, options });
    });
  }
}
