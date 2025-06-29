// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer, IpcRendererEvent, IpcRenderer } from 'electron';

export type MainEvents =
  // compare
  'new'

  // menu
  | 'menu enable'

  // window
  /* | 'window move'
  | 'window resize'
  | 'window open context menu'
  | 'window command' */
  // | 'window maximize'
  // | 'window minimize'
  // | 'window close'
  | 'window get'
  | 'window fn'

  // process
  | 'process get'

  // config
  | 'config all'
  | 'config get'
  | 'config set'
  | 'config update'

  // action
  // | 'handle title dblclick'

  // contextmenu
  | 'contextmenu'
;

export type RenderEvents =
  'read file data'
  | 'compare folder start'
  | 'compare folder data'
  | 'compare folder end'

  // menu
  | 'menu click'

  // window
  | 'window state changed'

  // contextmenu
  | 'contextmenu on ${contextMenuId}'
  | 'contextmenu close'
;

export type Channels = MainEvents | RenderEvents;

const electronHandler = {
  send(channel: Channels, ...args: any[]) {
    ipcRenderer.send(channel, args);
  },
  invoke(channel: Channels, ...args: any[]) {
    return ipcRenderer.invoke(channel, args);
  },
  on: (channel: Channels, cb: (...args: any[]) => void) => {
    ipcRenderer.on(channel, cb);
  },

  once: (channel: string, cb: (...args: any[]) => void) => {
    ipcRenderer.once(channel, cb);
  },
  off: (channel: string, cb: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, cb);
  },
};

contextBridge.exposeInMainWorld('ipc', electronHandler);

export type ElectronHandler = typeof electronHandler;
