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
import { app, BrowserWindow, shell, screen, ipcMain, Menu } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './utils';

import { CompareItem } from '../common/Types';
import { CompareFolder } from './compare/CompareFolder';
import { ReadFile } from './util/ReadFile';
import { Channels } from './preload';
import fs from 'fs';

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
    ipcMain.on('new', async (event, args: any[]) => {
      console.log('[new] args =', args);
      const arg = args[0] as CompareItem;
      if(arg.type == 'file') {
        const ret = new ReadFile(arg.uid).run(arg);
        console.log('ret =', ret);
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

    ipcMain.on('handle title dblclick', (event, args: any[]) => {
      // console.log('[handle title dblclick, args =', args);
      const arg = args[0];
      if(this.browserWindow.isMaximized()) {
        this.browserWindow.unmaximize();
      } else {
        this.browserWindow.maximize();
      }
    });

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
      if(args.length > 1)
        return helper(this.browserWindow, args[0], args[1]);
      return null;
    });

    ipcMain.handle('process get', (event, args: any[]) => {
      if(args.length > 1)
        return helper(process, args[0], args[1]);
      return null;
    });
  }

  createWindow = async () => {
    if(this.isDebug) {
      await this.installExtensions();
    }

    const RESOURCES_PATH = app.isPackaged
      ? path.join(process.resourcesPath, 'assets')
      : path.join(__dirname, '../../assets');

    const getAssetPath = (...paths: string[]): string => {
      return path.join(RESOURCES_PATH, ...paths);
    };

    const { x, y, width, height } = this.getWindowSize();

    const MENUBAR_HEIGHT = 31;
    const MACOS_TRAFFIC_LIGHTS_HEIGHT = 16;

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
      minHeight: 600,
      minWidth: 600,

      icon: getAssetPath('icon.png'),
      webPreferences: {
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
      },
    });

    this.installIpc();

    this.browserWindow.loadURL(resolveHtmlPath('index.html'));

    this.browserWindow.on('ready-to-show', () => {
      if(!this.browserWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      if(process.env.START_MINIMIZED) {
        this.browserWindow.minimize();
      } else {
        this.browserWindow.show();
      }
    });

    this.browserWindow.on('closed', () => {
      this.browserWindow = null;
    });

    const menuBuilder = new MenuBuilder(this.browserWindow);
    menuBuilder.buildMenu();

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
