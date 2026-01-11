import {
  appPreferencesMenuId,
  appQuitMenuId,
  filePreferencesMenuId,

  fileSaveLeftMenuId,
  fileSaveRightMenuId,
  fileSaveAllMenuId,
  fileStartOrRecompareMenuId,
  fileCloseTabMenuId,

  editCopyMenuId,
  editCutMenuId,
  editNextChangeMenuId,
  editPasteMenuId,
  editPrevChangeMenuId,
  editRedoMenuId,
  editSelectAllMenuId,
  editUndoMenuId,

  pushToLeftMenuId,
  pushToRightMenuId,
  leftToRightFolderMenuId,
  rightToLeftFolderMenuId,
  leftToOtherFolderMenuId,
  rightToOtherFolderMenuId,

  selectChangedMenuId,
  selectByStateMenuId,
  launchComparisonsMenuId,
  retestSelectedMenuId,
  expandAllFoldersMenuId,
  collapseAllFoldersMenuId,

  toggleWrapLinesMenuId,

  windowSelectPrevTab,
  windowSelectNextTab,
} from "./Types";

// { id: [Win, Mac] }
export const keyBinding: { [id: string]: string[] } = {};
keyBinding[appPreferencesMenuId] = [ null, 'Cmd+,' ];
keyBinding[appQuitMenuId] = [ null, 'Cmd+Q' ];
keyBinding[fileSaveLeftMenuId] =  ['Ctrl+1', 'Cmd+1' ];
keyBinding[fileSaveRightMenuId] =  ['Ctrl+2', 'Cmd+2' ];
keyBinding[fileSaveAllMenuId] =  ['Ctrl+S', 'Cmd+Alt+S' ];
keyBinding[filePreferencesMenuId] =  ['Ctrl+P', null ];
keyBinding[fileStartOrRecompareMenuId] =  ['Ctrl+R', 'Cmd+R' ];
keyBinding[fileCloseTabMenuId] =  ['Ctrl+W', 'Cmd+W' ];

keyBinding[editUndoMenuId] = [ 'Ctrl+Z', 'Cmd+Z' ];
keyBinding[editRedoMenuId] = [ 'Shift[+Ctrl+Z', 'Shift+Cmd+Z' ];
keyBinding[editCutMenuId] = [ 'Ctrl+X', 'Cmd+X' ];
keyBinding[editCopyMenuId] = [ 'Ctrl+C', 'Cmd+C' ];
keyBinding[editPasteMenuId] = [ 'Ctrl+V', 'Cmd+V' ];
keyBinding[editSelectAllMenuId] = [ 'Ctrl+A', 'Cmd+A' ];
keyBinding[editPrevChangeMenuId] = [ 'Ctrl+PageUp', 'Ctrl+Alt+Up' ];
keyBinding[editNextChangeMenuId] = [ 'Ctrl+PageDown', 'Ctrl+Alt+Down' ];

keyBinding[pushToLeftMenuId] = [ 'Ctrl+W', 'Ctrl+Shift+Left' ];
keyBinding[pushToRightMenuId] = [ 'Ctrl+Q', 'Ctrl+Shift+Right' ];
keyBinding[leftToRightFolderMenuId] = [ 'Ctrl+W', 'Alt+W' ];
keyBinding[rightToLeftFolderMenuId] = [ 'Ctrl+Q', 'Alt+Q' ];

keyBinding[selectChangedMenuId] = [ 'Ctrl+S', 'Cmd+Ctrl+C' ];
keyBinding[launchComparisonsMenuId] = [ 'Ctrl+M', 'Cmd+Shift+L' ];
keyBinding[retestSelectedMenuId] = [ 'Ctrl+Shift+R', 'Cmd+Shift+R' ];
keyBinding[expandAllFoldersMenuId] = [ 'Ctrl+=', 'Cmd+Ctrl+=' ];
keyBinding[collapseAllFoldersMenuId] = [ 'Ctrl+-', 'Cmd+Ctrl+-' ];

keyBinding[toggleWrapLinesMenuId] = [ 'Alt+Z', 'Alt+Z' ];

keyBinding[windowSelectPrevTab] = [ 'Ctrl+Shift+Tab', 'Ctrl+Shift+Tab' ];
keyBinding[windowSelectNextTab] = [ 'Ctrl+Tab', 'Ctrl+Tab' ];