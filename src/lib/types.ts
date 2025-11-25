import { z } from "zod";

export const ModrinthFileSchema = z.object({
  path: z.string(),
  hashes: z.object({
    sha1: z.string(),
    sha512: z.string(),
  }),
  env: z
    .object({
      client: z.string(),
      server: z.string(),
    })
    .optional(),
  downloads: z.array(z.string()),
  fileSize: z.number(),
});

export const ModrinthManifestSchema = z.object({
  formatVersion: z.number(),
  game: z.string(),
  versionId: z.string(),
  name: z.string(),
  summary: z.string().optional().nullable(),
  files: z.array(ModrinthFileSchema),
  dependencies: z.record(z.string(), z.string()).and(
    z.object({
      minecraft: z.string(),
      "fabric-loader": z.string().optional(),
      forge: z.string().optional(),
      "neo-forge": z.string().optional(),
    })
  ),
});

export type ModrinthFile = z.infer<typeof ModrinthFileSchema>;
export type ModrinthManifest = z.infer<typeof ModrinthManifestSchema>;

export type ConvertStatus = "idle" | "reading" | "downloading" | "zipping" | "paused" | "done" | "error";

export interface ConversionOptions {
  serverMode: boolean;
  selectedLoader: string;
}

export type WorkerMessage = { type: "READ_MANIFEST"; file: File } | { type: "CONVERT"; file: File; manifest: ModrinthManifest; options: ConversionOptions } | { type: "PAUSE" } | { type: "RESUME" };

export type WorkerResponse =
  | { type: "MANIFEST_READ"; manifest: ModrinthManifest }
  | { type: "PROGRESS"; log: string; progress: number; eta: number }
  | { type: "DONE"; stream: ReadableStream; fileName: string }
  | { type: "ERROR"; error: string };
