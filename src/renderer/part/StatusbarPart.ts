import { CompareItem } from '../../common/Types';
import { STATUSBAR_HEIGHT } from '../layout/MainLayout';
import { Part } from '../Part';
import { setService, statusbarPartServiceId } from '../Service';
import { $ } from '../util/dom';

export interface StatusbarPartService {
  update(item: CompareItem): void;
  clear(): void;
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

  update(item: CompareItem): void {
    if(item.type === 'file')
      this.span.textContent = `${item.status.removal} removalㆍ${item.status.insertion} insertionㆍ${item.status.change} change`;
    else if(item.type === 'folder')
      this.span.textContent = `${item.status.removed} removedㆍ${item.status.inserted} insertedㆍ${item.status.changed} changedㆍ${item.status.unchanged} unchanged`;
  }

  clear(): void {
    this.span.textContent = ``;
  }

  /* layoutContainer(offset: number): void {
    this._splitViewContainer.style.top = `${offset}px`;
    this._splitViewContainer.style.height = `${this._size}px`;
  } */
}