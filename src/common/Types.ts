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