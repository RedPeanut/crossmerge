import { CompareFolderElem } from "../main/compare/CompareFolder";

export type State = 'unchanged' | 'changed' | 'removed' | 'inserted';
export type CompareItemType = 'file' | 'folder';

export interface Status {
  // folder
  removed?: number;
  inserted?: number;
  changed?: number;
  unchanged?: number;

  // file
  removal?: number;
  insertion?: number;
  change?: number;

  encoding?: string;
  spaces?: number;
  ln?: number;
  col?: number;
  crlf?: string;
}

// description of compare state
export interface CompareItem {
  type: CompareItemType;
  uid: string;

  // in renderer
  path_lhs?: string;
  path_rhs?: string;

  // selected?: boolean; // default: false
  // active?: boolean; // default: false

  status?: Status;
}

export interface CompareFileData {
  // not use
}

// export type CompareFolderDataType = 'file' | 'folder';

export interface CompareFolderData {
  uid: string;
  type: 'file' | 'folder'; //CompareFolderDataType;
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
  id?: number | string;
  label?: string;
  type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';
  accelerator?: string;
  enabled?: boolean;
  visible?: boolean;
  checked?: boolean;
  clickable?: boolean;
}

export interface SerializableMenuItem extends CommonMenuItem {
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

/** (Experimental) Use similar to HTTP response code
 * Informational responses (1xx) -> keep
 * Successful responses (2xx) -> keep
 * Client error responses (4xx) -> warning
 * Server error responses (5xx) -> keep
 */
export interface ResultMap {
  resultCode:
    | '100' // info
    | '200' // success
    | '400' | '401' | '402' | '403' | '404' | '405' // warning
    | '500' | '501' | '502' | '503' | '504' | '505' // error
  ;
  resultMsg?: string;
  resultData?: any;
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

// app
export const appPreferencesMenuId = 'app.preferences';
export const appQuitMenuId = 'app.quit';

// file
export const fileSaveMenuId = 'file.save';
export const fileSaveLeftMenuId = 'file.saveLeft';
export const fileSaveRightMenuId = 'file.saveRight';
export const fileSaveAllMenuId = 'file.saveAll';
export const filePreferencesMenuId = 'file.preferences';
// export const fileCloseMenuId = 'file.close';
export const fileCloseTabMenuId = 'file.closeTab';

// edit
export const editUndoMenuId = 'edit.undo';
export const editRedoMenuId = 'edit.redo';
export const editCutMenuId = 'edit.cut';
export const editCopyMenuId = 'edit.copy';
export const editPasteMenuId = 'edit.paste';
export const editSelectAllMenuId = 'edit.selectAll';
export const editPrevChangeMenuId = 'edit.prevChange';
export const editNextChangeMenuId = 'edit.nextChange';

// merging
export const pushToLeftMenuId = 'merging.pushToLeft';
export const pushToRightMenuId = 'merging.pushToRight';
export const leftToRightFolderMenuId = 'merging.leftToRightFoler';
export const rightToLeftFolderMenuId = 'merging.rightToLeftFoler';
export const leftToOtherFolderMenuId = 'merging.leftToOtherFolder';
export const rightToOtherFolderMenuId = 'merging.rightToOtherFolder';

// actions
export const selectChangedMenuId = 'actions.selectChanged';
export const selectByStateMenuId = 'actions.selectByState';
export const launchComparisonsMenuId = 'actions.launchComparisons';
export const expandAllFoldersMenuId = 'actions.expandAllFolders';
export const collapseAllFoldersMenuId = 'actions.collapseAllFolders';

// view
export const toggleWrapLinesMenuId = 'view.toggleWrapLines';

// type State = 'empty' | typeof CompareItemType;
export interface MenubarEnableElem { id: string, enable: boolean }
export interface MenubarEnable { [id: string]: MenubarEnableElem[] }