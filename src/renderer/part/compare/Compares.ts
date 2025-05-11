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
      let v;
      if(item.type == 'folder') v = new FolderView(el, item);
      else v = new FileView(el, item);
      this.map.set(item.uid, v);
      el.appendChild(v.create());
    }

    return el;
  }

  sendRowData(type: CompareItemType, arg: CompareData) {
    if(type == 'file') {

    } else if(type == 'folder') {
      const data = arg as CompareFolderData;
      // const findIndex = this.group.findIndex((e) => e.uid === data.uid);
      // console.log('findIndex =', findIndex);
      // console.log('_arg =', _arg);

      const v = this.map.get(data.uid);
      v.sendRowData(data);
    }
  }
}