import { Tabs } from "../tab/Tabs";
import { $ } from "../../util/dom";
import { CompareOptions, Group } from "../../Types";
import { Compares } from "../compare/Compares";
import { CompareData, CompareFolderData, CompareItem, CompareItemOptions, CompareItemType } from "../../../common/Types";
import { getService, iconbarServiceId, mainLayoutServiceId, menubarServiceId, statusbarPartServiceId } from "../../Service";
import { StatusbarPartService } from "../StatusbarPart";
import { MainLayoutService } from "../../layout/MainLayout";
import { defaultMenubarEnable } from "../../globals";
import { MenubarService } from "../Menubar";
import { IconbarService } from "../Iconbar";
import { FileView } from "./FileView";
import { FolderView } from "./FolderView";

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
    this.active(this.group[0].uid);
    // this.updateStatusbar(0);
  }

  addItem(item: CompareItem, options?: CompareItemOptions): FileView|FolderView {
    this.tabs.addItem(item);
    const v = this.compares.addItem(item, options);
    this.group.splice(0, 0, item);
    this.active(item.uid);
    // this.updateStatusbar(0);
    return v;
  }

  layout() {
    this.tabs.layout();
    this.compares.layout();
  }

  updateTabLabel(id: string, lhs: string, rhs: string): void {
    this.tabs.updateTabLabel(id, lhs, rhs);
  }

  callTabFn(id: string, fn: string): void {
    this.tabs.callTabFn(id, fn);
  }

  active(id: string): void {
    this.tabs.active(id);
    this.compares.active(id);

    const i = this.group.findIndex((v, i) => { return v.uid === id });

    window.ipc.send('menu enable', defaultMenubarEnable[this.group[i].type]);
    (getService(menubarServiceId) as MenubarService).enable(defaultMenubarEnable[this.group[i].type]);
    (getService(iconbarServiceId) as IconbarService).enable(this.group[i].type);

    this.updateStatusbar(i);
  }

  updateStatusbar(i: number): void {
    if(i > -1) {
      const mainLayoutService = getService(mainLayoutServiceId) as MainLayoutService;
      if(this.group[i].status) {
        mainLayoutService.updateStatusbar(this.group[i]);
      } else {
        mainLayoutService.clearStatusbar();
      }
    }
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
      } else {
        (getService(mainLayoutServiceId) as MainLayoutService).clearStatusbar();
      }
    }

    return this.group.length;
  }

  reCompare(id: string, options: CompareOptions): void {
    const i = this.group.findIndex((v, i) => { return v.uid === id });
    if(i > -1) {
      this.compares.reCompare(id, options);
    }
  }
}