import { CompareItem, DirentExt, State } from "../../common/Types";
import fs, { Dirent } from 'fs';
import { _readdirSyncWithStat } from "../utils";
import { mainWindow } from "../main";
import { Myers } from "../../lib/robertelder/Myers";
import Diff from "../../lib/mergely/Diff";
import DiffParser from "../../lib/mergely/DiffParser";

export interface CompareFolderElem {
  side: string;
  name: string;

  isFile: boolean;
  isDirectory: boolean;

  lhs: {
    path?: string,
    mtime?: Date,
    size?: number,
  }
  rhs: {
    path?: string,
    mtime?: Date,
    size?: number,
  }

  depth?: number;
  index?: number;
}

export class CompareFolder {

  uid: string
  folderCount: number = 0;
  fileCount: number = 0;
  totalCount: number = 0;
  fileDiffCount: number = 0;

  unchanged: number = 0;
  changed: number = 0;
  removed: number = 0;
  inserted: number = 0;

  // type: include|exclude, match: File|Folder|File&Folder, pattern: comma separated regex
  ignoreFileFolder: string = '.git,.DS_Store,node_modules,package-lock.json,dll,dist,build';

  constructor(uid: string) {
    this.uid = uid;
  }

  async findHaveChildren(path_lhs: string, path_rhs: string, depth: number): Promise<number> {
    const files_lhs: DirentExt[] = path_lhs ? await _readdirSyncWithStat(path_lhs) : null;
    const files_rhs: DirentExt[] = path_rhs ? await _readdirSyncWithStat(path_rhs) : null;

    // let count: number = 0;
    let folders: CompareFolderElem[] = [], files: CompareFolderElem[] = [];
    const filters: string[] = this.ignoreFileFolder.split(',');

    if(files_lhs) {
      for(let i = 0; i < files_lhs.length; i++) {
        const item: DirentExt = files_lhs[i];
        const elem: CompareFolderElem = {
          side: 'left',
          name: item.name,
          isFile: item.isFile,
          isDirectory: item.isDirectory,

          lhs: {
            path: item.path,
            mtime: item.mtime,
            size: item.size,
          },
          rhs: {},

          // depth: depth,
        };

        let filtered = false;
        for(let j = 0; j < filters.length; j++) {
          if(item.name == filters[j]) filtered = true;
        }

        if(!filtered) {
          if(item.isDirectory) folders.push(elem);
          else files.push(elem);
        }
      }
    }

    if(files_rhs) {
      for(let i = 0; i < files_rhs.length; i++) {
        const item: DirentExt = files_rhs[i];
        const elem: CompareFolderElem = {
          side: 'right',
          name: item.name,
          isFile: item.isFile,
          isDirectory: item.isDirectory,

          lhs: {},
          rhs: {
            path: item.path,
            mtime: item.mtime,
            size: item.size,
          },

          // depth: depth,
        };

        let filtered = false;
        for(let j = 0; j < filters.length; j++) {
          if(item.name == filters[j]) filtered = true;
        }

        if(!filtered) {
          if(item.isDirectory) folders.push(elem);
          else files.push(elem);
        }
      }
    }

    // 중복제거 + right 체크
    const folders_filtered: CompareFolderElem[] = [];
    for(let i = 0; i < folders.length; i++) {
      const folder = folders[i];
      const findIndex = folders_filtered.findIndex((e) => e.name === folder.name);
      if(findIndex === -1) {
        folders_filtered.push(folder)
      } else {
        folders_filtered[findIndex].side += '|right';
        folders_filtered[findIndex].rhs = folder.rhs; //{ path: folder.rhs.path, mtime: folder.rhs.mtime, size: folder.rhs.size };
      }
    }

    const files_filtered: CompareFolderElem[] = [];
    for(let i = 0; i < files.length; i++) {
      const file = files[i];
      const findIndex = files_filtered.findIndex((e) => e.name === file.name)
      if(findIndex === -1) {
        files_filtered.push(file)
      } else {
        files_filtered[findIndex].side += '|right';
        files_filtered[findIndex].rhs = file.rhs; //{ path: file.rhs.path, mtime: file.rhs.mtime, size: file.rhs.size };
      }
    }
    return folders_filtered.length + files_filtered.length;
  }

  async countCompare(path_lhs: string, path_rhs: string): Promise<number> {
    const cont_lhs: Buffer = await fs.readFileSync(path_lhs);
    const cont_rhs: Buffer = await fs.readFileSync(path_rhs);
    // console.log('typeof(cont_lhs) =', typeof(cont_lhs));
    // console.log('cont_lhs =', cont_lhs);
    // const ret = new Myers().getShortestEditScript(cont_lhs.toString(), cont_rhs.toString());
    // return ret.length;
    const diff = new Diff(cont_lhs.toString(), cont_rhs.toString(), { split: 'lines' });
    const changes = new DiffParser().parse(diff.normal_form());
    return changes.length;
  }

  async _readdir(path_lhs: string, path_rhs: string, depth: number, parent: CompareFolderElem): Promise<void> {

    let files_lhs: DirentExt[] = [];
    if(path_lhs) files_lhs = await _readdirSyncWithStat(path_lhs);
    // console.log('typeof(_files_lhs[0]) =', typeof(files_lhs[0]));
    // console.log('_files_lhs[0] =', files_lhs[0]);
    let files_rhs: DirentExt[] = [];
    if(path_rhs) files_rhs = await _readdirSyncWithStat(path_rhs);

    // default sort: name asc + folder n file
    let folders: CompareFolderElem[] = [], files: CompareFolderElem[] = [];
    const filters: string[] = this.ignoreFileFolder.split(',');

    for(let i = 0; i < files_lhs.length; i++) {
      const item: DirentExt = files_lhs[i];
      const elem: CompareFolderElem = {
        side: 'left',
        name: item.name,
        isFile: item.isFile,
        isDirectory: item.isDirectory,

        lhs: {
          path: item.path,
          mtime: item.mtime,
          size: item.size,
        },
        rhs: {},

        // depth: depth,
      };

      let filtered = false;
      for(let j = 0; j < filters.length; j++) {
        if(item.name == filters[j]) filtered = true;
      }

      if(!filtered) {
        if(item.isDirectory) folders.push(elem);
        else files.push(elem);
      }
    }

    for(let i = 0; i < files_rhs.length; i++) {
      const item: DirentExt = files_rhs[i];
      const elem: CompareFolderElem = {
        side: 'right',
        name: item.name,
        isFile: item.isFile,
        isDirectory: item.isDirectory,

        lhs: {},
        rhs: {
          path: item.path,
          mtime: item.mtime,
          size: item.size,
        },

        // depth: depth,
      };

      let filtered = false;
      for(let j = 0; j < filters.length; j++) {
        if(item.name == filters[j]) filtered = true;
      }

      if(!filtered) {
        if(item.isDirectory) folders.push(elem);
        else files.push(elem);
      }
    }

    // 중복제거 + right 체크
    const folders_filtered: CompareFolderElem[] = [];
    for(let i = 0; i < folders.length; i++) {
      const folder = folders[i];
      const findIndex = folders_filtered.findIndex((e) => e.name === folder.name);
      if(findIndex === -1) {
        folders_filtered.push(folder)
      } else {
        folders_filtered[findIndex].side += '|right';
        folders_filtered[findIndex].rhs = folder.rhs; //{ path: folder.rhs.path, mtime: folder.rhs.mtime, size: folder.rhs.size };
      }
    }

    const files_filtered: CompareFolderElem[] = [];
    for(let i = 0; i < files.length; i++) {
      const file = files[i];
      const findIndex = files_filtered.findIndex((e) => e.name === file.name)
      if(findIndex === -1) {
        files_filtered.push(file)
      } else {
        files_filtered[findIndex].side += '|right';
        files_filtered[findIndex].rhs = file.rhs; //{ path: file.rhs.path, mtime: file.rhs.mtime, size: file.rhs.size };
      }
    }

    // console.log('folders_filtered =', folders_filtered);
    // console.log('files_filtered =', files_filtered);

    // sort by name asc
    folders_filtered.sort((a: CompareFolderElem, b: CompareFolderElem) => {
      return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
    });
    files_filtered.sort((a: CompareFolderElem, b: CompareFolderElem) => {
      return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
    });

    // console.log('folders_filtered =', folders_filtered);
    // console.log('files_filtered =', files_filtered);

    /* PSEUDO CODE
    folder:
    if both {
      dive to the folder
    } if left only {
      removed++ in left
    } if right only {
      inserted++ in right
    }

    file:
    if both {
      if size n timestamp are different {
        do count compare
        changed++
      } else {
        unchanged++
      }
    } else if left only {
      removed++ in left
    } else if right only {
      inserted++ in right
    }
    */

    /* State
    File
    Folder
    Newer File
    Unchanged
    Changed
    Removed File
    Removed Folder
    Inserted File
    Inserted Folder */

    // TODO: find have children
    const length_array = [];
    length_array.length = folders_filtered.length;

    for(let i = 0; i < folders_filtered.length; i++) {
      const elem: CompareFolderElem = folders_filtered[i];
      const _path_lhs = path_lhs + '/' + elem.name;
      const _path_rhs = path_rhs + '/' + elem.name;
      let length;
      if(elem.side.indexOf('left') > -1 && elem.side.indexOf('right') > -1) {
        length = await this.findHaveChildren(_path_lhs, _path_rhs, depth+1);
      } else if(elem.side.indexOf('left') > -1) {
        length = await this.findHaveChildren(_path_lhs, null, depth+1);
      } else if(elem.side.indexOf('right') > -1) {
        length = await this.findHaveChildren(null, _path_rhs, depth+1);
      }
      length_array[i] = length;
    }

    for(let i = 0; i < folders_filtered.length; i++) {
      const elem: CompareFolderElem = folders_filtered[i];
      if(elem.side.indexOf('left') > -1 && elem.side.indexOf('right') > -1) {
        mainWindow.send('compare folder data', {
          uid: this.uid,
          type: 'folder', depth, index: i,
          parent, data: elem, state: 'unchanged', length: length_array[i]
        });

        const _path_lhs = path_lhs + '/' + elem.name;
        const _path_rhs = path_rhs + '/' + elem.name;
        await this._readdir(_path_lhs, _path_rhs, depth+1, elem);
      } else if(elem.side.indexOf('left') > -1) {
        mainWindow.send('compare folder data', {
          uid: this.uid,
          type: 'folder', depth, index: i,
          parent, data: elem, state: 'removed', length: length_array[i]
        });
        const _path_lhs = path_lhs + '/' + elem.name;
        // const _path_rhs = path_rhs + '/' + elem.name;
        await this._readdir(_path_lhs, null, depth+1, elem);
      } else if(elem.side.indexOf('right') > -1) {
        mainWindow.send('compare folder data', {
          uid: this.uid,
          type: 'folder', depth, index: i,
          parent, data: elem, state: 'inserted', length: length_array[i]
        });
        // const _path_lhs = path_lhs + '/' + elem.name;
        const _path_rhs = path_rhs + '/' + elem.name;
        await this._readdir(null, _path_rhs, depth+1, elem);
      }
      // break;
    }

    for(let i = 0; i < files_filtered.length; i++) {
      // console.log(`files_filtered[${i}] = ${files_filtered[i].name}`);
      const elem: CompareFolderElem = files_filtered[i];
      let state: State = undefined, changes: number;

      if(elem.side.indexOf('left') > -1 && elem.side.indexOf('right') > -1) {
        if(elem.lhs.mtime != elem.rhs.mtime && elem.lhs.size != elem.rhs.size) {
          const _path_lhs = path_lhs + '/' + elem.name;
          const _path_rhs = path_rhs + '/' + elem.name;
          changes = await this.countCompare(_path_lhs, _path_rhs);
          state = 'changed'; this.changed++;
        } else {
          state = 'unchanged'; this.unchanged++;
        }
      } else if(elem.side.indexOf('left') > -1) {
        state = 'removed'; this.removed++;
      } else if(elem.side.indexOf('right') > -1) {
        state = 'inserted'; this.inserted++;
      }

      mainWindow.send('compare folder data', {
        uid: this.uid,
        type: 'file', depth, index: i,
        parent, data: elem, state, changes
      });
      // break;
    }
  }

  async run(arg: CompareItem): Promise<{}> {
    // load folder n compare
    mainWindow.send('compare folder start', {});
    await this._readdir(arg.path_lhs, arg.path_rhs,
      0, // depth
      null // parent
    );
    const retVal = {
      // folderCount: this.folderCount,
      // fileCount: this.fileCount,
      // totalCount: this.totalCount,
      // fileDiffCount: this.fileDiffCount,
      removed: this.removed,
      inserted: this.inserted,
      changed: this.changed,
      unchanged: this.unchanged,
    }
    mainWindow.send('compare folder end', { uid: this.uid, ...retVal });
    return retVal;
  }
}