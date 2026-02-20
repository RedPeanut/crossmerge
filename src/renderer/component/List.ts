import { $, append } from "../util/dom";

export type ListItemType = 'local' | 'remote' | 'group' | 'folder';
export interface ListItemElem {
  type?: ListItemType;
  title?: string;
  id: string;
  children?: ListItemElem[];

  // remote
  url?: { host: string, port: number, username: string, password: string };
  size?: { row: number, col: number }

  // control
  canSelect?: boolean; // 선택 가능 여부, 기본값은 true
  canDrag?: boolean; // 드래그 가능 여부, 기본값은 true
  canDropBefore?: boolean; // 이전 드롭이 허용되는지 여부, 기본값은 true
  canDropIn?: boolean; // 드롭인 허용 여부, 기본값은 true
  canDropAfter?: boolean; // 이후 드롭을 허용할지 여부, 기본값은 true
  isCollapsed?: boolean;
}

export class List {
  container: HTMLElement;
  element: HTMLElement;
  // showList: ListItem[];
  state: any;

  constructor(container: HTMLElement) {
    this.container = container;
    this.state = {
      showList: [
        {
          type: 'folder',
          title: 'folder',
          id: '52528ee3-aa4f-44a5-b763-5cf69acacf51',
          children: [
            {
              id: 'e54af9c1-f003-4b1b-8db4-e796f69a9a4d',
              title: 'xyz',
              type: 'remote',
              url: {
                host: '192.168.0.25',
                port: 22,
                username: 'kimjk',
                password: '1234',
              },
              size: { row: 24, col: 80 }
            },
            {
              type: 'local',
              title: 'local',
              id: '96367ed9-6fb1-434b-b45d-de9d2d21898a',
            }
          ],
          isCollapsed: false
        },
        {
          type: 'remote',
          title: 'remote',
          // url: 'www.remote.com',
          id: '8d65f5a3-306d-44c7-a43f-b5abc17b6a2b',
        },
        /* {
          type: 'group',
          title: 'group',
          id: 'cbf8ea19-4474-4c15-8af0-3a4bdcdff717'
        }, */
        {
          type: 'local',
          title: 'local',
          id: '751b26d0-5c94-4328-a0e8-23fdd85d160f'
        }
      ]
    };
  }

  render(): void {
    this.element = $('.list');
    const tree = new Tree(this.element);
    tree.render(
      this.state.showList, // tree: ListItemElem[]
      this.state.selectedIds, // selectedIds: string[]
      (list: any) => {
        this.state = {
          ...this.state,
          showList: list
        };
      }, // onChange: (list: ListItemElem[]) => void
      (ids: string[]) => {
        this.state = {
          ...this.state,
          selectedIds: ids || ['0']
        };
      }, // onSelect: (ids: string[]) => void
      (data: ListItemElem) => {
        const listItem = new ListItem(null);
        return listItem.render(data);
      }, // nodeRender: (data: ListItemElem) => HTMLElement | null
    );
    append(this.container, this.element);
  }
}

export class ListItem {
  container: HTMLElement;
  element: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(data: ListItemElem): HTMLElement {
    this.element = $('.list-item');

    const title = $('.title');
    const span = $('span.icon');
    const itemIcon = $(`a.codicon codicon-${data.type}`);
    append(span, itemIcon);
    // console.log(span.outerHTML);
    // append(title, span);
    title.innerHTML = span.outerHTML + data.title;
    append(this.element, title);

    // append(this.container, this.element);
    return this.element;
  }
}

export class Tree {
  container: HTMLElement;

  element: HTMLElement;
  tree: ListItemElem[];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(tree: ListItemElem[],
    selectedIds: string,
    onChange: Function,
    onSelect: Function,
    nodeRender: (data: ListItemElem) => HTMLElement | null,
  ): void {
    this.tree = tree;

    this.element = $('.tree');
    this.tree.map((e) => {
      const node = new Node(this.element);
      node.render(e, 0, nodeRender);
    });
    append(this.container, this.element);
  }
}

export class Node {
  container: HTMLElement;

  element: HTMLElement;
  node: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  render(
    data: ListItemElem,
    level: number = 0,
    nodeRender: (data: ListItemElem) => HTMLElement | null,
  ): void {
    const hasChildren = Array.isArray(data.children) && data.children.length > 0;

    const element = this.element = $('.wrapper');
    const node = this.node = $('.node');

    const content = $('.content');
    const header = $('.ln-header');
    if(hasChildren) {
      const arrow = $('.arrow' + data.isCollapsed ? '.collapsed' : '');
      arrow.innerHTML = '>';
      header.append(arrow);
    }
    content.append(header);

    const body = $('.ln-body');
    const listItem = nodeRender ? nodeRender(data) : data.title || `node#${data.id}`;
    body.append(listItem);
    content.append(body);

    if(hasChildren) {
      data.children.map((e) => {
        const _node = new Node(body);
        _node.render(e, level+1, nodeRender);
      });
    }
    append(node, content);
    append(element, node);
    append(this.container, element);
  }
}