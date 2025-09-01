import { CompareData, CompareFolderData, CompareItem, CompareItemType } from "../../../common/Types";
import { Group } from "../../Types";
import { $ } from "../../util/dom";
import { FileView } from "../view/FileView";
import { FolderView } from "../view/FolderView";

export interface ComparesOptions {}

export class Compares {

  parent: HTMLElement;
  element: HTMLElement;
  group: Group;
  map: Map<string, FileView|FolderView> = new Map<string, FileView|FolderView>();

  constructor(parent: HTMLElement, group: Group) {
    this.parent = parent;
    this.group = group;
  }

  create(): HTMLElement {
    const el = this.element = $('.compares');

    for(let i = 0; i < this.group.length; i++) {
      const item: CompareItem = this.group[i];
      let v: FileView|FolderView;
      if(item.type == 'folder') v = new FolderView(el, item);
      else if(item.type == 'file') v = new FileView(el, item);
      else throw new Error('do not enter here');
      this.map.set(item.uid, v);
      el.appendChild(v.create());

      if(item.type == 'file') v.doCompare();

      v.setClass({ active: true });
    }

    return el;
  }

  addGroup(group: Group) {

    this.map.forEach((item) => {
      item.setClass({ active: false });
    });

    const el = this.element;
    for(let i = 0; i < group.length; i++) {
      const item: CompareItem = group[i];
      let v: FileView|FolderView;
      if(item.type == 'folder') v = new FolderView(el, item);
      else if(item.type == 'file') v = new FileView(el, item);
      else throw new Error('do not enter here');
      this.map.set(item.uid, v);
      el.appendChild(v.create());

      if(item.type == 'file') v.doCompare();

      if(i == group.length-1)
        v.setClass({ active: true });
    }

    this.group.splice(0, 0, ...group);
  }

  layout(): void {
    // console.log('layout() is called ..');
    this.map.forEach((item) => {
      item.layout();
    });
  }
}