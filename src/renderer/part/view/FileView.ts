import { $ } from "../../util/dom";

export interface FileViewOptions {}

export class FileView {

  parent: HTMLElement;
  element: HTMLElement;

  constructor(parent: HTMLElement) {
    this.parent = parent;
  }

  create(): HTMLElement {
    const el = this.element = $('.file-compare-view');
    return el;
  }

}