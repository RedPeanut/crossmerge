import { Tabs } from "../tab/Tabs";
import { $ } from "../../util/dom";
import { Group } from "../../Types";
import { Compares } from "../compare/Compares";

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

}