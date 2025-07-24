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

const keyBinding: { [id: string]: string } = isWindows ? {
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

  'actions.selectChanged': 'Ctrl+S',
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

  'merging.pushToLeft': 'Cmd+Shift+Left',
  'merging.pushToRight': 'Cmd+Shift+Right',

  'actions.selectChanged': 'Cmd+Ctrl+C',
  'actions.expandAllFolders': 'Cmd+Ctrl+=',
  'actions.collapseAllFolders': 'Cmd+Ctrl+-',
};

export class Menubar {
  browserWindow: BrowserWindow;
  preferences: BrowserWindow;
  // keyBinding;
  template: MenuItemConstructorOptions[];

  constructor(mainWindow: BrowserWindow) {
    this.browserWindow = mainWindow;
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

  preferenceClickHandler(item, focusedWindow): void {
    if(this.preferences && !this.preferences.isDestroyed()) {
      this.preferences.show();
    } else {
      const preferences = this.preferences = new BrowserWindow({
        parent: this.browserWindow, modal: false, show: false,
        // titleBarStyle: 'hidden',
        titleBarStyle: 'default',
        title: 'Preferences',
        // x, y, width, height,
        width: 674+250, height: 676,
        minWidth: 674, minHeight: 676,

        webPreferences: {
          // devTools: false,
          preload: app.isPackaged
            ? path.join(__dirname, 'preload.js')
            : path.join(__dirname, '../../.erb/dll/preload.js'),
        },
      });
      preferences.loadURL(resolveHtmlPath('preferences.html'));
      // self.setupDevelopmentEnvironment(preferences);
      preferences.once('ready-to-show', () => {
        // preferences.webContents.openDevTools({activate: false, mode: 'right'});
        preferences.show();
      });
    }
  }

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
          click: this.preferenceClickHandler.bind(this),
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
    if(isWindows) {
      fileSubmenu.push({
        label: 'Preferences...',
        accelerator: 'Ctrl+P',
        click: this.preferenceClickHandler.bind(this),
      });
    }

    if(fileSubmenu.length > 0)fileSubmenu.push({ type: 'separator' as const });

    fileSubmenu.push({
      label: '&Close',
      accelerator: keyBinding['file.close'],
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
        { label: 'Undo', accelerator: keyBinding['edit.undo'], role: 'undo' },
        { label: 'Redo', accelerator: keyBinding['edit.redo'], role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: keyBinding['edit.cut'], role: 'cut' },
        { label: 'Copy', accelerator: keyBinding['edit.copy'],
          role: 'copy',
          // click: () => { console.log('click event handler is called ..'); shell.beep(); },
        },
        { label: 'Paste', accelerator: keyBinding['edit.paste'],
          role: 'paste',
          // click: () => {},
        },
        { label: 'Select All', accelerator: keyBinding['edit.selectAll'], role: 'selectAll' },
      ],
    });
  }

  addViewMenu(options: MenuItemConstructorOptions[]): void {
    options.push({
      label: '&View',
      submenu: [],
    });
  }

  addMergingMenu(options: MenuItemConstructorOptions[]): void {
    options.push({
      label: '&Merging',
      submenu: [
        {
          label: 'Current Change',
          submenu: [
            { label: 'Push to Left', accelerator: keyBinding['merging.pushToLeft'], enabled: false },
            { label: 'Push to Right', accelerator: keyBinding['merging.pushToRight'], enabled: false }
          ]
        },
      ],
    });
  }

  addActionsMenu(options: MenuItemConstructorOptions[]): void {
    options.push({
      label: '&Actions',
      submenu: [
        { label: 'Select Rows', submenu: [
          {
            label: 'Select Changed',
            accelerator: keyBinding['actions.selectChanged'],
            // enabled: false,
            click(item, focusedWindow) {
              mainWindow.send('menu click', { cmd: 'actions:select changed' });
            }
          },
          {
            label: 'Select by State...',
            // accelerator: keyBinding['actions.selectByState'], // none
            // enabled: false,
            click(item, focusedWindow) {
              mainWindow.send('menu click', { cmd: 'actions:select by state' });
            }
          },
        ] },
        { label: 'Expand All Folders', accelerator: keyBinding['actions.expandAllFolders'],
          click(item, focusedWindow) {
            mainWindow.send('menu click', { cmd: 'actions:expand all folders' });
          }
        },
        { label: 'Collapse All Folders', accelerator: keyBinding['actions.collapseAllFolders'],
          click(item, focusedWindow) {
            mainWindow.send('menu click', { cmd: 'actions:collapse all folders' });
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