import { renderer } from "../..";
import { CompareItem } from "../../../common/Types";
import { Group } from "../../Types";
import { $ } from "../../util/dom";

export interface TabOptions {}

export class Tab {

  parent: HTMLElement;
  element: HTMLElement;
  item: CompareItem;
  label: HTMLElement;

  constructor(parent: HTMLElement, item: CompareItem) {
    this.parent = parent;
    this.item = item;
  }

  create(): HTMLElement {
    const el = this.element = $('.tab');

    const typeIcon = $(`a.codicon.codicon-${this.item.type}`);
    typeIcon.addEventListener('click', (e: MouseEvent) => {
    });

    el.appendChild(typeIcon);

    const label = this.label = $('a.label');
    label.innerHTML = `No ${this.item.type} x 2`;
    el.appendChild(label);
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
    const lhs_path = lhs.substring(0, lhs.lastIndexOf(renderer.path.sep));
    const lhs_name = lhs.substring(lhs.lastIndexOf(renderer.path.sep)+1, lhs.length);
    const rhs_path = rhs.substring(0, rhs.lastIndexOf(renderer.path.sep));
    const rhs_name = rhs.substring(rhs.lastIndexOf(renderer.path.sep)+1, rhs.length);
    if(lhs_name == rhs_name) {
      this.label.innerHTML = lhs_name + ' x 2';
    } else {
      this.label.innerHTML = lhs_name + ', ' + rhs_name;
    }
  }
}