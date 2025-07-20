import { renderer } from '..';
import { SerializableMenuItem } from '../../common/Types';
import { VerticalViewItem } from '../component/SplitView';
import { BodyLayoutService } from '../layout/BodyLayout';
import { TITLEBAR_HEIGHT } from '../layout/MainLayout';
import { Part } from '../Part';
import { bodyLayoutServiceId, getService } from '../Service';
import { $ } from '../util/dom';

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

  createHamburgurMenu(container: HTMLElement) {
      const button = $('.button.hamburger');
      button.addEventListener('click', (e) => {
        // console.log('e.target =', e.target);
        (e.currentTarget as HTMLElement).classList.toggle('on');
      });

      const title = $('.title.codicon.codicon-menu');
      button.appendChild(title);
      // container.appendChild(button);

      const menubox_1st = $('ul.menubox');
      renderer.menu.forEach((menuItem: SerializableMenuItem, index: number) => {
        const li_1st = $('li.item');

        if(menuItem.type === 'separator')
          li_1st.classList.add('separator');
        else {
          const a_1st = $('a');
          li_1st.appendChild(a_1st);

          const label_1st = $('span.label');
          label_1st.innerHTML = menuItem.label.replace(/&/g, '');
          a_1st.appendChild(label_1st);

          const padding_1st = $('span.padding');
          a_1st.appendChild(padding_1st);

          if(menuItem.submenu && menuItem.submenu.length > 0) {
            const indicator = $('span.indicator.codicon.codicon-chevron-right');
            a_1st.appendChild(indicator);

            const menubox_2nd = $('ul.sub.menubox');
            for(let i = 0; i < menuItem.submenu.length; i++) {
              const menuItem_2nd = menuItem.submenu[i];

              const li_2nd = $('li.item');
              if(menuItem_2nd.type === 'separator')
                li_2nd.classList.add('separator');
              else {
                const a_2nd = $('a');
                li_2nd.appendChild(a_2nd);

                const label_2nd = $('span.label');
                label_2nd.innerHTML = menuItem_2nd.label.replace(/&/g, '');
                a_2nd.appendChild(label_2nd);

                const padding_2nd = $('span.padding');
                a_2nd.appendChild(padding_2nd);

                if(menuItem_2nd.accelerator) {
                  const keybiding_2nd = $('span.keybinding');
                  keybiding_2nd.innerHTML = menuItem_2nd.accelerator;
                  a_2nd.appendChild(keybiding_2nd);
                }

                const menubox_3rd = $('ul.sub.menubox');
                if(menuItem_2nd.submenu && menuItem_2nd.submenu.length > 0) {
                  const indicator_2nd = $('span.indicator.codicon.codicon-chevron-right');
                  a_2nd.appendChild(indicator_2nd);

                  for(let j = 0; j < menuItem_2nd.submenu.length; j++) {
                    const menuItem_3rd = menuItem_2nd.submenu[j];
                    const li_3rd = $('li.item');
                    if(menuItem_3rd.type === 'separator')
                      li_3rd.classList.add('separator');
                    else {
                      const a_3rd = $('a');
                      li_3rd.appendChild(a_3rd);

                      const label_3rd = $('span.label');
                      label_3rd.innerHTML = menuItem_3rd.label.replace(/&/g, '');
                      a_3rd.appendChild(label_3rd);

                      const padding_3rd = $('span.padding');
                      a_3rd.appendChild(padding_3rd);

                      if(menuItem_3rd.accelerator) {
                        const keybiding_3rd = $('span.keybinding');
                        keybiding_3rd.innerHTML = menuItem_3rd.accelerator;
                        a_3rd.appendChild(keybiding_3rd);
                      }
                    }
                    menubox_3rd.appendChild(li_3rd);
                  }
                }
                li_2nd.appendChild(menubox_3rd);
              }
              menubox_2nd.appendChild(li_2nd);
            }
            li_1st.appendChild(menubox_2nd);
          }
        }
        menubox_1st.appendChild(li_1st);
      });
      button.appendChild(menubox_1st);

      container.appendChild(button);
  }

  createMenu(container: HTMLElement) {
    renderer.menu.forEach((menuItem: SerializableMenuItem, index: number) => {
      // console.log('['+index+']', menuItem);
      const button = $('.button');
      // button.innerHTML = item.label.replace(/&/g, '');
      button.addEventListener('click', (e) => {
        // console.log('e.target =', e.target);
        (e.currentTarget as HTMLElement).classList.toggle('on');
      });

      const title = $('.title');
      title.innerHTML = menuItem.label.replace(/&/g, '');
      button.appendChild(title);

      const menubox_1st = $('ul.menubox');
      for(let i = 0; i < menuItem.submenu.length; i++) {
        const submenuItem_1st = menuItem.submenu[i];
        const li_1st = $('li.item');

        if(submenuItem_1st.type === 'separator')
          li_1st.classList.add('separator');
        else {
          const a_1st = $('a');
          li_1st.appendChild(a_1st);

          const label_1st = $('span.label');
          label_1st.innerHTML = submenuItem_1st.label.replace(/&/g, '');
          a_1st.appendChild(label_1st);

          const padding_1st = $('span.padding');
          a_1st.appendChild(padding_1st);

          if(submenuItem_1st.accelerator) {
            const keybiding_1st = $('span.keybinding');
            keybiding_1st.innerHTML = submenuItem_1st.accelerator;
            a_1st.appendChild(keybiding_1st);
          }

          if(submenuItem_1st.submenu && submenuItem_1st.submenu.length > 0) {
            const indicator = $('span.indicator.codicon.codicon-chevron-right');
            a_1st.appendChild(indicator);

            const menubox_2nd = $('ul.sub.menubox');
            for(let j = 0; j < submenuItem_1st.submenu.length; j++) {
              const submenuItem_2nd = submenuItem_1st.submenu[j];
              const li_2nd = $('li.item');
              if(submenuItem_2nd.type === 'separator')
                li_2nd.classList.add('separator');
              else {
                const a_2nd = $('a');
                li_2nd.appendChild(a_2nd);

                const label_2nd = $('span.label');
                label_2nd.innerHTML = submenuItem_2nd.label.replace(/&/g, '');
                a_2nd.appendChild(label_2nd);

                const padding_2nd = $('span.padding');
                a_2nd.appendChild(padding_2nd);

                if(submenuItem_2nd.accelerator) {
                  const keybiding_2nd = $('span.keybinding');
                  keybiding_2nd.innerHTML = submenuItem_2nd.accelerator;
                  a_2nd.appendChild(keybiding_2nd);
                }
              }
              menubox_2nd.appendChild(li_2nd);
            }
            li_1st.appendChild(menubox_2nd);
          }
        }
        menubox_1st.appendChild(li_1st);
      }
      button.appendChild(menubox_1st);

      container.appendChild(button);
    });
  }

  override createContentArea(): HTMLElement {
    const container: HTMLElement = super.createContentArea();

    const menubar = $('.menubar');
    const left: HTMLElement = $('.left');

    // this.createHamburgurMenu(left);
    this.createMenu(left);
    menubar.appendChild(left);

    const middle = $('.middle');
    const handleMaxOrRes = async (e) => {
      const isMaximized = await window.ipc.invoke('window get', 'function', 'isMaximized');
      if(isMaximized)
        window.ipc.send('window fn', 'unmaximize');
      else
        window.ipc.send('window fn', 'maximize');
    }
    middle.addEventListener('dblclick', handleMaxOrRes);
    menubar.appendChild(middle);

    // console.log('renderer =', renderer);
    // console.log('renderer.window =', renderer.window);
    // console.log('renderer.process =', renderer.process);

    const right: HTMLElement = $('.right');
    const minimizeBtn = $('a.codicon.codicon-chrome-minimize');
    minimizeBtn.addEventListener('click', async () => {
      window.ipc.send('window fn', 'minimize');
    });

    // const maximizeBtn = $('a.codicon.codicon-chrome-maximize');
    // const restoreBtn = $('a.codicon.codicon-chrome-restore');
    const maxResBtn = this.maxResBtn = $('a.codicon');
    maxResBtn.classList.add('codicon-chrome-' + (renderer.window.isMaximized ? 'restore' : 'maximize'));
    maxResBtn.addEventListener('click', handleMaxOrRes);

    const closeBtn = $('a.codicon.codicon-chrome-close.close');
    closeBtn.addEventListener('click', async () => {
      window.ipc.send('window fn', 'close');
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