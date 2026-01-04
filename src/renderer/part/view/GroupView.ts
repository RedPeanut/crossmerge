import { Tabs } from "../tab/Tabs";
import { $ } from "../../util/dom";
import { CompareOptions, Group } from "../../Types";
import { Compares } from "../compare/Compares";
import { CompareData, CompareFolderData, CompareItem, CompareItemOptions, CompareItemType,
  windowSelectPrevTab, windowSelectNextTab,
  MenubarEnableElem
} from "../../../common/Types";
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

    const enable: boolean = this.group.length > 1;
    const enables: MenubarEnableElem[] = [{ id: windowSelectPrevTab, enable }, { id: windowSelectNextTab, enable }];
    window.ipc.send('menu enable', enables);
    (getService(menubarServiceId) as MenubarService).enable(enables);

    // this.updateStatusbar(i);
    (getService(mainLayoutServiceId) as MainLayoutService).setCurrent(this.group[i]);
    if(i > -1) {
      if(this.group[i].status) {
        (getService(statusbarPartServiceId) as StatusbarPartService).update(this.group[i]);
      } else {
        (getService(statusbarPartServiceId) as StatusbarPartService).clear();
      }
    }
  }

  /**
   *
   *
   * @param id
   * @returns remains number of group for {@link GroupView} handling in {@link BodyLayout}
   */
  removeItem(id: string): number {

    const i = this.group.findIndex((v, i) => { return v.uid === id });
    if(i > -1) {
      this.tabs.removeChild(i);
      this.compares.removeChild(id);
      this.group.splice(i, 1);
      if(this.group.length > 0) {
        this.active(this.group[i-1 < 0 ? 0 : i-1].uid);
      } else {
        (getService(statusbarPartServiceId) as StatusbarPartService).clear();
      }
    }

    return this.group.length;
  }

  removeOthers(id: string, direction?: string): number {
    if(direction === 'right' || direction === 'left') {
      const i = this.group.findIndex((v, i) => { return v.uid === id });
      if(direction === 'right' ) {
        for(let _i = this.group.length-1; _i > i; _i--) {
          this.tabs.removeChild(_i);
          this.compares.removeChild(this.group[_i].uid);
          this.group.splice(_i, 1);
        }
      } else if(direction === 'left' ) {
        for(let _i = i-1; _i > -1; _i--) {
          this.tabs.removeChild(_i);
          this.compares.removeChild(this.group[_i].uid);
          this.group.splice(_i, 1);
        }
      }
      // this.active(this.group[i].uid);
    } else {
      for(let i = this.group.length-1; i > -1; i--) {
        if(this.group[i].uid !== id) {
          this.tabs.removeChild(i);
          this.compares.removeChild(this.group[i].uid);
          this.group.splice(i, 1);
        }
      }
      this.active(this.group[0].uid);
    }
    return this.group.length;
  }

  reCompare(id: string, options: CompareOptions): void {
    const i = this.group.findIndex((v, i) => { return v.uid === id });
    if(i > -1) {
      this.compares.reCompare(id, options);
    }
  }

  changeTab(id: string, direction: string) {
    if(this.group.length < 2) return;

    let i = this.group.findIndex((v, i) => { return v.uid === id });

    if(direction === 'prev') {
      i -= 1;
      if(i < 0) return;
    } else {
      i += 1;
      if(i > this.group.length-1) return;
    }
    this.active(this.group[i].uid);
  }

  moveTab(from: number, to: number) {
    this.tabs.moveTab(from, to);
  }
}