import { CompareData, CompareFolderData, CompareItem, CompareItemType } from "../../../common/Types";
import { Group } from "../../Types";
import { $ } from "../../util/dom";
import { listenerManager } from "../../util/ListenerManager";
import { FileView } from "../view/FileView";
import { FolderView } from "../view/FolderView";

export interface ComparesOptions {}

export class Compares {

  parent: HTMLElement;
  element: HTMLElement;
  map: Map<string, FileView|FolderView> = new Map<string, FileView|FolderView>();

  constructor(parent: HTMLElement) {
    this.parent = parent;
  }

  create(): HTMLElement {
    const el = this.element = $('.compares');
    return el;
  }

  addGroup(group: Group): void {

    this.map.forEach((item) => {
      item.setClass({ active: false });
    });

    const el = this.element;
    for(let i = 0; i < group.length; i++) {
      const item: CompareItem = group[i];
      let v: FileView|FolderView;
      if(item.type == 'folder') {
        v = new FolderView(el, item);
        el.appendChild(v.create());
      } else if(item.type == 'file') {
        v = new FileView(el, item);
        el.appendChild(v.create());
      } else throw new Error('do not enter here');
      this.map.set(item.uid, v);

      if(i == group.length-1)
        v.setClass({ active: true });

      if(item.type == 'file') {
        v.doCompare();
      } else if(item.type == 'folder') {
        v.layout();
      }
    }
  }

  layout(): void {
    // console.log('layout() is called ..');
    this.map.forEach((v) => {
      v.element.classList.contains('active') && v.layout();
    });
  }

  active(id: string): void {
    for(const [k,v] of this.map) {
      if(k === id) {
        v.setClass({ active: true });
      } else {
        v.setClass({ active: false });
      }
    }
  }

  removeChild(id: string): void {
    const v: FileView|FolderView = this.map.get(id);
    if(v instanceof FileView) {
      listenerManager.dispose(v);
    } else if(v instanceof FolderView) {
      listenerManager.dispose(v);
    }

    this.element.removeChild(this.map.get(id).element);

    // delete v; // The operand of a 'delete' operator must be a property reference.ts(2703)
    // delete this.map.get(id); // The operand of a 'delete' operator must be a property reference.ts(2703)
    this.map.delete(id);
  }
}