import { Group } from "../../Types";
import { $ } from "../../util/dom";

export interface TabOptions {}

export class Tab {

  parent: HTMLElement;
  element: HTMLElement;

  constructor(parent: HTMLElement) {
    this.parent = parent;
  }

  create(): HTMLElement {
    const el = this.element = $('.tab');
    return el;
  }

}