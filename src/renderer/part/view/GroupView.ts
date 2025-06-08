import { Tabs } from "../tab/Tabs";
import { $ } from "../../util/dom";
import { Group } from "../../Types";
import { Compares } from "../compare/Compares";
import { CompareData, CompareFolderData, CompareItem, CompareItemType } from "../../../common/Types";

export interface GroupViewOptions {}

export class GroupView {

  parent: HTMLElement;
  element: HTMLElement;
  group: Group;

  tabs: Tabs;
  compares: Compares;

  constructor(parent: HTMLElement, group: Group, options: GroupViewOptions) {
    this.parent = parent;
    this.group = group;
  }

  create(): HTMLElement {
    const el = this.element = $('.group-view');
    const tabs = this.tabs = new Tabs(el, this.group);
    el.appendChild(tabs.create());
    const compares = this.compares = new Compares(el, this.group);
    el.appendChild(compares.create());
    return el;
  }

  addGroup(group: Group) {
    this.group.push(...group);
  }

  sendRowData(type: CompareItemType, arg: CompareData) {
    if(type == 'file') {

    } else if(type == 'folder') {
      const _arg = arg as CompareFolderData;
      const findIndex = this.group.findIndex((e) => e.uid === _arg.uid);
      // console.log('findIndex =', findIndex);
      this.compares.sendRowData(type, arg);
    }
  }

  sendReadData(type: CompareItemType, arg: any) {
    if(type == 'file') {
      const findIndex = this.group.findIndex((e) => e.uid === arg.uid);
      this.compares.sendReadData(type, arg);
    } else if(type == 'folder') {
    }
  }

  layout() {
    this.tabs.layout();
    this.compares.layout();
  }

}