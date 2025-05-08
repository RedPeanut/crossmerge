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

  constructor(parent: HTMLElement, group: Group) {
    this.parent = parent;
    this.group = group;
  }

  create(): HTMLElement {
    const el = this.element = $('.compares');

    for(let i = 0; i < this.group.length; i++) {
      const item: CompareItem = this.group[i];
      if(item.type == 'folder') {
        el.appendChild(new FolderView(el, item).create());
      } else {
        el.appendChild(new FileView(el, item).create());
      }
    }

    return el;
  }

  sendRowData(type: CompareItemType, arg: CompareData) {
    if(type == 'file') {

    } else if(type == 'folder') {
      const data = arg as CompareFolderData;
      const findIndex = this.group.findIndex((e) => e.uid === data.uid);
      // console.log('findIndex =', findIndex);
      // console.log('_arg =', _arg);

      let indent = '';
      for(let i = 0; i < data.depth; i++) indent += '  ';
      let icon;
      if(data.data.isDirectory) icon = '■'
      else {
        if(data.state == 'unchanged') icon = '-';
        else if(data.state == 'changed') icon = 'c';
        else if(data.state == 'removed') icon = 'r';
        else if(data.state == 'inserted') icon = 'i';
      }
      console.log(icon + ' ' + indent + data.data.name);
    }
  }
}