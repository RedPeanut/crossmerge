import { EventEmitter } from "events";
import { $ } from "./util/dom";

export abstract class Popup extends EventEmitter {
  container: HTMLElement;
  popup: HTMLElement;
  titlebar: HTMLElement;
  contentArea: HTMLElement;

  constructor(parent: HTMLElement) {
    super();
    const container = this.container = $('.popup-container');
    container.style.display = 'none';
    const popup = this.popup = $('.popup');
    const titlebar = this.titlebar = $('.titlebar');
    popup.appendChild(titlebar);

    const contentArea = this.contentArea = $('.content-area');
    popup.appendChild(contentArea);
    container.appendChild(popup);
    parent.appendChild(container);
  }

  // abstract createContentArea(): HTMLElement;
  show(): void {
    this.container.style.display = 'block';
  }

  close(): void {
    this.container.style.display = 'none';
  }
}