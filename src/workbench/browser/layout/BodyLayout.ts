import { SplitViewItemSizeType, SplitViewItemView } from "../../../base/browser/ui/SplitView";
import { Layout } from "../Layout";
import { getClientArea } from "../../../base/browser/dom";

export interface BodyLayoutOptions {
  sizeType?: SplitViewItemSizeType;
}

export class Body extends Layout implements SplitViewItemView {

  get element(): HTMLElement { return this.mainContainer; }

  _size: number = 0;
  get size(): number { return this._size; }
  set size(size: number) { this._size = size; }

  _sizeType: SplitViewItemSizeType = 'wrap_content';
  get sizeType(): SplitViewItemSizeType { return this._sizeType; }
  set sizeType(sizeType: SplitViewItemSizeType) { this._sizeType = sizeType; }

  layout(offset: number, size: number): void {
    let dimension = getClientArea(this.mainContainer);
  }

  constructor(parent: HTMLElement, options: BodyLayoutOptions) {
    super(parent);
    if(options) {
      this.sizeType = options.sizeType;
    }
  }

  create(): void {
    this.mainContainer.classList.add(...['body', 'layout']);

    this.parent && this.parent.appendChild(this.mainContainer);
  }

}