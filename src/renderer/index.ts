console.log('👋 This message is being logged by "renderer", included via webpack');

import '@vscode/codicons/dist/codicon.css';
import '../lib/mergely/mergely.css';
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

  // menu: SerializableMenuItem[];

  path: {
    sep?: string;
  } = {};

  package_json: {
    name: string,
    version: string,
    author: { name: string, email: string },
    license: string
  };

  idx: number = 0;
  // wrapLine: boolean = false; // temp

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
    // this.menu = await window.ipc.invoke('menu get');
    this.path.sep = this.process.platform === 'win32' ? '\\' : '/';
    this.package_json = await window.ipc.invoke('get package json');
  }
}

export const renderer = new Renderer();
renderer.open();
