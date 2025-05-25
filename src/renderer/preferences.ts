console.log('👋 This message is being logged by "renderer", included via webpack');

import '@vscode/codicons/dist/codicon.css';
import './preferences.css';
import { $, domContentLoaded } from './util/dom';
import { mainWindow } from './Types';

interface Node {
  label: string;
  children?: Node[];
  render?: (container: HTMLElement, data: Node) => void;
}

export class Preferences {

  container: HTMLElement;
  element: HTMLElement;
  tree: HTMLElement;
  body: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async open() {
    await Promise.all([domContentLoaded(mainWindow)]);
    console.log('preferences.ts is called ..');
    this.container.appendChild(this.create());

    const tree: Node[] = [
      {
        label: 'Text comparisons',
        children: [
          { label: 'Encoding', render: function(container, data) {
            const tryChkbox = $('checkbox');
            const tryLabel = $('label');
            tryLabel.innerHTML = 'Try to auto-detect character encoding from file content';
            container.appendChild(tryChkbox);
            container.appendChild(tryLabel);

            const defaultLabel = $('label');
            defaultLabel.innerHTML = 'Default character encoding:';
            const defaultSelect = $('select');
            container.appendChild(defaultLabel);
            container.appendChild(defaultSelect);
          } },
          { label: 'Editing', render: null }
        ],
        render: null,
      },
      {
        label: 'Folder comparisons',
        children: [
          // { label: 'Method', render: null, },
          { label: 'Filters', render: function(container, data) {
            const activeLabel = $('label');
            activeLabel.innerHTML = 'Active filter:';
            const activeSelect = $('select');
            const activeNewBtn = $('button');
            const activeDelBtn = $('button');
            container.appendChild(activeLabel);
            container.appendChild(activeSelect);
            container.appendChild(activeNewBtn);
            container.appendChild(activeDelBtn);

            const patternsLabel = $('label');
            patternsLabel.innerHTML = 'Patterns for the active filter:';

            const patternsTable = $('table');

            const patternsNewBtn = $('button');
            const patternsEditBtn = $('button');
            const patternsDelBtn = $('button');
            const patternsUpBtn = $('button');
            const patternsDownBtn = $('button');
            // container.appendChild(patternsLabel);
          }, }
        ],
      }
    ];
    this.addNodes(this.tree, tree, 0);
    this.callRenders(tree, 0, '');
    // (this.body.firstChild as HTMLElement).getElementsByClassName('content')
  }

  callRender(data: Node, level: number, id: string): void {
    const container = $('.container');
    container.id = id;
    const title = $('.title');
    title.innerHTML = data.label;
    container.appendChild(title);
    if(data.render) data.render(container, data);
    container.style.display = 'none';
    this.body.appendChild(container);
  }

  callRenders(list: Node[], level: number, label: string): void {
    for(let i = 0; i < list.length; i++) {
      let id = label + '-' + list[i].label.replace(/ /g, '_');
      if(id.startsWith('-')) id = id.substring(1);
      this.callRender(list[i], level, id);
      if(list[i].children) {
        this.callRenders(list[i].children, level+1, id);
      }
    }
  }

  addNode(container: HTMLElement, data: Node, level: number): HTMLElement {
    const hasChildren = data.children && data.children.length > 0, isCollapsed = false;
    const node = $(".node");

    node.style.marginLeft = `${level*10}px`;
    const content = $(".content");
    const body = $(".ln-body");
    body.innerHTML = data.label;
    content.onclick = (e) => {
      // content.classList.contains('selected')
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

  addNodes(container: HTMLElement, list: Node[], level): void {
    for(let i = 0; i < list.length; i++) {
      const node = this.addNode(container, list[i], level);
      if(list[i].children) {
        this.addNodes(node, list[i].children, level+1);
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
    <div class="tree">
      nodes ..
    </div>
    <div class="body">
    </div>
    */

    const tree = this.tree = $('.tree');
    const body = this.body = $('.body');

    el.appendChild(tree);
    el.appendChild(body);
    return el;
  }

}

const preferences = new Preferences(mainWindow.document.body);
preferences.open();
