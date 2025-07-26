console.log('👋 This message is being logged by "renderer", included via webpack');

import '@vscode/codicons/dist/codicon.css';
import './index.css';
import './popup.css';
import './dialog.css';
import { MainLayout, MainLayoutService } from './layout/MainLayout';
import { domContentLoaded } from './util/dom';
import { mainWindow } from './Types';
import { SerializableMenuItem } from '../common/Types';

export class Renderer {

  window: {
    isMaximized?: boolean;
    isMinimized?: boolean;
  } = {};

  process: {
    platform?: string // 'darwin', 'window', 'linux'
  } = {}

  menu: SerializableMenuItem[];

  constructor() {}

  async open() {
    await Promise.all([ domContentLoaded(mainWindow), this.loadInMain() ]);
    const mainLayout = new MainLayout(mainWindow.document.body);
    mainLayout.startup();
  }

  async loadInMain(): Promise<void> {
    this.window.isMaximized = await window.ipc.invoke('window get', 'function', 'isMaximized');
    this.window.isMinimized = await window.ipc.invoke('window get', 'function', 'isMinimized');
    this.process.platform = await window.ipc.invoke('process get', 'property', 'platform');
    this.menu = await window.ipc.invoke('menu get');
  }
}

export const renderer = new Renderer();
renderer.open();
