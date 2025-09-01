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

      tab.setClass({ active: true });
    }
    return el;
  }

  addGroup(group: Group) {

    this.tabs.map((tab) => { tab.setClass({ active: false }); });

    const el = this.element;
    for(let i = 0; i < group.length; i++) {
      const item: CompareItem = group[i];
      const tab: Tab = new Tab(el, item);
      el.insertBefore(tab.create(), el.firstChild);
      this.tabs.splice(0, 0, tab);

      if(i == group.length-1)
        tab.setClass({ active: true });
    }

    this.group.splice(0, 0, ...group);
  }

  layout(): void {}

  updateTabLabel(id: string, lhs: string, rhs: string): void {
    for(let i = 0; i < this.group.length; i++) {
      if(this.group[i].uid === id) {
        this.tabs[i].updateLabel(lhs, rhs);
        break;
      }
    }
  }

  active(id: string) {
    for(let i = 0; i < this.tabs.length; i++) {
      if(this.tabs[i].item.uid === id) this.tabs[i].setClass({ active: true });
      else this.tabs[i].setClass({ active: false });
    }
  }
}