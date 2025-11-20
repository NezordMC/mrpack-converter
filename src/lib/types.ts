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
    fabric-loader?: string;
    forge?: string;
  };
}

export type ConvertStatus = 'idle' | 'reading' | 'downloading' | 'zipping' | 'done' | 'error';
