import { Tabs } from "../tab/Tabs";
import { $ } from "../../util/dom";
import { Group } from "../../Types";
import { Compares } from "../compare/Compares";
import { CompareData, CompareFolderData, CompareItem, CompareItemType } from "../../../common/Types";

export interface GroupViewOptions {}

export class GroupView {

  parent: HTMLElement;
  element: HTMLElement;
  group: Group = [];

  tabs: Tabs;
  compares: Compares;

  constructor(parent: HTMLElement, options: GroupViewOptions) {
    this.parent = parent;
  }

  create(): HTMLElement {
    const el = this.element = $('.group-view');
    const tabs = this.tabs = new Tabs(el);
    el.appendChild(tabs.create());
    const compares = this.compares = new Compares(el);
    el.appendChild(compares.create());
    return el;
  }

  addGroup(group: Group) {
    this.tabs.addGroup(group);
    this.compares.addGroup(group);
    this.group.splice(0, 0, ...group);
  }

  layout() {
    this.tabs.layout();
    this.compares.layout();
  }

  updateTabLabel(id: string, lhs: string, rhs: string): void {
    this.tabs.updateTabLabel(id, lhs, rhs);
  }

  active(id: string): void {
    this.tabs.active(id);
    this.compares.active(id);
  }

  /**
   *
   *
   * @param id
   * @returns remains number of group for {@link GroupView} handling in {@link BodyLayout}
   */
  removeGroup(id: string): number {

    const i = this.group.findIndex((v, i) => { return v.uid === id });
    if(i > -1) {
      this.tabs.removeChild(i);
      this.compares.removeChild(id);
      this.group.splice(i, 1);
      if(this.group.length > 0) {
        this.active(this.group[i-1 < 0 ? 0 : i-1].uid);
      }
    }

    /* let group, find = false, i = 0;
    for(; i < this.group.length; i++) {
      if(this.group[i].uid == id) {
        find = true;
        group = this.group[i];
        break;
      }
    }

    if(find) {
      this.tabs.removeChild(i);
      this.compares.removeChild(id);
      this.group.splice(i, 1);
    } */

    return this.group.length;
  }
}