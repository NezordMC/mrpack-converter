import JSZip from "jszip";
import pLimit from "p-limit";
import saveAs from "file-saver";
import type { ModrinthManifest, ModrinthFile } from "./types";

type ProgressCallback = (log: string, progress: number) => void;

export class ConverterEngine {
  static async readManifest(file: File): Promise<ModrinthManifest> {
    try {
      console.log("Engine: Loading zip file...");
      const zip = await JSZip.loadAsync(file);
      const manifestFile = zip.file("modrinth.index.json");
      if (!manifestFile) throw new Error("modrinth.index.json not found.");
      const manifestContent = await manifestFile.async("string");
      return JSON.parse(manifestContent) as ModrinthManifest;
    } catch (error) {
      throw new Error("Failed to read modpack file.");
    }
  }

  static async convert(file: File, manifest: ModrinthManifest, onProgress: ProgressCallback): Promise<void> {
    const newZip = new JSZip();
    const originalZip = await JSZip.loadAsync(file);
    const limit = pLimit(5);

    const totalFiles = manifest.files.length;
    let completed = 0;

    onProgress("Copying overrides/configs...", 5);
    const overridesDir = "overrides";

    originalZip.folder(overridesDir)?.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir) {
        newZip.file(relativePath, zipEntry.async("blob"));
      }
    });

    const downloadPromises = manifest.files.map((modFile: ModrinthFile) => {
      return limit(async () => {
        const fileName = modFile.path.split("/").pop() || "unknown.jar";
        const downloadUrl = modFile.downloads[0];

        try {
          onProgress(`Downloading ${fileName}...`, 10 + (completed / totalFiles) * 80);

          const response = await fetch(downloadUrl);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const blob = await response.blob();

          newZip.file(modFile.path, blob);

          completed++;
        } catch (err) {
          console.error(`Failed to download ${fileName}`, err);
          onProgress(`FAILED: ${fileName} (Skipping)`, 10 + (completed / totalFiles) * 80);
        }
      });
    });

    await Promise.all(downloadPromises);

    onProgress("Compressing final ZIP...", 95);
    const content = await newZip.generateAsync({ type: "blob" });

    onProgress("Done! Downloading...", 100);
    saveAs(content, `${manifest.name}-${manifest.versionId}-FULL.zip`);
  }
}
