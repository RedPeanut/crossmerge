import { BodyLayoutService } from "../layout/BodyLayout";
import { getService, bodyLayoutServiceId, Service } from "../Service";
import { $ } from "../util/dom";

export interface IconbarService extends Service {}

export interface IconbarOptions {}

export class Iconbar implements IconbarService {

  container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  install(): void {

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
    this.container.appendChild(group);

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
    this.container.appendChild(group);

    group = $('.group');
    wrap = $('.wrap');
    btn = $('a.codicon.codicon-code');
    wrap.appendChild(btn);
    label = $('.label');
    label.innerHTML = 'Copy Selected';

    group.appendChild(wrap);
    group.appendChild(label);
    this.container.appendChild(group);

    group = $('.group');
    wrap = $('.wrap');
    btn = $('a.codicon.codicon-list-selection');
    wrap.appendChild(btn);
    label = $('.label');
    label.innerHTML = 'Select Rows';

    group.appendChild(wrap);
    group.appendChild(label);
    this.container.appendChild(group);
  }
}