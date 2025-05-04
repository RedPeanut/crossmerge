import { CompareItem, CompareType } from "../../../common/Types";
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



}