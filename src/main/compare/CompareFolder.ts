import { CompareItem } from "../../common/Types";
import fs, { Dirent } from 'fs';

export enum FileType {
  Unknown = 0, // The file type is unknown.
  File = 1, // A regular file.
  Directory = 2, // A directory.
  SymbolicLink = 64 // A symbolic link to a file.
}

export interface FileStat {
  type: FileType; // The type of the file, e.g. is a regular file, a directory, or symbolic link to a file.
  ctime: number; // The creation timestamp in milliseconds elapsed since January 1, 1970 00:00:00 UTC.
  mtime: number; // The modification timestamp in milliseconds elapsed since January 1, 1970 00:00:00 UTC.
  size: number; // The size in bytes.
}

export class CompareFolder {
  constructor() {}

  run(arg: CompareItem) {
    // TODO: load folder n compare
    // const reads: string[] | Buffer[] = fs.readdirSync(input_lhs_value, { recursive: true });
    const files_lhs: Dirent[] = fs.readdirSync(arg.path_lhs, { withFileTypes: true });
    // console.log('typeof files[0] =', typeof files_lhs[0]);
    // console.log('files[0] =', files_lhs[0]);
    const files_rhs: Dirent[] = fs.readdirSync(arg.path_rhs, { withFileTypes: true });

    // default sort: name asc + folder n file
    let folders: Dirent[] = [], files: Dirent[] = [];

    for(let i = 0; i < files_lhs.length; i++) {
      const e: Dirent = files_lhs[i];
      if(e.isDirectory()) folders.push(e);
      else files.push(e);
    }

    for(let i = 0; i < files_rhs.length; i++) {
      const e: Dirent = files_rhs[i];
      if(e.isDirectory()) folders.push(e);
      else files.push(e);
    }

    // sort with name asc


    //

    /* pseudo code
    if folder {
      if exist in right {
        dive to the folder
      } else {
        removed++ in left
        // inserted in right
      }
    } else { // if file {
      if exist in right {
        do compare when size n timestamp is different
      } else {
        removed++ in left
        // inserted in right
      }
    } */

    // for(let i = 0; i < files_lhs.length; i++) {
    //   const e: Dirent = files_lhs[i];
    //   // const foldername = e.path.split('/')[e.path.split('/').length-1];

    //   if(e.isDirectory()) {

    //     if(fs.existsSync(arg.path_rhs + '/' + e.name)) {} else {

    //     }

    //     // const read: Buffer = fs.readFileSync(arg.path_rhs + '/' + e.name, {});
    //     // console.log('read =', read);
    //   } else { //if(e.isFile()) {

    //     if(fs.existsSync(arg.path_rhs + '/' + e.name)) {} else {}

    //     try {
    //       const stat: fs.Stats = fs.statSync(arg.path_rhs + '/' + e.name, {});
    //       console.log('stat =', stat);
    //     } catch(ex) {

    //     }
    //   }
    // }


    // fs.readdir(arg.path_lhs, {
    //     withFileTypes: true,
    //     // recursive: false,
    //   },
    //   (err, files: Dirent[]): void => {
    //     // console.log('files =', files);
    //     console.log('files.length =', files.length);
    //     if(files.length > 0) {
    //       // console.log('typeof files[0] =', typeof files[0]);
    //       // console.log('files[0] =', files[0]);
    //       for(let i = 0; i < files.length; i++) {
    //         const e: Dirent = files[i];
    //         const filename = e.path.split('/')[e.path.split('/').length-1];

    //         if(e.isDirectory()) {
    //           fs.readFile(arg.path_rhs + '/' + filename, {}, (err, data: Buffer): void => {
    //             console.log('data =', data);
    //           });
    //         } else { //if(e.isFile()) {
    //           fs.stat(arg.path_rhs + '/' + filename, (err, stats: fs.Stats): void => {
    //             console.log('stats =', stats);
    //           });
    //         }
    //       }
    //     }
    //   }
    // );

    //
    /* File
    Folder
    Newer File
    Unchanged
    Changed
    Removed File
    Removed Folder
    Inserted File
    Inserted Folder */
  }
}