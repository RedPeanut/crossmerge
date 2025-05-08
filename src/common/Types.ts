export type CompareType = 'file' | 'folder';

// description of compare state
export interface CompareItem {
  type: CompareType,
  uid: string,

  // in renderer
  selected?: boolean; // default: false
  active?: boolean; // default: false

  //
  path_lhs?: string;
  path_rhs?: string;
}

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