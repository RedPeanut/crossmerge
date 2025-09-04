import { CompareItem } from "../../../common/Types";
import { Group } from "../../Types";
import { $ } from "../../util/dom";
import { Tab } from "./Tab";

export interface TabsOptions {}

export class Tabs {

  parent: HTMLElement;
  element: HTMLElement;
  tabs: Tab[] = [];

  constructor(parent: HTMLElement) {
    this.parent = parent;
  }

  create(): HTMLElement {
    const el = this.element = $('.tabs');
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
  }

  layout(): void {}

  updateTabLabel(id: string, lhs: string, rhs: string): void {
    for(let i = 0; i < this.tabs.length; i++) {
      if(this.tabs[i].item.uid === id) {
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

  removeChild(idx: number) {
    this.element.removeChild(this.tabs[idx].element);
    this.tabs.splice(idx, 1);
    // delete this.tabs[idx];
  }
}