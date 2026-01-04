import { renderer } from "../..";
import { CompareItem, MenuItem } from "../../../common/Types";
import { StringUtil } from "../../../common/util/StringUtil";
import { BodyLayoutService } from "../../layout/BodyLayout";
import { getService, bodyLayoutServiceId } from "../../Service";
import { Group } from "../../Types";
import { popup } from "../../util/contextmenu";
import { $ } from "../../util/dom";

export interface TabOptions {}

export class Tab {

  parent: HTMLElement;
  element: HTMLElement;
  item: CompareItem;
  label: HTMLElement;
  changed_mark: HTMLElement;
  tabs: Tab[];

  constructor(parent: HTMLElement, item: CompareItem, tabs: Tab[]) {
    this.parent = parent;
    this.item = item;
    this.tabs = tabs;
  }

  create(): HTMLElement {
    const el = this.element = $('.tab');

    /* el.addEventListener('click', (e: MouseEvent) => {
      const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
      bodyLayoutService.active(this.item.uid);
    }); */
    this.registerTabListeners();

    el.addEventListener('contextmenu', (e: PointerEvent) => {
      const items: MenuItem[] = [];
      items.push({
        // accelerator: '',
        label: 'Close This Tab',
        click: () => {
          const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
          bodyLayoutService.remove(this.item.uid);
        }
      });
      items.push({
        // accelerator: '',
        label: 'Close All Other Tabs',
        click: () => {
          const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
          bodyLayoutService.removeOthers(this.item.uid);
        }
      });
      items.push({
        // accelerator: '',
        label: 'Close Tabs to The Right',
        click: () => {
          const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
          bodyLayoutService.removeOthers(this.item.uid, 'right');
        }
      });
      items.push({
        // accelerator: '',
        label: 'Close Tabs to The Left',
        click: () => {
          const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
          bodyLayoutService.removeOthers(this.item.uid, 'left');
        }
      });
      popup(items);
    });

    const typeIcon = $(`a.codicon.codicon-${this.item.type}`);
    typeIcon.addEventListener('click', (e: MouseEvent) => {
      const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
      bodyLayoutService.remove(this.item.uid);
      e.stopPropagation();
    });

    el.appendChild(typeIcon);

    const label = this.label = $('a.label');
    label.innerHTML = `No ${this.item.type} x 2`;
    el.appendChild(label);

    const changed_mark = this.changed_mark = $('.changed-mark');
    const span = $('span.codicon.codicon-circle-filled');
    changed_mark.appendChild(span);
    el.appendChild(changed_mark);
    return el;
  }

  onDragStart(e: DragEvent) {
    // console.log(e.dataTransfer);
    e.dataTransfer.setData('text/plain', this.item.uid);
    e.dataTransfer.effectAllowed = 'move'; // 'none' | 'copyMove'
    e.dataTransfer.setDragImage(this.element, 0, 0);
  }

  getTabDragOverLocation(e: DragEvent): 'left' | 'right' {
    const rect = this.element.getBoundingClientRect();
    const offsetXRelativeToParent = e.clientX - rect.left;
    return offsetXRelativeToParent <= rect.width / 2 ? 'left' : 'right';
  }

  computeDropTarget(e: DragEvent): { leftElement: HTMLElement | undefined; rightElement: HTMLElement | undefined } | undefined {
    const isLeftSideOfTab = this.getTabDragOverLocation(e) === 'left';
    const index = this.tabs.findIndex((v: Tab, i: number) => v.item.uid === this.item.uid);
    // const isLastTab = index === this.container.children.length - 1;
    const isLastTab = index === this.tabs.length - 1;
    const isFirstTab = index === 0;

    // Before first tab
    if(isLeftSideOfTab && isFirstTab) {
      return { leftElement: undefined, rightElement: this.element };
    }

    // After last tab
    if(!isLeftSideOfTab && isLastTab) {
      return { leftElement: this.element, rightElement: undefined };
    }

    // Between two tabs
    const tabBefore = isLeftSideOfTab ? this.element.previousElementSibling : this.element;
    const tabAfter = isLeftSideOfTab ? this.element : this.element.nextElementSibling;

    return { leftElement: tabBefore as HTMLElement, rightElement: tabAfter as HTMLElement };
  }

  dropTarget: { leftElement: HTMLElement | undefined; rightElement: HTMLElement | undefined } | undefined;
  updateDropTarget(newTarget: { leftElement: HTMLElement | undefined; rightElement: HTMLElement | undefined } | undefined): void {
    const oldTargets = this.dropTarget;
    if(oldTargets === newTarget || oldTargets && newTarget && oldTargets.leftElement === newTarget.leftElement && oldTargets.rightElement === newTarget.rightElement) {
      return;
    }

    const dropClassLeft = 'drop-target-left';
    const dropClassRight = 'drop-target-right';

    if(oldTargets) {
      oldTargets.leftElement?.classList.remove(dropClassLeft);
      oldTargets.rightElement?.classList.remove(dropClassRight);
    }

    if(newTarget) {
      newTarget.leftElement?.classList.add(dropClassLeft);
      newTarget.rightElement?.classList.add(dropClassRight);
    }

    this.dropTarget = newTarget;
  }

  updateDropFeedback(e: DragEvent, isDND: boolean): void {
    let dropTarget;
    if(isDND) {
      dropTarget = this.computeDropTarget(e);
    } else {
      dropTarget = undefined;
    }
    this.updateDropTarget(dropTarget);
  }

  onDragEnd(e: DragEvent) {
    // console.log('onDragEnd is called ..');
    this.updateDropFeedback(e, false);
  }

  onDragLeave(e: DragEvent) {
    // console.log('onDragLeave is called ..');
    this.updateDropFeedback(e, false);
  }

  onDragOver(e: DragEvent) {
    this.updateDropFeedback(e, true);
  }

  onDrop(e: DragEvent) {
    console.log('onDrop is called ..');

    const uid = e.dataTransfer.getData('text/plain');
    console.log('uid =', uid);

    // move tab
    this.updateDropFeedback(e, false);

    console.log('this.tabs.toString() =', this.tabs.toString());
    let from = this.tabs.findIndex((v: Tab, i: number) => v.item.uid === uid);
    let to = this.tabs.findIndex((v: Tab, i: number) => v.item.uid === this.item.uid);

    // console.log('from =', from, ', to =', to);
    console.log(`from = ${from}, to = ${to}`);

    if(to > -1) {
      const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
      // bodyLayoutService.moveTab(from, to);
    }
  }

  registerTabListeners() {
    this.element.addEventListener('mousedown', (e: MouseEvent) => {
      const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
      bodyLayoutService.active(this.item.uid);
    });

    this.element.draggable = true;

    this.element.addEventListener('dragstart', (e: DragEvent) => {
      // console.log('dragstart event is called...');
      this.onDragStart(e);
    });
    this.element.addEventListener('dragend', (e: DragEvent) => {
      // console.log('dragend event is called...');
      this.onDragEnd(e);
    });
    this.element.addEventListener('dragenter', (e: DragEvent) => {
      // console.log('dragenter event is called...');
    });
    this.element.addEventListener('dragleave', (e: DragEvent) => {
      // console.log('dragleave event is called...');
      this.onDragLeave(e);
    });
    this.element.addEventListener('dragover', (e: DragEvent) => {
      // console.log('dragover event is called...');
      e.preventDefault();
      this.onDragOver(e);
    });
    this.element.addEventListener('drop', (e: DragEvent) => {
      // console.log('drop event is called...');
      e.preventDefault();
      this.onDrop(e);
    });
  }

  setClass(style: { active?: boolean; }): void {
    const { active } = style;
    if(active != null) {
      if(active) this.element.classList.add('active');
      else this.element.classList.remove('active');
    }
  }

  getClass(): DOMTokenList {
    return this.element.classList;
  }

  updateLabel(lhs: string, rhs: string) {
    const sep = '/';
    lhs = lhs.replace(/\\/g, sep);
    rhs = rhs.replace(/\\/g, sep);
    const lhs_path = lhs.substring(0, lhs.lastIndexOf(sep));
    let lhs_name = lhs.substring(lhs.lastIndexOf(sep)+1, lhs.length);
    const rhs_path = rhs.substring(0, rhs.lastIndexOf(sep));
    let rhs_name = rhs.substring(rhs.lastIndexOf(sep)+1, rhs.length);
    if(StringUtil.isEmpty(lhs_name)) lhs_name = `No ${this.item.type}`;
    if(StringUtil.isEmpty(rhs_name)) rhs_name = `No ${this.item.type}`;
    if(lhs_name == rhs_name) {
      this.label.innerHTML = lhs_name + ' x 2';
    } else {
      this.label.innerHTML = lhs_name + ', ' + rhs_name;
    }
  }

  setChanged(): void {
    this.changed_mark.style.display = 'flex';
  }

  clearChanged(): void {
    this.changed_mark.style.display = 'none';
  }

  toString(): string {
    return `Tab[item={"uid":"${this.item.uid.substring(0,8)}"}]`;
  }
}