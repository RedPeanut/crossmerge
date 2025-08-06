import { CompareFolderElem } from "../main/compare/CompareFolder";

export type State = 'unchanged' | 'changed' | 'removed' | 'inserted';
export type CompareItemType = 'file' | 'folder';

// description of compare state
export interface CompareItem {
  type: CompareItemType;
  uid: string;

  // in renderer
  path_lhs?: string;
  path_rhs?: string;

  // selected?: boolean; // default: false
  // active?: boolean; // default: false
}

export interface CompareFileData {
  // not use
}

export type CompareFolderDataType = 'file' | 'folder';

export interface CompareFolderData {
  uid: string;
  type: CompareFolderDataType;
  depth: number;
  index: number;

  parent: null | CompareFolderElem;
  data: CompareFolderElem;
  state: State;
  changes?: number; // if changed
  length?: number; // has children, if directory
}

export type CompareData = CompareFileData | CompareFolderData;

/* export interface FolderElem {
  type: string, // 'file' | 'folder'
  depth: number,
  name: string,
  path: string,
  // dirent: Dirent,

  lhs: {
    name: string,
    path: string,
  }

  rhs: {
    name: string,
    path: string,
  }

  // in renderer
  collapsed: boolean,
} */

/* Menu */
export interface CommonMenuItem {
  label?: string;

  type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';

  accelerator?: string;

  enabled?: boolean;
  visible?: boolean;
  checked?: boolean;
}

export interface SerializableMenuItem extends CommonMenuItem {
  id?: number;
  submenu?: SerializableMenuItem[];
}

export interface MenuItem extends CommonMenuItem {
  click?: (event: MenuEvent) => void;
  submenu?: MenuItem[];
}

export interface MenuEvent {
  shiftKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

export interface PopupOptions {
  x?: number;
  y?: number;
  // positioningItem?: number;
}

export interface ResultMap {
  resultCode:
      '0000' // success
    | '9991' | '9992' | '9993' | '9994' | '9995' | '9996' | '9997' | '9998' // spare
    | '9999' // fail or error
  ;
  resultMsg?: string;
  resultData?: {};
}
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