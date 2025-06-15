import { VerticalViewItem } from '../component/SplitView';
import { BodyLayoutService } from '../layout/BodyLayout';
import { TITLEBAR_HEIGHT } from '../layout/MainLayout';
import { Part } from '../Part';
import { bodyLayoutServiceId, getService } from '../Service';
import { $ } from '../util/dom';

export class TitlebarPart extends Part {
  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    this.size = TITLEBAR_HEIGHT;
    // this.border = true;
  }

  override createContentArea(): HTMLElement {
    const container: HTMLElement = super.createContentArea();

    const menubar = $('.menubar');
    menubar.addEventListener('dblclick', () => {
      console.log('dblclick is called ..');
      window.ipc.send('handle title dblclick', {});
    });

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