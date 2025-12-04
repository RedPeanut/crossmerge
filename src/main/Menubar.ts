import {
  app,
  Menu,
  MenuItem,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';
import { isMacintosh, isWindows } from '../common/util/platform';
import path from 'path';
import { resolveHtmlPath } from './utils';
import { mainWindow } from './main';
import {
  appPreferencesMenuId, appQuitMenuId,
  fileSaveMenuId, fileSaveLeftMenuId, fileSaveRightMenuId, fileSaveAllMenuId, /* fileCloseMenuId,  */fileCloseTabMenuId, filePreferencesMenuId,
  editUndoMenuId, editRedoMenuId, editCutMenuId, editCopyMenuId, editPasteMenuId, editSelectAllMenuId, editPrevChangeMenuId, editNextChangeMenuId,
  pushToLeftMenuId, pushToRightMenuId, leftToRightFolderMenuId, rightToLeftFolderMenuId, leftToOtherFolderMenuId, rightToOtherFolderMenuId,
  selectChangedMenuId, selectByStateMenuId, launchComparisonsMenuId, expandAllFoldersMenuId, collapseAllFoldersMenuId,
  toggleWrapLinesMenuId
} from '../common/Types';

// { id: [Win, Mac] }
const keyBindingIdx = isWindows ? 0 : 1;
const keyBinding: { [id: string]: string[] } = {};
keyBinding[appPreferencesMenuId] = [ null, 'Cmd+,' ];
keyBinding[appQuitMenuId] = [ null, 'Cmd+Q' ];
keyBinding[fileSaveLeftMenuId] =  ['Ctrl+1', 'Cmd+1' ];
keyBinding[fileSaveRightMenuId] =  ['Ctrl+2', 'Cmd+2' ];
keyBinding[fileSaveAllMenuId] =  ['Ctrl+S', 'Cmd+Alt+S' ];
keyBinding[filePreferencesMenuId] =  ['Ctrl+P', null ];
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
keyBinding[expandAllFoldersMenuId] = [ 'Ctrl+=', 'Cmd+Ctrl+=' ];
keyBinding[collapseAllFoldersMenuId] = [ 'Ctrl+-', 'Cmd+Ctrl+-' ];

keyBinding[toggleWrapLinesMenuId] = [ 'Alt+Z', 'Alt+Z' ];

/* const keyBinding: { [id: string]: string } = isWindows ? {
  // 'file.preferences': 'Ctrl+P',
  'file.close': 'Ctrl+W',
  'edit.undo': 'Ctrl+Z',
  'edit.redo': 'Shift+Ctrl+Z',
  'edit.cut': 'Ctrl+X',
  'edit.copy': 'Ctrl+C',
  'edit.paste': 'Ctrl+V',
  'edit.selectAll': 'Ctrl+A',

  'merging.pushToLeft': 'Ctrl+W',
  'merging.pushToRight': 'Ctrl+Q',
  'merging.leftToRightFoler': 'Ctrl+W',
  'merging.rightToLeftFoler': 'Ctrl+Q',

  'actions.selectChanged': 'Ctrl+S',
  'actions.launchComparisons': 'Ctrl+M',
  'actions.expandAllFolders': 'Ctrl+=',
  'actions.collapseAllFolders': 'Ctrl+-',
} : {
  // 'app.preferences': 'Cmd+,',
  // 'app.quit': 'Cmd+Q',
  'file.close': 'Cmd+W',
  'edit.undo': 'Cmd+Z',
  'edit.redo': 'Shift+Cmd+Z',
  'edit.cut': 'Cmd+X',
  'edit.copy': 'Cmd+C',
  'edit.paste': 'Cmd+V',
  'edit.selectAll': 'Cmd+A',

  'merging.pushToLeft': 'Ctrl+Shift+Left',
  'merging.pushToRight': 'Ctrl+Shift+Right',
  'merging.leftToRightFoler': 'Alt+W',
  'merging.rightToLeftFoler': 'Alt+Q',

  'actions.selectChanged': 'Cmd+Ctrl+C',
  'actions.launchComparisons': 'Cmd+Shift+L',
  'actions.expandAllFolders': 'Cmd+Ctrl+=',
  'actions.collapseAllFolders': 'Cmd+Ctrl+-',
}; */

export class Menubar {
  // browserWindow: BrowserWindow;
  preferences: BrowserWindow;
  // keyBinding;
  template: MenuItemConstructorOptions[];

  constructor(mainWindow: BrowserWindow) {
    // this.browserWindow = mainWindow;
    // this.keyBinding = isWindows ? keyBinding_win : keyBinding_mac;
  }

  install(): void {

    // (mac)app, File, Edit, Merging, Actions, View, Help
    // const menu = new Menu();
    // menu.append(...);
    // Menu.setApplicationMenu(menu);

    /* new MenuItem({
      click?: (menuItem: MenuItem, browserWindow: (BrowserWindow) | (undefined), event: KeyboardEvent) => void;
      role?: ('undo' | 'redo' | 'cut' | 'copy' | 'paste' | 'pasteAndMatchStyle' | 'delete' | 'selectAll' | 'reload' | 'forceReload' | 'toggleDevTools' | 'resetZoom' | 'zoomIn' | 'zoomOut' | 'toggleSpellChecker' | 'togglefullscreen' | 'window' | 'minimize' | 'close' | 'help' | 'about' | 'services' | 'hide' | 'hideOthers' | 'unhide' | 'quit' | 'showSubstitutions' | 'toggleSmartQuotes' | 'toggleSmartDashes' | 'toggleTextReplacement' | 'startSpeaking' | 'stopSpeaking' | 'zoom' | 'front' | 'appMenu' | 'fileMenu' | 'editMenu' | 'viewMenu' | 'shareMenu' | 'recentDocuments' | 'toggleTabBar' | 'selectNextTab' | 'selectPreviousTab' | 'showAllTabs' | 'mergeAllWindows' | 'clearRecentDocuments' | 'moveTabToNewWindow' | 'windowMenu');
      type?: ('normal' | 'separator' | 'submenu' | 'checkbox' | 'radio');
      label?: string;
      sublabel?: string;
      toolTip?: string;
      accelerator?: Accelerator;
      icon?: (NativeImage) | (string);
      enabled?: boolean;
      acceleratorWorksWhenHidden?: boolean;
      visible?: boolean;
      checked?: boolean;
      registerAccelerator?: boolean;
      sharingItem?: SharingItem;
      submenu?: (MenuItemConstructorOptions[]) | (Menu);
      id?: string;
      before?: string[];
      after?: string[];
      beforeGroupContaining?: string[];
      afterGroupContaining?: string[];
    }); */

    const template: MenuItemConstructorOptions[] = this.template = [];

    if(isMacintosh) {
      // set application menu
      this.addApplicationMenu(template);
    }

    this.addFileMenu(template);
    this.addEditMenu(template);
    this.addMergingMenu(template);
    this.addActionsMenu(template);
    this.addViewMenu(template);
    this.addWindowMenu(template);
    this.addHelpMenu(template);

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  getTemplate(): MenuItemConstructorOptions[] { return this.template; }

  addApplicationMenu(options: MenuItemConstructorOptions[]): void {
    // const self = this;
    options.push({
      id: 'application',
      label: 'crossmerge',
      submenu: [
        {
          label: 'About crossmerge',
          // selector: 'orderFrontStandardAboutPanel:',
        },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'Command+,',
          click: mainWindow.preferenceClickHandler.bind(mainWindow),
        },
        /* { type: 'separator' },
        { label: 'Services', submenu: [] }, */
        { type: 'separator' },
        {
          label: 'Hide crossmerge',
          accelerator: 'Command+H',
          // selector: 'hide:',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          // selector: 'hideOtherApplications:',
          role: 'hideOthers'
        },
        /* { label: 'Show All',
          // selector: 'unhideAllApplications:'
          role: 'unhide'
        }, */
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          role: 'quit',
          /* click: () => {
            app.quit();
          }, */
        },
      ],
    });
  }

  addFileMenu(options: MenuItemConstructorOptions[]): void {
    const fileSubmenu: MenuItemConstructorOptions[] = [];

    fileSubmenu.push({
      label: 'Save',
      submenu: [
        {
          id: fileSaveLeftMenuId,
          label: 'Save Left',
          accelerator: keyBinding[fileSaveLeftMenuId][keyBindingIdx],
          // enabled: false,
          click(item, focusedWindow) {
            mainWindow.send('menu click', fileSaveLeftMenuId);
          }
        },
        {
          id: fileSaveRightMenuId,
          label: 'Save Right',
          accelerator: keyBinding[fileSaveRightMenuId][keyBindingIdx],
          // enabled: false,
          click(item, focusedWindow) {
            mainWindow.send('menu click', fileSaveRightMenuId);
          }
        },
        { type: 'separator' as const },
        {
          id: fileSaveAllMenuId,
          label: 'Save All',
          accelerator: keyBinding[fileSaveAllMenuId][keyBindingIdx],
          // enabled: false,
          click(item, focusedWindow) {
            mainWindow.send('menu click', fileSaveAllMenuId);
          }
        }
      ]
    });

    if(isWindows) {
      fileSubmenu.push({
        label: 'Preferences...',
        accelerator: keyBinding[filePreferencesMenuId][keyBindingIdx],
        click: mainWindow.preferenceClickHandler.bind(mainWindow),
      });
    }

    if(fileSubmenu.length > 0)
      fileSubmenu.push({ type: 'separator' as const });

    fileSubmenu.push({
      label: 'Close &Tab',
      accelerator: keyBinding[fileCloseTabMenuId][keyBindingIdx],
      click: () => {
        // this.browserWindow.close();
      },
    });

    options.push({
      label: '&File',
      submenu: fileSubmenu
    });
  }

  addEditMenu(options: MenuItemConstructorOptions[]): void {
    options.push({
      label: '&Edit',
      submenu: [
        { id: editUndoMenuId, label: 'Undo', accelerator: keyBinding[editUndoMenuId][keyBindingIdx], role: 'undo' },
        { id: editRedoMenuId, label: 'Redo', accelerator: keyBinding[editRedoMenuId][keyBindingIdx], role: 'redo' },
        { type: 'separator' },
        { id: editCutMenuId, label: 'Cut', accelerator: keyBinding[editCutMenuId][keyBindingIdx], role: 'cut' },
        {
          id: editCopyMenuId,
          label: 'Copy', accelerator: keyBinding[editCopyMenuId][keyBindingIdx],
          role: 'copy',
          // click: () => { console.log('click event handler is called ..'); shell.beep(); },
        },
        {
          id: editPasteMenuId,
          label: 'Paste', accelerator: keyBinding[editPasteMenuId][keyBindingIdx],
          role: 'paste',
          // click: () => {},
        },
        { id: editSelectAllMenuId, label: 'Select All', accelerator: keyBinding[editSelectAllMenuId][keyBindingIdx], role: 'selectAll' },
        { type: 'separator' },
        { id: editPrevChangeMenuId, label: 'Previous Change', accelerator: keyBinding[editPrevChangeMenuId][keyBindingIdx],
          click(item, focusedWindow) {
            mainWindow.send('menu click', editPrevChangeMenuId);
          }
        },
        { id: editNextChangeMenuId, label: 'Next Change', accelerator: keyBinding[editNextChangeMenuId][keyBindingIdx],
          click(item, focusedWindow) {
            mainWindow.send('menu click', editNextChangeMenuId);
          }
        },
      ],
    });
  }

  addViewMenu(options: MenuItemConstructorOptions[]): void {
    options.push({
      label: '&View',
      submenu: [
        {
          id: toggleWrapLinesMenuId,
          label: 'Toggle Wrap Lines',
          accelerator: keyBinding[toggleWrapLinesMenuId][keyBindingIdx],
          click(item, focusedWindow) {
            mainWindow.send('menu click', toggleWrapLinesMenuId);
          }
        },
      ],
    });
  }

  addMergingMenu(options: MenuItemConstructorOptions[]): void {
    options.push({
      label: '&Merging',
      submenu: [
        {
          label: 'Current Change',
          submenu: [
            {
              id: pushToLeftMenuId,
              label: 'Push to Left',
              accelerator: keyBinding[pushToLeftMenuId][keyBindingIdx],
              // enabled: false,
              click(item, focusedWindow) {
                mainWindow.send('menu click', pushToLeftMenuId);
              }
            },
            {
              id: pushToRightMenuId,
              label: 'Push to Right',
              accelerator: keyBinding[pushToRightMenuId][keyBindingIdx],
              // enabled: false,
              click(item, focusedWindow) {
                mainWindow.send('menu click', pushToRightMenuId);
              }
            }
          ]
        },
        {
          label: 'Copy selected items',
          submenu: [
            {
              id: leftToRightFolderMenuId,
              label: 'From Left to Right Folder...',
              accelerator: keyBinding[leftToRightFolderMenuId][keyBindingIdx],
              click(item, focusedWindow) {
                mainWindow.send('menu click', leftToRightFolderMenuId);
              }
            },
            {
              id: rightToLeftFolderMenuId,
              label: 'From Right to Left Folder...',
              accelerator: keyBinding[rightToLeftFolderMenuId][keyBindingIdx],
              click(item, focusedWindow) {
                mainWindow.send('menu click', rightToLeftFolderMenuId);
              }
            },
            { type: 'separator' },
            {
              id: leftToOtherFolderMenuId,
              label: 'From Left to Other Folder...',
              click(item, focusedWindow) {
                mainWindow.send('menu click', leftToOtherFolderMenuId);
              }
            },
            {
              id: rightToOtherFolderMenuId,
              label: 'From Right to Other Folder...',
              click(item, focusedWindow) {
                mainWindow.send('menu click', rightToOtherFolderMenuId);
              }
            },
          ]
        },
      ],
    });
  }

  addActionsMenu(options: MenuItemConstructorOptions[]): void {
    options.push({
      label: '&Actions',
      submenu: [
        {
          label: 'Select Rows',
          submenu: [
            {
              id: selectChangedMenuId,
              label: 'Select Changed',
              accelerator: keyBinding[selectChangedMenuId][keyBindingIdx],
              // enabled: false,
              click(item, focusedWindow) {
                mainWindow.send('menu click', selectChangedMenuId);
              }
            },
            {
              id: selectByStateMenuId,
              label: 'Select by State...',
              // accelerator: keyBinding[selectByStateMenuId][keyBindingIdx], // none
              // enabled: false,
              click(item, focusedWindow) {
                mainWindow.send('menu click', selectByStateMenuId);
              }
            },
          ]
        },
        { type: 'separator' },
        {
          id: launchComparisonsMenuId,
          label: 'Launch Comparisons for Selected Rows',
          accelerator: keyBinding[launchComparisonsMenuId][keyBindingIdx],
          click(item, focusedWindow) {
            mainWindow.send('menu click', launchComparisonsMenuId);
          }
        },
        { type: 'separator' },
        {
          id: expandAllFoldersMenuId,
          label: 'Expand All Folders',
          accelerator: keyBinding[expandAllFoldersMenuId][keyBindingIdx],
          click(item, focusedWindow) {
            mainWindow.send('menu click', expandAllFoldersMenuId);
          }
        },
        {
          id: collapseAllFoldersMenuId,
          label: 'Collapse All Folders',
          accelerator: keyBinding[collapseAllFoldersMenuId][keyBindingIdx],
          click(item, focusedWindow) {
            mainWindow.send('menu click', collapseAllFoldersMenuId);
          }
        },
      ],
    });
  }

  addWindowMenu(options: MenuItemConstructorOptions[]): void {
    options.push({
      label: 'Window',
      submenu: [],
    });
  }

  addHelpMenu(options: MenuItemConstructorOptions[]): void {
    options.push({
      label: '&Help',
      submenu: [],
    });
  }

}