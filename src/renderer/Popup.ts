import { EventEmitter } from "events";
import { $ } from "./util/dom";

export interface PopupOptions {}

export abstract class Popup extends EventEmitter {
  container: HTMLElement;
  popup: HTMLElement;
  titlebar: HTMLElement;
  title: HTMLElement;
  contentArea: HTMLElement;

  isDragging = false;
  dragOffsetX = 0;
  dragOffsetY = 0;

  constructor(parent: HTMLElement) {
    super();
    const container = this.container = $('.popup-container');
    container.style.display = 'none';
    const popup = this.popup = $('.popup');
    const titlebar = this.titlebar = $('.titlebar');
    titlebar.addEventListener('mousedown', this.onDragStart.bind(this));
    document.addEventListener('mousemove', this.onDragMove.bind(this));
    document.addEventListener('mouseup', this.onDragEnd.bind(this));
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

  onDragStart(e: MouseEvent) {
    this.isDragging = true;
    // 팝업의 현재 위치와 마우스 위치 차이 저장
    const rect = this.popup.getBoundingClientRect();
    this.dragOffsetX = e.clientX - rect.left;
    this.dragOffsetY = e.clientY - rect.top;
    // 팝업을 absolute로
    this.popup.style.position = 'fixed';
  }

  onDragMove(e: MouseEvent) {
    if (!this.isDragging) return;
    // 팝업 위치 갱신
    this.popup.style.left = `${e.clientX - this.dragOffsetX}px`;
    this.popup.style.top = `${e.clientY - this.dragOffsetY}px`;
  }

  onDragEnd(e: MouseEvent) {
    this.isDragging = false;
  }

  // abstract createContentArea(): HTMLElement;
  show(): void {
    this.container.style.display = 'flex';
  }

  close(): void {
    this.container.style.display = 'none';
  }
}