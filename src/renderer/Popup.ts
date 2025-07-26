import { EventEmitter } from "events";
import { $ } from "./util/dom";

export interface PopupOptions {}

export abstract class Popup extends EventEmitter {
  container: HTMLElement;
  popup: HTMLElement;
  titlebar: HTMLElement;
  title: HTMLElement;
  contentArea: HTMLElement;

  constructor(parent: HTMLElement) {
    super();
    const container = this.container = $('.popup-container');
    container.style.display = 'none';
    const popup = this.popup = $('.popup');
    const titlebar = this.titlebar = $('.titlebar');
    const title = this.title = $('span.title');
    this.title.innerHTML = 'should replace title';
    titlebar.appendChild(title);
    const closeBtn = $('a.codicon.codicon-chrome-close.close');
    closeBtn.addEventListener('click', async () => {
      this.close();
    });
    titlebar.appendChild(closeBtn);
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