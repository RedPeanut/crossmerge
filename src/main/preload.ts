// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer, IpcRendererEvent, IpcRenderer } from 'electron';

// render to main
export type MainEvents =
  // compare
  'new'

  // menu
  | 'menu enable'
  | 'menu get'

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

  // fs
  | 'fs lstat'

  // action (descriptive form)
  // | 'handle title dblclick'
  | 'read file in fileview'
  | 'read folder in input'
  | 'copy file'
  | 'read folder'
  | 'save file'
  | 'read file'
  | 'compare file'

  // contextmenu
  | 'contextmenu'

  // electron
  | 'picker folder'
;

// main to render
export type RenderEvents =
  // 'read file data'
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
  // renderer to main
  // send - on
  send(channel: Channels, ...args: any[]): void {
    ipcRenderer.send(channel, args);
  },
  // invoke - handle
  invoke(channel: Channels, ...args: any[]): Promise<any> {
    return ipcRenderer.invoke(channel, args);
  },

  // main to renderer
  // send - on
  /**
   * off is not working directly, because parameters are copied when they are sent over the bridge
   * ref) https://github.com/electron/electron/issues/45224
   * https://www.electronjs.org/docs/latest/api/context-bridge#parameter--error--return-type-support
   */
  on: (channel: Channels, cb: (...args: any[]) => void): any => {
    const listener = (event, payload) => cb(event, payload);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.off(channel, listener);
  },
  off: (channel: string, cb: (...args: any[]) => void): void => {
    ipcRenderer.off(channel, cb);
  },
  once: (channel: string, cb: (...args: any[]) => void): void => {
    ipcRenderer.once(channel, cb);
  },
  /* listenerCount: (eventName: string): number => {
    return ipcRenderer.listenerCount(eventName);
  } */
};

contextBridge.exposeInMainWorld('ipc', electronHandler);
ipcRenderer.setMaxListeners(0);

export type ElectronHandler = typeof electronHandler;
