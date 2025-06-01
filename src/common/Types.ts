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