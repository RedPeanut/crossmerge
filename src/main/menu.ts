import {
  app,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';
import path from 'path';
import { mainWindow } from './main';
import { resolveHtmlPath } from './utils';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
  browserWindow: BrowserWindow;
  preferences: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.browserWindow = mainWindow;
  }

  buildMenu(): Menu {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment(this.browserWindow);
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(window: BrowserWindow): void {
    window.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            window.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: window });
    });
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const self = this;

    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: 'crossmerge',
      submenu: [
        {
          label: 'About crossmerge',
          selector: 'orderFrontStandardAboutPanel:',
        },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'Command+,',
          click(item, focusedWindow) {
            if(self.preferences && !self.preferences.isDestroyed()) {
              self.preferences.show();
            } else {
              const preferences = self.preferences = new BrowserWindow({
                parent: self.browserWindow, modal: false, show: false,
                // titleBarStyle: 'hidden',
                titleBarStyle: 'default',
                title: 'Preferences',
                // x, y, width, height,
                webPreferences: {
                  devTools: false,
                  preload: app.isPackaged
                    ? path.join(__dirname, 'preload.js')
                    : path.join(__dirname, '../../.erb/dll/preload.js'),
                },
              });
              self.setupDevelopmentEnvironment(preferences);
              preferences.loadURL(resolveHtmlPath('preferences.html'));
              preferences.once('ready-to-show', () => {
                preferences.show();
              });
            }
          },
        },
        { type: 'separator' },
        { label: 'Services', submenu: [] },
        { type: 'separator' },
        {
          label: 'Hide ElectronReact',
          accelerator: 'Command+H',
          selector: 'hide:',
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:',
        },
        { label: 'Show All', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };
    const subMenuEdit: DarwinMenuItemConstructorOptions = {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:',
        },
      ],
    };

    const subMenuMerging: MenuItemConstructorOptions = {
      label: 'Merging',
      submenu: [
        { label: 'Current Change', submenu: [
          { label: 'Push to Left', accelerator: 'Ctrl+Shift+Left', },
          { label: 'Push to Right', accelerator: 'Ctrl+Shift+Right', }
        ] },
      ],
    };

    const subMenuActions: MenuItemConstructorOptions = {
      label: 'Actions',
      submenu: [
        { label: 'Select Rows', submenu: [
          { label: 'Select Changed', accelerator: 'Command+Ctrl+C',
            click(item, focusedWindow) {
              mainWindow.send('menu click', { cmd: 'actions:select changed' });
            }
          }
        ] },
        { label: 'Expand All Folders', accelerator: 'Command+Ctrl+=',
          click(item, focusedWindow) {
            mainWindow.send('menu click', { cmd: 'actions:expand all folders' });
          }
        },
        { label: 'Collapse All Folders', accelerator: 'Command+Ctrl+-',
          click(item, focusedWindow) {
            mainWindow.send('menu click', { cmd: 'actions:collapse all folders' });
          }
        },
      ],
    };

    const subMenuViewDev: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => {
            this.browserWindow.webContents.reload();
          },
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.browserWindow.setFullScreen(!this.browserWindow.isFullScreen());
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.browserWindow.webContents.toggleDevTools();
          },
        },
      ],
    };
    const subMenuViewProd: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.browserWindow.setFullScreen(!this.browserWindow.isFullScreen());
          },
        },
      ],
    };
    const subMenuWindow: DarwinMenuItemConstructorOptions = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:',
        },
        { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
        { type: 'separator' },
        { label: 'Bring All to Front', selector: 'arrangeInFront:' },
      ],
    };
    const subMenuHelp: MenuItemConstructorOptions = {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            shell.openExternal('https://electronjs.org');
          },
        },
        {
          label: 'Documentation',
          click() {
            shell.openExternal(
              'https://github.com/electron/electron/tree/main/docs#readme',
            );
          },
        },
        {
          label: 'Community Discussions',
          click() {
            shell.openExternal('https://www.electronjs.org/community');
          },
        },
        {
          label: 'Search Issues',
          click() {
            shell.openExternal('https://github.com/electron/electron/issues');
          },
        },
      ],
    };

    const subMenuView =
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
        ? subMenuViewDev
        : subMenuViewProd;

    return [subMenuAbout, subMenuEdit,
      subMenuMerging, subMenuActions,
      subMenuView, subMenuWindow, subMenuHelp];
  }

  buildDefaultTemplate(): MenuItemConstructorOptions[] {
    const self = this;

    const subMenuFile = {
      label: '&File',
      submenu: [
        {
          label: '&Open',
          accelerator: 'Ctrl+O',
        },
        { type: 'separator' as const },
        {
          label: 'Preferences...',
          accelerator: 'Ctrl+P',
          click(item, focusedWindow) {
            if(self.preferences && !self.preferences.isDestroyed()) {
              self.preferences.show();
            } else {
              const preferences = self.preferences = new BrowserWindow({
                parent: self.browserWindow, modal: false, show: false,
                // titleBarStyle: 'hidden',
                titleBarStyle: 'default',
                title: 'Preferences',
                // x, y, width, height,
                webPreferences: {
                  devTools: false,
                  preload: app.isPackaged
                    ? path.join(__dirname, 'preload.js')
                    : path.join(__dirname, '../../.erb/dll/preload.js'),
                },
              });
              self.setupDevelopmentEnvironment(preferences);
              preferences.loadURL(resolveHtmlPath('preferences.html'));
              preferences.once('ready-to-show', () => {
                preferences.show();
              });
            }
          },
        },
        { type: 'separator' as const },
        {
          label: '&Close',
          accelerator: 'Ctrl+W',
          click: () => {
            this.browserWindow.close();
          },
        },
      ],
    };

    const subMenuMerging: MenuItemConstructorOptions = {
      label: 'Merging',
      submenu: [
        { label: 'Current Change', submenu: [
          { label: 'Push to Left', accelerator: 'Ctrl+Shift+Left', },
          { label: 'Push to Right', accelerator: 'Ctrl+Shift+Right', }
        ] },
      ],
    };

    const subMenuActions: MenuItemConstructorOptions = {
      label: 'Actions',
      submenu: [
        { label: 'Select Rows', submenu: [
          { label: 'Select Changed', accelerator: 'Alt+Ctrl+C',
            click(item, focusedWindow) {
              mainWindow.send('menu click', { cmd: 'actions:select changed' });
            }
          }
        ] },
        { label: 'Expand All Folders', accelerator: 'Alt+Ctrl+=',
          click(item, focusedWindow) {
            mainWindow.send('menu click', { cmd: 'actions:expand all folders' });
          }
        },
        { label: 'Collapse All Folders', accelerator: 'Alt+Ctrl+-',
          click(item, focusedWindow) {
            mainWindow.send('menu click', { cmd: 'actions:collapse all folders' });
          }
        },
      ],
    };

    const subMenuViewDev: MenuItemConstructorOptions = {
      label: '&View',
      submenu: [
        {
          label: '&Reload',
          accelerator: 'Ctrl+R',
          click: () => {
            this.browserWindow.webContents.reload();
          },
        },
        {
          label: 'Toggle &Full Screen',
          accelerator: 'F11',
          click: () => {
            this.browserWindow.setFullScreen(
              !this.browserWindow.isFullScreen(),
            );
          },
        },
        {
          label: 'Toggle &Developer Tools',
          accelerator: 'Alt+Ctrl+I',
          click: () => {
            this.browserWindow.webContents.toggleDevTools();
          },
        },
      ]
    };

    const subMenuViewProd: MenuItemConstructorOptions = {
      label: '&View',
      submenu: [
        {
          label: 'Toggle &Full Screen',
          accelerator: 'F11',
          click: () => {
            this.browserWindow.setFullScreen(
              !this.browserWindow.isFullScreen(),
            );
          },
        }
      ]
    };

    const subMenuHelp: MenuItemConstructorOptions = {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            shell.openExternal('https://electronjs.org');
          },
        },
        {
          label: 'Documentation',
          click() {
            shell.openExternal(
              'https://github.com/electron/electron/tree/main/docs#readme',
            );
          },
        },
        {
          label: 'Community Discussions',
          click() {
            shell.openExternal('https://www.electronjs.org/community');
          },
        },
        {
          label: 'Search Issues',
          click() {
            shell.openExternal('https://github.com/electron/electron/issues');
          },
        },
      ],
    };

    const subMenuView =
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
      ? subMenuViewDev
      : subMenuViewProd;

    return [subMenuFile,
      subMenuMerging, subMenuActions,
      subMenuView, subMenuHelp];
  }

}
