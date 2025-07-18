/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, screen, ipcMain, Menu, MenuItem, IpcMainEvent, MenuItemConstructorOptions } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { _readdirSyncWithStat, resolveHtmlPath } from './utils';

import { CompareItem, SerializableMenuItem } from '../common/Types';
import { CompareFolder } from './compare/CompareFolder';
import { Channels } from './preload';
import fs from 'fs';
import { DirentExt } from './Types';
import { StringDecoder } from 'string_decoder';
import { Menubar } from './Menubar';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

class MainWindow {
  browserWindow: BrowserWindow | null = null;
  isDebug: boolean = false;
  menubar: Menubar;

  constructor() {
    if(process.env.NODE_ENV === 'production') {
      const sourceMapSupport = require('source-map-support');
      sourceMapSupport.install();
    }

    this.isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

    if(this.isDebug) {
      require('electron-debug')();
    }
  }

  installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS'];

    return installer
      .default(
        extensions.map((name) => installer[name]),
        forceDownload,
      )
      .catch(console.log);
  };

  getMaxScreenSize = () => {
    let rect = { x: -1, y: -1, height: -1, width: -1 };
    const _screen = screen.getDisplayMatching(rect);
    return {
      ..._screen.workArea
    }
  }

  getWindowSize = () => {

    // todo: if dev maxmize window
    // else if exist last state window size then use
    // else set to default size (width: 1024, height: 728)

    const {
      width: maxWidth,
      height: maxHeight
    } = this.getMaxScreenSize();

    return {
      x: 0, y: 0,
      width: maxWidth,
      height: maxHeight
    }
  }

  installIpc = () => {
    const self = this;

    ipcMain.on('new', async (event, args: any[]) => {
      console.log('[new] args =', args);
      const arg = args[0] as CompareItem;
      if(arg.type == 'file') {
        // not use
      } else if(arg.type == 'folder') {
        const ret = await new CompareFolder(arg.uid).run(arg);
        console.log('ret =', ret);
      }
    });

    ipcMain.on('menu enable', (event, args: any[]) => {
      console.log('[menu enable] args =', args);
      const arg = args[0];
      const applicationMenu = Menu.getApplicationMenu();
      applicationMenu.items.find((el) => {});

      // console.log('applicationMenu =', applicationMenu);

      /*
      applicationMenu = <ref *1> Menu {
        (object) commandsMap: {
          'NN': MenuItem {
            label: 'Label',
            submenu: [Menu],
            type: 'submenu',
            role: null,
            accelerator: null,
            icon: null,
            sublabel: '',
            toolTip: '',
            enabled: true,
            visible: true,
            checked: false,
            acceleratorWorksWhenHidden: true,
            registerAccelerator: true,
            commandId: 93,
            userAccelerator: [Getter],
            click: [Function (anonymous)],
            menu: [Circular *1]
          },
          ...
        }
        (array) items: [
          MenuItem {
            label: 'Label',
            submenu: [Menu],
            type: 'submenu',
            role: null,
            accelerator: null,
            icon: null,
            sublabel: '',
            toolTip: '',
            enabled: true,
            visible: true,
            checked: false,
            acceleratorWorksWhenHidden: true,
            registerAccelerator: true,
            commandId: 93,
            userAccelerator: [Getter],
            click: [Function (anonymous)],
            menu: [Circular *1]
          },
          ...
        ]
      }
      */

      // for(let i = 0; i < arg.length; i++) {}
    });

    /* ipcMain.on('handle title dblclick', (event, args: any[]) => {
      // console.log('[handle title dblclick, args =', args);
      const arg = args[0];
      if(this.browserWindow.isMaximized()) {
        this.browserWindow.unmaximize();
      } else {
        this.browserWindow.maximize();
      }
    }); */

    function helper(obj, type: string, val: string) {
      if(obj[val]) {
        // console.log(typeof obj[val]);
        if(type == 'function')
          return obj[val]();
        else if(type == 'property')
          return obj[val];
      }
      return null;
    }

    ipcMain.handle('window get', (event, args: any[]) => {
      if(args.length > 1) {
        const [ type, value ] = args;
        return helper(this.browserWindow, type, value);
      }
      return null;
    });

    ipcMain.handle('process get', (event, args: any[]) => {
      if(args.length > 1) {
        const [ type, value ] = args;
        return helper(process, type, value);
      }
      return null;
    });

    ipcMain.on('window fn', (event, args: any[]) => {
      // const arg = args[0];
      const [ fn ] = args;
      // console.log(typeof this.browserWindow[arg]);
      if(this.browserWindow[fn] && typeof this.browserWindow[fn] == 'function') {
        this.browserWindow[fn]();
      }
    });

    function createMenu(event: IpcMainEvent, onClick: string, items): Menu {
      const menu = new Menu();

      items.forEach(item => {
        let menuitem: MenuItem;

        // Separator
        if(item.type === 'separator') {
          menuitem = new MenuItem({
            type: item.type,
          });
        }

        // Sub Menu
        else if(Array.isArray(item.submenu)) {
          menuitem = new MenuItem({
            submenu: createMenu(event, onClick, item.submenu),
            label: item.label
          });
        }

        // Normal Menu Item
        else {
          menuitem = new MenuItem({
            label: item.label,
            type: item.type,
            accelerator: item.accelerator,
            checked: item.checked,
            enabled: item.enabled,
            visible: item.visible,
            click: (menuItem, win, contextmenuEvent) => event.sender.send(onClick, item.id, contextmenuEvent)
          });
        }

        menu.append(menuitem);
      });

      return menu;
    }

    ipcMain.on('contextmenu', (event, args: any[]) => {
      // (event, contextMenuId, items, onClick, options) => {
      const [ contextMenuId, items, onClick, options ] = args;

      const menu = createMenu(event, onClick, items);
      menu.popup({
        x: options ? options.x : undefined,
        y: options ? options.y : undefined,
        callback: () => {
          console.log('menu popup callback is called ..');
          if(menu) {
            event.sender.send('contextmenu close', contextMenuId);
          }
        }
      });
    });

    ipcMain.handle('read file in fileview', async (event, args: any[]) => {
      const [ path_lhs, path_rhs ] = args;
      const buf_lhs: Buffer = fs.readFileSync(path_lhs);
      const buf_rhs: Buffer = fs.readFileSync(path_rhs);
      const decoder = new StringDecoder('utf8');
      const data_lhs = decoder.write(buf_lhs);
      const data_rhs = decoder.write(buf_rhs);
      return { data_lhs, data_rhs };
    });

    ipcMain.handle('read folder in input', async (event, args: any[]) => {
      const [ value, type ] = args;
      const _path = value.substring(0, value.lastIndexOf(path.sep));
      const last = value.substring(value.lastIndexOf(path.sep)+1, value.length);
      let reads: DirentExt[] = await _readdirSyncWithStat(_path);
      reads = reads.filter((item) => item.name.startsWith(last)).filter((item) => item.isDirectory);
      return reads;
    });

    ipcMain.handle('menu get', (event, args: any[]) => {
      // return serialized menu n install handler

      function createItem(item: MenuItemConstructorOptions/* , processedItems: MenuItemConstructorOptions[] */): SerializableMenuItem {
        const serializableItem: SerializableMenuItem = {
          // id: processedItems.length,
          label: item.label,
          type: item.type,
          accelerator: item.accelerator,
          checked: item.checked,
          enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
          visible: typeof item.visible === 'boolean' ? item.visible : true
        }

        // Submenu
        if(Array.isArray(item.submenu)) {
          serializableItem.submenu = item.submenu.map(submenuItem => createItem(submenuItem));
        }

        return serializableItem;
      }

      const template = self.menubar.getTemplate();
      return template
        .filter(item => item.id !== 'application')
        .map(item => createItem(item));
    });
  }

  createWindow = async () => {
    /* if(this.isDebug) {
      await this.installExtensions();
    } */

    const RESOURCES_PATH = app.isPackaged
      ? path.join(process.resourcesPath, 'assets')
      : path.join(__dirname, '../../assets');

    const getAssetPath = (...paths: string[]): string => {
      return path.join(RESOURCES_PATH, ...paths);
    };

    const { x, y, width, height } = this.getWindowSize();

    const MENUBAR_HEIGHT = 31;
    const MACOS_TRAFFIC_LIGHTS_HEIGHT = 16;

    ///* index
    this.browserWindow = new BrowserWindow({
      // show: false,
      // width: 1024, height: 728,
      titleBarStyle: 'hidden',
      titleBarOverlay: process.platform === 'darwin',
      trafficLightPosition: {
        x: 20,
        y: (MENUBAR_HEIGHT - MACOS_TRAFFIC_LIGHTS_HEIGHT) / 2,
      },

      x, y, width, height,
      minWidth: 800,
      minHeight: 600,

      icon: getAssetPath('icon.png'),
      webPreferences: {
        // devTools: false,
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
      },
    });
    this.browserWindow.loadURL(resolveHtmlPath('index.html'));
    //*/

    /* preferences
    this.browserWindow = new BrowserWindow({
      // parent: self.browserWindow, modal: false, show: false,
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
    this.browserWindow.loadURL(resolveHtmlPath('preferences.html'));
    //*/

    this.installIpc();

    this.browserWindow.on('ready-to-show', () => {
      if(!this.browserWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      if(process.env.START_MINIMIZED) {
        this.browserWindow.minimize();
      } else {
        this.browserWindow.show();
      }

      // if(process.env.NODE_ENV === 'development')
      //   this.browserWindow.webContents.openDevTools();
    });

    this.browserWindow.on('closed', () => {
      this.browserWindow = null;
    });

    this.browserWindow.on('maximize', () => {
      this.browserWindow.webContents.send('window state changed', { isMaximized: true });
    });

    this.browserWindow.on('unmaximize', () => {
      this.browserWindow.webContents.send('window state changed', { isMaximized: false });
    });

    // const menuBuilder = new MenuBuilder(this.browserWindow);
    // menuBuilder.buildMenu();

    const menubar = this.menubar = new Menubar(this.browserWindow);
    menubar.install();

    // Open urls in the user's browser
    this.browserWindow.webContents.setWindowOpenHandler((edata) => {
      shell.openExternal(edata.url);
      return { action: 'deny' };
    });

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    new AppUpdater();
  }

  send(channel: Channels, ...args: any[]): void {
    if(this.browserWindow) {
      if(this.browserWindow.isDestroyed() || this.browserWindow.webContents.isDestroyed()) {
        console.log(`Sending IPC message to channel '${channel}' for window that is destroyed`);
        return;
      }

      try {
        this.browserWindow.webContents.send(channel, ...args);
      } catch(error) {
        // console.log(`Error sending IPC message to channel '${channel}' of window ${this._id}: ${toErrorMessage(error)}`);
      }
    }
  }

}

/**
 * Add event listeners...
 */

app?.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if(process.platform !== 'darwin') {
    app.quit();
  }
});

export const mainWindow = new MainWindow();

app
  ?.whenReady()
  .then(() => {
    mainWindow.createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      // TODO: if(mainWindow === null) mainWindow.createWindow();
    });
  })
  .catch(console.log);
