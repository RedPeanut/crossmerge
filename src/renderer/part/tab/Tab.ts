import { CompareItem } from "../../../common/Types";
import { Group } from "../../Types";
import { $ } from "../../util/dom";

export interface TabOptions {}

export class Tab {

  parent: HTMLElement;
  element: HTMLElement;
  item: CompareItem;

  constructor(parent: HTMLElement, item: CompareItem) {
    this.parent = parent;
    this.item = item;
  }

  create(): HTMLElement {
    const el = this.element = $('.tab');
    return el;
  }

  css(style: { active?: boolean; }): void {
    const { active } = style;
    if(active) this.element.classList.add('active');
    else this.element.classList.remove('active');
  }

}