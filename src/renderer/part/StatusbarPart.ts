import { STATUSBAR_HEIGHT } from '../layout/MainLayout';
import { Part } from '../Part';
import { setService, statusbarPartServiceId } from '../Service';
import { $ } from '../util/dom';

export interface StatusbarPartService {
  update(status: {
    removed: number,
    inserted: number,
    changed: number,
    unchanged: number,
  }): void;
}

export class StatusbarPart extends Part implements StatusbarPartService {

  span: HTMLElement;

  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    this.size = STATUSBAR_HEIGHT;
    this.sashEnablement = false;
    setService(statusbarPartServiceId, this);
  }

  override createContentArea(): HTMLElement {
    const container: HTMLElement = super.createContentArea();
    const span = this.span = $('span');
    container.appendChild(span);
    return container;
  }

  update(status): void {
    this.span.textContent = `${status.removed} removedㆍ${status.inserted} insertedㆍ${status.changed} changedㆍ${status.unchanged} unchanged`;
  }

  /* layoutContainer(offset: number): void {
    this._splitViewContainer.style.top = `${offset}px`;
    this._splitViewContainer.style.height = `${this._size}px`;
  } */
}