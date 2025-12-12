import { renderer } from "..";
import {
  pushToLeftMenuId, pushToRightMenuId, leftToRightFolderMenuId, rightToLeftFolderMenuId, leftToOtherFolderMenuId, rightToOtherFolderMenuId,
  selectChangedMenuId, selectByStateMenuId,
} from "../../common/Types";
import { keyBinding } from "../../common/globals";
import { broadcast } from "../Broadcast";
import { BodyLayoutService } from "../layout/BodyLayout";
import { MainLayoutService } from "../layout/MainLayout";
import { getService, bodyLayoutServiceId, mainLayoutServiceId, Service } from "../Service";
import { $ } from "../util/dom";

export interface IconbarService extends Service {}

export interface IconbarOptions {}

export class Iconbar implements IconbarService {

  container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  install(): void {
    let group: HTMLElement, centered: HTMLElement;
    let wrapBtn: HTMLElement, btnImg: HTMLElement, downBtnImg: HTMLElement;
    let label: HTMLElement, separator: HTMLElement;

    // Common
    group = $('.group');
    group.style.display = 'block';

    centered = $('.centered');

    wrapBtn = $('.wrap-btn');
    wrapBtn.addEventListener('click', (e: MouseEvent) => {
      // console.log('fileCompareBtn is clicked ..');
      const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
      bodyLayoutService.addFileCompareView();
    });
    // const fileCompareBtn = $('a.material-symbols-outlined', null, 'article');
    btnImg = $('a.codicon.codicon-file');
    wrapBtn.appendChild(btnImg);
    centered.appendChild(wrapBtn);

    wrapBtn = $('.wrap-btn');
    wrapBtn.addEventListener('click', (e: MouseEvent) => {
      // console.log('folderCompareBtn is clicked ..');
      const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
      bodyLayoutService.addFolderCompareView();
    });
    // const folderCompareBtn = $('a.material-symbols-outlined', null, 'folder');
    btnImg = $('a.codicon.codicon-folder');
    wrapBtn.appendChild(btnImg);
    centered.appendChild(wrapBtn);

    group.appendChild(centered);

    label = $('.label');
    label.innerHTML = 'New';
    group.appendChild(label);
    separator = $('.separator');
    group.appendChild(separator);
    this.container.appendChild(group);

    // FolderView & FileView
    group = $('.group');
    centered = $('.centered');
    btnImg = $('a.codicon.codicon-debug-restart');
    wrapBtn = $('.wrap-btn');
    wrapBtn.appendChild(btnImg);
    centered.appendChild(wrapBtn);

    btnImg = $('a.codicon.codicon-stop-circle');
    // btn = $('a.codicon.codicon-close');
    wrapBtn = $('.wrap-btn');
    wrapBtn.appendChild(btnImg);
    centered.appendChild(wrapBtn);

    label = $('.label');
    label.innerHTML = 'Start/Stop';

    group.appendChild(centered);
    group.appendChild(label);
    separator = $('.separator');
    group.appendChild(separator);
    this.container.appendChild(group);

    /*
    <div class="group">
      <div class="centered">
        <div class="wrap-btn">
          <a class="codicon-xxx"></a>
          <a class="codicon-chevron-down"></a>
        </div>
      </div class="label"></div>
    </div>
    */

    const keyBindingIdx = renderer.process.platform === 'win32' ? 0 : 1;

    // FolderView
    group = $('.group.dropdown');
    centered = $('.centered');
    btnImg = $('a.codicon.codicon-code');
    downBtnImg = $('a.codicon.codicon-chevron-down');

    wrapBtn = $('.wrap-btn');
    wrapBtn.addEventListener('click', (e: MouseEvent) => {
      const mainLayoutService = getService(mainLayoutServiceId) as MainLayoutService;
      mainLayoutService.showContextMenu(e.currentTarget as HTMLElement, [
        {
          id: leftToRightFolderMenuId,
          label: 'From Left to Right Folder...',
          accelerator: keyBinding[leftToRightFolderMenuId][keyBindingIdx],
          click() {
            // mainWindow.send('menu click', leftToRightFolderMenuId);
            broadcast.emit('menu click', null, leftToRightFolderMenuId);
          }
        },
        {
          id: rightToLeftFolderMenuId,
          label: 'From Right to Left Folder...',
          accelerator: keyBinding[rightToLeftFolderMenuId][keyBindingIdx],
          click() {
            // mainWindow.send('menu click', rightToLeftFolderMenuId);
            broadcast.emit('menu click', null, rightToLeftFolderMenuId);
          }
        },
        { type: 'separator' },
        {
          id: leftToOtherFolderMenuId,
          label: 'From Left to Other Folder...',
          click() {
            // mainWindow.send('menu click', leftToOtherFolderMenuId);
            broadcast.emit('menu click', null, leftToOtherFolderMenuId);
          }
        },
        {
          id: rightToOtherFolderMenuId,
          label: 'From Right to Other Folder...',
          click() {
            // mainWindow.send('menu click', rightToOtherFolderMenuId);
            broadcast.emit('menu click', null, rightToOtherFolderMenuId);
          }
        },
      ]);
    });
    wrapBtn.appendChild(btnImg);
    wrapBtn.appendChild(downBtnImg);
    centered.appendChild(wrapBtn);

    label = $('.label');
    label.innerHTML = 'Copy Selected';

    group.appendChild(centered);
    group.appendChild(label);
    separator = $('.separator');
    group.appendChild(separator);
    this.container.appendChild(group);

    group = $('.group.dropdown');
    centered = $('.centered');
    btnImg = $('a.codicon.codicon-list-selection');
    downBtnImg = $('a.codicon.codicon-chevron-down');

    wrapBtn = $('.wrap-btn');
    wrapBtn.addEventListener('click', (e: MouseEvent) => {
      const mainLayoutService = getService(mainLayoutServiceId) as MainLayoutService;
      mainLayoutService.showContextMenu(e.currentTarget as HTMLElement, [
        {
          id: selectChangedMenuId,
          label: 'Select Changed',
          accelerator: keyBinding[selectChangedMenuId][keyBindingIdx],
          // enabled: false,
          click() {
            broadcast.emit('menu click', null, selectChangedMenuId);
          }
        },
        {
          id: selectByStateMenuId,
          label: 'Select by State...',
          // accelerator: keyBinding[selectByStateMenuId][keyBindingIdx], // none
          // enabled: false,
          click() {
            broadcast.emit('menu click', null, selectByStateMenuId);
          }
        },
      ]);
    });
    wrapBtn.appendChild(btnImg);
    wrapBtn.appendChild(downBtnImg);
    centered.appendChild(wrapBtn);

    label = $('.label');
    label.innerHTML = 'Select Rows';

    group.appendChild(centered);
    group.appendChild(label);
    separator = $('.separator');
    group.appendChild(separator);
    this.container.appendChild(group);

    // FileView
    group = $('.group');
    centered = $('.centered');
    btnImg = $('a.codicon.codicon-download');
    wrapBtn = $('.wrap-btn');
    wrapBtn.addEventListener('click', (e: MouseEvent) => {});
    wrapBtn.appendChild(btnImg);
    centered.appendChild(wrapBtn);

    btnImg = $('a.codicon.codicon-download.fliped');
    // btn = $('a.codicon.codicon-close');
    wrapBtn = $('.wrap-btn');
    wrapBtn.addEventListener('click', (e: MouseEvent) => {});
    wrapBtn.appendChild(btnImg);
    centered.appendChild(wrapBtn);

    group.appendChild(centered);

    label = $('.label');
    label.innerHTML = 'Changes';
    group.appendChild(label);
    separator = $('.separator');
    group.appendChild(separator);

    this.container.appendChild(group);

    group = $('.group.dropdown');
    centered = $('.centered');
    btnImg = $('a.codicon.codicon-code');
    downBtnImg = $('a.codicon.codicon-chevron-down');

    wrapBtn = $('.wrap-btn');
    wrapBtn.addEventListener('click', (e: MouseEvent) => {
      // console.log('click is called ..');
      const mainLayoutService = getService(mainLayoutServiceId) as MainLayoutService;
      mainLayoutService.showContextMenu(e.currentTarget as HTMLElement, [
        {
          id: pushToLeftMenuId,
          label: 'Push to Left',
          accelerator: keyBinding[pushToLeftMenuId][keyBindingIdx],
          // enabled: false,
          click() {
            // mainWindow.send('menu click', pushToLeftMenuId);
            broadcast.emit('menu click', null, pushToLeftMenuId);
          }
        },
        {
          id: pushToRightMenuId,
          label: 'Push to Right',
          accelerator: keyBinding[pushToRightMenuId][keyBindingIdx],
          // enabled: false,
          click() {
            // mainWindow.send('menu click', pushToRightMenuId);
            broadcast.emit('menu click', null, pushToRightMenuId);
          }
        }
      ]);
    });
    wrapBtn.appendChild(btnImg);
    wrapBtn.appendChild(downBtnImg);
    centered.appendChild(wrapBtn);
    group.appendChild(centered);

    label = $('.label');
    label.innerHTML = 'Current Change';
    group.appendChild(label);
    separator = $('.separator');
    group.appendChild(separator);

    this.container.appendChild(group);
  }
}