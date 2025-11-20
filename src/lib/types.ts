export interface ModrinthFile {
  path: string;
  hashes: {
    sha1: string;
    sha512: string;
  };
  env?: {
    client: string;
    server: string;
  };
  downloads: string[];
  fileSize: number;
}

export interface ModrinthManifest {
  formatVersion: number;
  game: string;
  versionId: string;
  name: string;
  summary?: string;
  files: ModrinthFile[];
  dependencies: {
    minecraft: string;
    "fabric-loader"?: string;
    forge?: string;
    "neo-forge"?: string;
  };
}

export type ConvertStatus = "idle" | "reading" | "downloading" | "zipping" | "done" | "error";

export interface ConversionOptions {
  serverMode: boolean;
}

export type WorkerMessage = { type: "READ_MANIFEST"; file: File } | { type: "CONVERT"; file: File; manifest: ModrinthManifest; options: ConversionOptions };

export type WorkerResponse = { type: "MANIFEST_READ"; manifest: ModrinthManifest } | { type: "PROGRESS"; log: string; progress: number } | { type: "DONE"; blob: Blob; fileName: string } | { type: "ERROR"; error: string };
