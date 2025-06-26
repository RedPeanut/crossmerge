import { CompareItem } from "../../../common/Types";
import { Group } from "../../Types";
import { $ } from "../../util/dom";
import { Tab } from "./Tab";

export interface TabsOptions {}

export class Tabs {

  parent: HTMLElement;
  element: HTMLElement;
  group: Group;
  tabs: Tab[] = [];

  constructor(parent: HTMLElement, group: Group) {
    this.parent = parent;
    this.group = group;
  }

  create(): HTMLElement {
    const el = this.element = $('.tabs');
    for(let i = 0; i < this.group.length; i++) {
      const item: CompareItem = this.group[i];
      const tab: Tab = new Tab(el, item);
      el.appendChild(tab.create());
      this.tabs.push(tab);

      tab.css({ active: true });
    }
    return el;
  }

  addGroup(group: Group) {

    this.tabs.map((tab) => { tab.css({ active: false }); });

    const el = this.element;
    for(let i = 0; i < group.length; i++) {
      const item: CompareItem = group[i];
      const tab: Tab = new Tab(el, item);
      el.appendChild(tab.create());
      this.tabs.push(tab);

      if(i == group.length-1)
        tab.css({ active: true });
    }

    // this.group.splice(0, 0, ...group);
    this.group.push(...group);
  }

  layout(): void {}
}