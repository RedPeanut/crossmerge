import { renderer } from "../..";
import { CompareItem } from "../../../common/Types";
import { StringUtil } from "../../../common/util/StringUtil";
import { BodyLayoutService } from "../../layout/BodyLayout";
import { getService, bodyLayoutServiceId } from "../../Service";
import { Group } from "../../Types";
import { $ } from "../../util/dom";

export interface TabOptions {}

export class Tab {

  parent: HTMLElement;
  element: HTMLElement;
  item: CompareItem;
  label: HTMLElement;
  mark: HTMLElement;

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

    const mark = this.mark = $('.mark');
    const span = $('span.codicon.codicon-circle-filled');
    mark.appendChild(span);
    el.appendChild(mark);
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
    this.mark.style.display = 'flex';
  }
  clearChanged(): void {
    this.mark.style.display = 'none';
  }
}