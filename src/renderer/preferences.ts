console.log('👋 This message is being logged by "renderer", included via webpack');

import '@vscode/codicons/dist/codicon.css';
import './preferences.css';
import { $, domContentLoaded } from './util/dom';
import { mainWindow } from './Types';
import { app } from 'electron';
import path from 'path';
import PotDb from 'potdb';
import { ConfigsType } from '../main/configs';

interface Node {
  label: string;
  children?: Node[];
  render?: (container: HTMLElement, data: Node) => void;
}

export class Preferences {

  container: HTMLElement;
  element: HTMLElement;
  tree: HTMLElement;
  contents: HTMLElement;
  configs: ConfigsType;
  changed: boolean = false;

  okBtn: HTMLButtonElement;
  cancelBtn: HTMLButtonElement;
  applyBtn: HTMLButtonElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async open() {
    const self = this;
    await Promise.all([domContentLoaded(mainWindow)]);
    this.configs = await window.ipc.invoke('config all');
    console.log('this.configs =', this.configs);

    console.log('preferences.ts is called ..');
    this.container.appendChild(this.create());

    const tree: Node[] = [
      {
        label: 'Text comparisons',
        children: [
          {
            label: 'Display',
            render: function(container, data) {
              let p = $('p');
              const wrapChkbox = $('input') as HTMLInputElement;
              wrapChkbox.setAttribute('type', 'checkbox');
              wrapChkbox.checked = this.wrap_lines ? true : false;
              // wrapChkbox.setAttribute('checked', this.wrap_lines);
              // wrapChkbox.onchange((e) => { console.log(e); });
              wrapChkbox.addEventListener('change', ((e: Event) => {
                self.configs.wrap_lines = (e.target as HTMLInputElement).checked;
                self.changed = true;
                self.applyBtn.disabled = false;
              }));
              const wrapLabel = $('label') as HTMLLabelElement;
              wrapLabel.innerHTML = 'Wrap long lines';
              // wrapLabel.htmlFor = ''; //wrapChkbox;

              p.appendChild(wrapChkbox);
              p.appendChild(wrapLabel);
              container.appendChild(p);
            }
          },
          {
            label: 'Encoding',
            render: function(container, data) {
              let p = $('p');
              // const tryChkbox = $('checkbox');
              const tryChkbox = $('input') as HTMLInputElement;
              tryChkbox.setAttribute('type', 'checkbox');
              tryChkbox.checked = true;
              tryChkbox.disabled = true;
              const tryLabel = $('label') as HTMLLabelElement;
              tryLabel.innerHTML = 'Try to auto-detect character encoding from file content';
              // tryLabel.htmlFor = ''; //tryChkbox;

              p.appendChild(tryChkbox);
              p.appendChild(tryLabel);
              container.appendChild(p);

              p = $('p');
              const defaultLabel = $('label');
              defaultLabel.innerHTML = 'Default character encoding:';
              const defaultSelect = $('select');
              let option;
              option = $('option') as HTMLOptionElement;
              option.value = 'utf8_w/o_bom';
              option.innerText = 'Unicode (UTF-8 without BOM)';
              defaultSelect.appendChild(option);

              option = $('option') as HTMLOptionElement;
              option.value = 'korean_euc';
              option.innerText = 'Korean (EUC)';
              defaultSelect.appendChild(option);

              defaultSelect.addEventListener('change', ((e: Event) => {
                const target = e.target as HTMLSelectElement;
                if(target.value != self.configs.charset) {
                  self.configs.charset = target.value;
                  self.changed = true;
                  self.applyBtn.disabled = false;
                }
              }));

              p.appendChild(defaultLabel);
              p.appendChild(defaultSelect);
              container.appendChild(p);
            }
          },
          { label: 'Editing', render: null }
        ],
        render: null,
      },
      {
        label: 'Folder comparisons',
        children: [
          // { label: 'Method', render: null, },
          {
            label: 'Filters',
            render: function(container, data) {

              return;

              let p = $('p'); //, group;

              const activeLabel = $('label');
              activeLabel.innerHTML = 'Active filter:';
              const activeSelect = $('select');
              let option = $('option') as HTMLOptionElement;
              option.value = 'default';
              option.innerText = 'Default';
              activeSelect.appendChild(option);

              const btnGroup = $('.btn-group');
              const activeNewBtn = $('button');
              activeNewBtn.innerHTML = 'New...';
              const activeDelBtn = $('button');
              activeDelBtn.innerHTML = 'Delete';
              btnGroup.appendChild(activeNewBtn);
              btnGroup.appendChild(activeDelBtn);

              p.appendChild(activeLabel);
              p.appendChild(activeSelect);
              p.appendChild(btnGroup);
              container.appendChild(p);

              p = $('p');
              const patternsLabel = $('label');
              patternsLabel.innerHTML = 'Patterns for the active filter:';
              const patternsTable = $('table');

              const group = $('.group');
              const left = $('.left');
              const patternsNewBtn = $('button');
              patternsNewBtn.innerHTML = 'New...';
              const patternsEditBtn = $('button');
              patternsEditBtn.innerHTML = 'Edit...';
              const patternsDelBtn = $('button');
              patternsDelBtn.innerHTML = 'Delete';

              left.appendChild(patternsNewBtn);
              left.appendChild(patternsEditBtn);
              left.appendChild(patternsDelBtn);

              const right = $('.right');
              const patternsUpBtn = $('button');
              patternsUpBtn.innerHTML = '↑ Up';
              const patternsDownBtn = $('button');
              patternsDownBtn.innerHTML = '↓ Down';

              right.appendChild(patternsUpBtn);
              right.appendChild(patternsDownBtn);

              group.appendChild(left);
              group.appendChild(right);

              p.appendChild(patternsLabel);
              p.appendChild(patternsTable);
              p.appendChild(group);

              container.appendChild(p);
            },
          }
        ],
      }
    ];
    this.addNodes(this.tree, tree, 0, '');
    this.callRenders(tree, 0, '');
    (this.tree.getElementsByClassName('content')[0] as HTMLElement).click();
  }

  callRender(data: Node, level: number, id: string): void {
    const container = $('.container');
    container.id = id;
    const title = $('h2.title');
    title.innerHTML = data.label;
    container.appendChild(title);
    if(data.render) data.render(container, data);
    container.style.display = 'none';
    this.contents.appendChild(container);
  }

  callRenders(list: Node[], level: number, id: string): void {
    for(let i = 0; i < list.length; i++) {
      let _id = id + '-' + list[i].label.replace(/ /g, '_');
      if(_id.startsWith('-')) _id = _id.substring(1);

      this.callRender(list[i], level, _id);
      if(list[i].children) {
        this.callRenders(list[i].children, level+1, _id);
      }
    }
  }

  addNode(container: HTMLElement, data: Node, level: number, id: string): HTMLElement {
    const hasChildren = data.children && data.children.length > 0, isCollapsed = false;
    const node = $(".node");

    node.style.marginLeft = `${level*10}px`;
    const content = $(".content");
    const body = $(".ln-body");
    body.innerHTML = data.label;
    content.onclick = (e) => {
      const contents = this.tree.getElementsByClassName('content');
      for(let i = 0; i < contents.length; i++) {
        if(contents[i].classList.contains('selected'))
          contents[i].classList.remove('selected');
      }
      content.classList.add('selected');

      const containers = this.contents.getElementsByClassName('container');
      for(let i = 0; i < containers.length; i++) {
        const container = containers[i] as HTMLElement;
        if(container.id == id)
          container.style.display = 'block';
        else
          container.style.display = 'none';
      }
    }

    if(level != 0) {
      const up = $(".up");
      const down = $(".down");
      const header = $(".ln-header");
      header.appendChild(up);
      header.appendChild(down);
      content.appendChild(header);
    }
    content.appendChild(body);
    node.appendChild(content);
    container.appendChild(node);
    return node;
  }

  addNodes(container: HTMLElement, list: Node[], level: number, id: string): void {
    for(let i = 0; i < list.length; i++) {
      let _id = id + '-' + list[i].label.replace(/ /g, '_');
      if(_id.startsWith('-')) _id = _id.substring(1);

      const node = this.addNode(container, list[i], level, _id);
      if(list[i].children) {
        this.addNodes(node, list[i].children, level+1, _id);
      }

      if(i == list.length-1 && level != 0) {
        const header_down = node.getElementsByClassName('down')[0] as HTMLElement;
        if(header_down) {
          // console.log('header_down =', header_down);
          header_down.style.display = 'none';
        }
      }
    }
  }

  create(): HTMLElement {
    const el = this.element = $('.preferences');

    /*
    <div class="content_area">
      <div class="tree">
        nodes ..
      </div>
      <div class="body">
      </div>
    </div>
    <div class="btn_area">
    </div>
    */

    const body = $('.body');
    const tree = this.tree = $('.tree');
    const contents = this.contents = $('.contents');

    body.appendChild(tree);
    body.appendChild(contents);
    el.appendChild(body);

    const bottom = $('.bottom');

    const left = $('.left');
    const loadBtn: HTMLButtonElement = $('button'); loadBtn.innerHTML = 'Load...';
    const saveBtn: HTMLButtonElement = $('button'); saveBtn.innerHTML = 'Save...';
    left.appendChild(loadBtn);
    left.appendChild(saveBtn);

    const right = $('.right');
    const okBtn: HTMLButtonElement = this.okBtn = $('button'); okBtn.innerHTML = 'Ok';
    const cancelBtn: HTMLButtonElement = this.cancelBtn = $('button'); cancelBtn.innerHTML = 'Cancel';
    cancelBtn.addEventListener('click',
      (e: Event) => {
        // const target = e.target as HTMLButtonElement;
        window.ipc.send('window fn', 'preferences', 'close');
      }
    );

    const applyBtn: HTMLButtonElement = this.applyBtn = $('button'); applyBtn.innerHTML = 'Apply'; applyBtn.disabled = true;
    applyBtn.addEventListener('click',
      (e: Event) => {
        // const target = e.target as HTMLButtonElement;
      }
    );

    right.appendChild(okBtn);
    right.appendChild(cancelBtn);
    right.appendChild(applyBtn);

    bottom.appendChild(left);
    bottom.appendChild(right);
    el.appendChild(bottom);
    return el;
  }

}

const preferences = new Preferences(mainWindow.document.body);
preferences.open();
