/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path, { join } from 'path';
import fs, { Dirent } from 'fs';
import { promisify } from 'util';
import { DirentExt } from '../common/Types';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export async function _readdirSyncWithStat(path: string): Promise<DirentExt[]> {
  const result: DirentExt[] = [];
  const reads: Dirent[] = await fs.readdirSync(path, { withFileTypes: true });
  for(let i = 0; i < reads.length; i++) {
    const read: Dirent = reads[i];
    const _path = read.path ? read.path : (read.isDirectory() ? (path + '/' + read.name) : path);

    let isFile = false;
    let isDirectory = false;
    let isSymbolicLink = false;
    let mtime: Date = null;
    let size: number = 0;

    try {
      const lstat = await promisify(fs.lstat)(join(path, read.name));

      isFile = lstat.isFile();
      isDirectory = lstat.isDirectory();
      isSymbolicLink = lstat.isSymbolicLink();
      mtime = lstat.mtime;
      size = lstat.size;
    } catch(error) {}

    result.push({
      // side: side,
      name: read.name,
      path: _path,

      isFile: isFile,
      isDirectory: isDirectory,
      isSymbolicLink: isSymbolicLink,

      mtime,
      size,
    });
  }
  return result;
}

export function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}