import { SplitView, SplitViewItemSizeType, SplitViewItemView } from "../component/SplitView";
import { Layout } from "../Layout";
import { Orientation } from "../component/Sash";
import * as dom from "../util/dom";
import { bodyLayoutServiceId, Service, setService } from "../Service";
import { SamplePart } from "../part/SamplePart";

import Mergely from '../../lib/mergely/Mergely';
import '../../lib/mergely/mergely.css';
import { GroupView } from "../part/view/GroupView";
import { CompareFolderData, CompareItem } from "../../common/Types";

import { v4 as uuidv4 } from 'uuid';

export interface BodyOptions {
  sizeType?: SplitViewItemSizeType;
}

export interface BodyLayoutService extends Service {
  getServices(): void;
  inflate(): void;
  layout(offset: number, size: number): void;
  addFileCompareView(): void;
  addFolderCompareView(): void;
  sendFolderViewRowData(arg: CompareFolderData): void;
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
    // this.splitView.layout(dimension.width);
  }

  splitView: SplitView<SamplePart>;
  groupView: GroupView;

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
    // const splitView = this.splitView = new SplitView(this.container, { orientation: Orientation.HORIZONTAL });

    this.parent && this.parent.appendChild(this.container);
  }

  inflate(): void {}

  getServices(): void {}

  addFileCompareView(): void {
    // console.log('launchFileCompareView ..');
    const div = document.createElement('div');
    div.id = 'mergely';
    div.style.height = '400px';
    this.container.appendChild(div);

    const mergely = new Mergely('#mergely', { ...{},
      lhs: 'the quick red fox\njumped over the hairy dog',
      rhs: 'the quick brown fox\njumped over the lazy dog',
      // _debug: true,
    });
  }

  addFolderCompareView(): void {
    const group: CompareItem[] = [
      { type: 'folder', uid: uuidv4() }, // blank folder compare
    ];
    const groupView = this.groupView = new GroupView(this.container, group, {});
    this.container.appendChild(groupView.create());
  }

  sendFolderViewRowData(arg: CompareFolderData): void {
    this.groupView.sendRowData('folder', arg);
  }

}