export interface DirentExt {
  // side: string; // type Side = 'left' | 'right' | 'both' or 'left|right' (| separated string)

  name: string;
  path: string;

  isFile: boolean;
  isDirectory: boolean;
  isSymbolicLink: boolean;

  // stat
  mtime: Date,
  size: number,
}