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

  constructor(parent: HTMLElement, item: CompareItem) {
    this.parent = parent;
    this.item = item;
  }

  create(): HTMLElement {
    const el = this.element = $('.tab');
    el.addEventListener('click', (e: MouseEvent) => {
      const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
      bodyLayoutService.active(this.item.uid);
    });
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
}