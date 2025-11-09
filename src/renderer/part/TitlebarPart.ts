import { renderer } from '..';
import { BodyLayoutService } from '../layout/BodyLayout';
import { TITLEBAR_HEIGHT } from '../layout/MainLayout';
import { Part } from '../Part';
import { bodyLayoutServiceId, getService } from '../Service';
import { $ } from '../util/dom';
import { Menubar } from './Menubar';

export class TitlebarPart extends Part {

  maxResBtn: HTMLElement;

  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    this.size = TITLEBAR_HEIGHT;
    // this.border = true;

    window.ipc.on('window state changed', (...args: any[]) => {
      // console.log('on window state changed is called ..');
      // console.log('args =', args);
      const arg = args[1];
      this.maxResBtn.classList.remove('codicon-chrome-restore', 'codicon-chrome-maximize');
      if(arg.isMaximized)
        this.maxResBtn.classList.add('codicon-chrome-restore');
      else
      this.maxResBtn.classList.add('codicon-chrome-maximize');
    });
  }

  override createContentArea(): HTMLElement {
    const container: HTMLElement = super.createContentArea();

    const menubar = $('.menubar');
    if(renderer.process.platform === 'darwin')
      menubar.style.paddingLeft = '80px';
    const left: HTMLElement = $('.left');

    const _menubar = new Menubar(left);
    _menubar.install();
    menubar.appendChild(left);

    const middle = $('.middle');
    const handleMaxOrRes = async (e) => {
      const isMaximized = await window.ipc.invoke('window get', 'function', 'isMaximized');
      if(isMaximized)
        window.ipc.send('window fn', 'browserWindow', 'unmaximize');
      else
        window.ipc.send('window fn', 'browserWindow', 'maximize');
    }
    middle.addEventListener('dblclick', handleMaxOrRes);
    menubar.appendChild(middle);

    // console.log('renderer =', renderer);
    // console.log('renderer.window =', renderer.window);
    // console.log('renderer.process =', renderer.process);

    const right: HTMLElement = $('.right');
    const minimizeBtn = $('a.codicon.codicon-chrome-minimize');
    minimizeBtn.addEventListener('click', () => {
      window.ipc.send('window fn', 'browserWindow', 'minimize');
    });

    // const maximizeBtn = $('a.codicon.codicon-chrome-maximize');
    // const restoreBtn = $('a.codicon.codicon-chrome-restore');
    const maxResBtn = this.maxResBtn = $('a.codicon');
    maxResBtn.classList.add('codicon-chrome-' + (renderer.window.isMaximized ? 'restore' : 'maximize'));
    maxResBtn.addEventListener('click', handleMaxOrRes);

    const closeBtn = $('a.codicon.codicon-chrome-close.close');
    closeBtn.addEventListener('click', () => {
      window.ipc.send('window fn', 'browserWindow', 'close');
    });

    right.appendChild(minimizeBtn);
    right.appendChild(maxResBtn);
    right.appendChild(closeBtn);
    menubar.appendChild(right);

    ///*
    const iconbar = $('.iconbar');

    let group: HTMLElement, wrap: HTMLElement, btn: HTMLElement, label: HTMLElement;

    group = $('.group');
    wrap = $('.wrap');
    label = $('.label');
    label.innerHTML = 'New';

    // const fileCompareBtn = $('a.material-symbols-outlined', null, 'article');
    btn = $('a.codicon.codicon-file');
    btn.addEventListener('click', (e: MouseEvent) => {
      // console.log('fileCompareBtn is clicked ..');
      const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
      bodyLayoutService.addFileCompareView();
    });
    wrap.appendChild(btn);
    // const folderCompareBtn = $('a.material-symbols-outlined', null, 'folder');
    const folderCompareBtn = $('a.codicon.codicon-folder');
    folderCompareBtn.addEventListener('click', (e: MouseEvent) => {
      // console.log('folderCompareBtn is clicked ..');
      const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
      bodyLayoutService.addFolderCompareView();
    });
    wrap.appendChild(folderCompareBtn);
    group.appendChild(wrap);
    group.appendChild(label);
    iconbar.appendChild(group);

    group = $('.group');
    wrap = $('.wrap');
    btn = $('a.codicon.codicon-debug-restart');
    wrap.appendChild(btn);
    btn = $('a.codicon.codicon-stop-circle');
    // btn = $('a.codicon.codicon-close');
    wrap.appendChild(btn);
    label = $('.label');
    label.innerHTML = 'Start/Stop';

    group.appendChild(wrap);
    group.appendChild(label);
    iconbar.appendChild(group);

    group = $('.group');
    wrap = $('.wrap');
    btn = $('a.codicon.codicon-code');
    wrap.appendChild(btn);
    label = $('.label');
    label.innerHTML = 'Copy Selected';

    group.appendChild(wrap);
    group.appendChild(label);
    iconbar.appendChild(group);

    group = $('.group');
    wrap = $('.wrap');
    btn = $('a.codicon.codicon-list-selection');
    wrap.appendChild(btn);
    label = $('.label');
    label.innerHTML = 'Select Rows';

    group.appendChild(wrap);
    group.appendChild(label);
    iconbar.appendChild(group);

    container.appendChild(menubar);
    container.appendChild(iconbar);
    //*/

    /* const left = $('.left');
    const center = $('.center');

    // const fileCompareBtn = $('a.material-symbols-outlined', null, 'article');
    const fileCompareBtn = $('a.codicon.codicon-file');
    fileCompareBtn.addEventListener('click', (e: MouseEvent) => {
      // console.log('fileCompareBtn is clicked ..');
      const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
      bodyLayoutService.addFileCompareView();
    });
    center.appendChild(fileCompareBtn);
    // const folderCompareBtn = $('a.material-symbols-outlined', null, 'folder');
    const folderCompareBtn = $('a.codicon.codicon-folder');
    folderCompareBtn.addEventListener('click', (e: MouseEvent) => {
      // console.log('folderCompareBtn is clicked ..');
      const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
      bodyLayoutService.addFolderCompareView();
    });
    center.appendChild(folderCompareBtn);

    container.appendChild(left);
    container.appendChild(center); */
    return container;
  }

}