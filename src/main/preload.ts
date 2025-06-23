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
;

export type Channels = MainEvents | RenderEvents;

const electronHandler = {
  send(channel: Channels, ...args: any[]) {
    ipcRenderer.send(channel, args);
  },
  invoke(channel: Channels, ...args: any[]) {
    return ipcRenderer.invoke(channel, args);
  },
  on: (channel: Channels, cb: (...args: unknown[]) => void) => {
    ipcRenderer.on(channel, cb)
  },
  off: (channel: Channels, cb: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, cb)
  },
};

contextBridge.exposeInMainWorld('ipc', electronHandler);

export type ElectronHandler = typeof electronHandler;
