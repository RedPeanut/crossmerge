import { SplitView, SplitViewItemSizeType, SplitViewItemView } from "../component/SplitView";
import { Layout } from "../Layout";
import { Orientation } from "../component/Sash";
import * as dom from "../util/dom";
import { bodyLayoutServiceId, Service, setService } from "../Service";
import { SamplePart } from "../part/SamplePart";

export interface BodyOptions {
  sizeType?: SplitViewItemSizeType;
}

export interface BodyLayoutService extends Service {
  getServices(): void;
  inflate(): void;
  layout(offset: number, size: number): void;
}

export class BodyLayout extends Layout implements BodyLayoutService, SplitViewItemView {

  get element(): HTMLElement { return this.container; }

  _size: number = 0;
  get size(): number { return this._size; }
  set size(size: number) { this._size = size; }

  _sizeType: SplitViewItemSizeType = 'wrap_content';
  get sizeType(): SplitViewItemSizeType { return this._sizeType; }
  set sizeType(sizeType: SplitViewItemSizeType) { this._sizeType = sizeType; }

  _border: boolean = false;
  get border(): boolean { return this._border; }
  set border(border: boolean) { this._border = border; }

  _sashEnablement: boolean = true;
  get sashEnablement(): boolean { return this._sashEnablement; }
  set sashEnablement(b: boolean) { this._sashEnablement = b; }

  /* layoutContainer(offset: number): void {
    this._splitViewContainer.style.top = `${offset}px`;
    this._splitViewContainer.style.height = `${this._size}px`;
    let dimension = getClientArea(this.mainContainer);
    console.log('dimension =', dimension);
    this.splitView.layout(dimension.width); // Orientation.HORIZONTAL
  } */
  layout(offset: number, size: number): void {
    let dimension = dom.getClientArea(this.container);
    this.splitView.layout(dimension.width);
  }

  splitView: SplitView<SamplePart>;

  constructor(parent: HTMLElement, options: BodyOptions) {
    super(parent);
    if(options) {
      this.sizeType = options.sizeType;
    }
    this.border = true;
    this.sashEnablement = false;
    setService(bodyLayoutServiceId, this);
  }

  create(): void {
    this.container.classList.add(...['body', 'layout']);
    const splitView = this.splitView = new SplitView(this.container, { orientation: Orientation.HORIZONTAL });

    this.parent && this.parent.appendChild(this.container);
  }

  inflate(): void {}

  getServices(): void {}

}