console.log('👋 This message is being logged by "renderer", included via webpack');

import '@vscode/codicons/dist/codicon.css';
import './index.css';
import { MainLayout, MainLayoutService } from './layout/MainLayout';
import { domContentLoaded } from './util/dom';
import { mainWindow } from './Types';

export class Renderer {
  constructor() {}

  async open() {
    await Promise.all([domContentLoaded(mainWindow)]);
    const mainLayout = new MainLayout(mainWindow.document.body);
    mainLayout.startup();
  }
}

const renderer = new Renderer();
renderer.open();
