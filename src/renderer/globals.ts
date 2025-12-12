import {
  MenubarEnable,

  fileSaveLeftMenuId,
  fileSaveRightMenuId,
  fileSaveAllMenuId,
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
  expandAllFoldersMenuId,
  collapseAllFoldersMenuId,

  toggleWrapLinesMenuId,
} from "../common/Types";

export const defaultMenubarEnable: MenubarEnable = {
  'empty': [
    { id: fileSaveLeftMenuId, enable: false },
    { id: fileSaveRightMenuId, enable: false },
    { id: fileSaveAllMenuId, enable: false },
    { id: fileCloseTabMenuId, enable: false },

    { id: editUndoMenuId, enable: false },
    { id: editRedoMenuId, enable: false },
    { id: editCutMenuId, enable: false },
    { id: editCopyMenuId, enable: false },
    { id: editPasteMenuId, enable: false },
    { id: editSelectAllMenuId, enable: false },
    { id: editPrevChangeMenuId, enable: false },
    { id: editNextChangeMenuId, enable: false },

    { id: pushToLeftMenuId, enable: false },
    { id: pushToRightMenuId, enable: false },
    { id: leftToRightFolderMenuId, enable: false },
    { id: rightToLeftFolderMenuId, enable: false },
    { id: leftToOtherFolderMenuId, enable: false },
    { id: rightToOtherFolderMenuId, enable: false },

    { id: selectChangedMenuId, enable: false },
    { id: selectByStateMenuId, enable: false },
    { id: launchComparisonsMenuId, enable: false },
    { id: expandAllFoldersMenuId, enable: false },
    { id: collapseAllFoldersMenuId, enable: false },

    { id: toggleWrapLinesMenuId, enable: false },
  ],
  'folder': [
    { id: fileSaveLeftMenuId, enable: false },
    { id: fileSaveRightMenuId, enable: false },
    { id: fileSaveAllMenuId, enable: false },
    { id: fileCloseTabMenuId, enable: false },

    { id: editUndoMenuId, enable: true },
    { id: editRedoMenuId, enable: true },
    { id: editCutMenuId, enable: true },
    { id: editCopyMenuId, enable: true },
    { id: editPasteMenuId, enable: true },
    { id: editSelectAllMenuId, enable: true },
    { id: editPrevChangeMenuId, enable: false },
    { id: editNextChangeMenuId, enable: false },

    { id: pushToLeftMenuId, enable: false },
    { id: pushToRightMenuId, enable: false },
    { id: leftToRightFolderMenuId, enable: true },
    { id: rightToLeftFolderMenuId, enable: true },
    { id: leftToOtherFolderMenuId, enable: true },
    { id: rightToOtherFolderMenuId, enable: true },

    { id: selectChangedMenuId, enable: true },
    { id: selectByStateMenuId, enable: true },
    { id: launchComparisonsMenuId, enable: true },
    { id: expandAllFoldersMenuId, enable: true },
    { id: collapseAllFoldersMenuId, enable: true },

    { id: toggleWrapLinesMenuId, enable: false },
  ],
  'file': [
    { id: fileSaveLeftMenuId, enable: true },
    { id: fileSaveRightMenuId, enable: true },
    { id: fileSaveAllMenuId, enable: true },
    { id: fileCloseTabMenuId, enable: false },

    { id: editUndoMenuId, enable: true },
    { id: editRedoMenuId, enable: true },
    { id: editCutMenuId, enable: true },
    { id: editCopyMenuId, enable: true },
    { id: editPasteMenuId, enable: true },
    { id: editSelectAllMenuId, enable: true },
    { id: editPrevChangeMenuId, enable: true },
    { id: editNextChangeMenuId, enable: true },

    { id: pushToLeftMenuId, enable: true },
    { id: pushToRightMenuId, enable: true },
    { id: leftToRightFolderMenuId, enable: false },
    { id: rightToLeftFolderMenuId, enable: false },
    { id: leftToOtherFolderMenuId, enable: false },
    { id: rightToOtherFolderMenuId, enable: false },

    { id: selectChangedMenuId, enable: false },
    { id: selectByStateMenuId, enable: false },
    { id: launchComparisonsMenuId, enable: false },
    { id: expandAllFoldersMenuId, enable: false },
    { id: collapseAllFoldersMenuId, enable: false },

    { id: toggleWrapLinesMenuId, enable: true },
  ]
}