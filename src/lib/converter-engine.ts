import JSZip from "jszip";
import type { ModrinthManifest } from "./types";

export class ConverterEngine {
  static async readManifest(file: File): Promise<ModrinthManifest> {
    try {
      console.log("Engine: Loading zip file...");
      const zip = await JSZip.loadAsync(file);
      
      const manifestFile = zip.file("modrinth.index.json");
      
      if (!manifestFile) {
        throw new Error("Invalid Modrinth pack: modrinth.index.json not found.");
      }

      console.log("Engine: Parsing manifest...");
      const manifestContent = await manifestFile.async("string");
      const manifest = JSON.parse(manifestContent) as ModrinthManifest;
      
      return manifest;
    } catch (error) {
      console.error("Error reading mrpack:", error);
      throw new Error("Failed to read modpack file. Is it corrupted?");
    }
  }
}
