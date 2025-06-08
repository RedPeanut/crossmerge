import { SplitView, SplitViewItemSizeType, SplitViewItemView } from "../component/SplitView";
import { Layout } from "../Layout";
import * as dom from "../util/dom";
import { bodyLayoutServiceId, getService, mainLayoutServiceId, Service, setService } from "../Service";
import { MainLayoutService } from "./MainLayout";

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
  sendFileViewReadData(arg): void;
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
    console.log(`offset = ${offset}, size = ${size}`);
    console.log('dimension =', dimension);
    if(this.groupView) this.groupView.layout();
  }

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

    /* const div = document.createElement('div');
    div.id = 'mergely';
    div.style.height = '760px';
    this.container.appendChild(div);

    const mergely = new Mergely('#mergely', { ...{},
      lhs: "Rhea\nRosalind\nS/2003 J 10\nS/2003 J 12\nS/2003 J 15\nS/2003 J 16\nS/2003 J 18\nS/2003 J 19\nS/2003 J 2\nS/2003 J 23\nS/2003 J 3\nS/2003 J 4\nS/2003 J 5\nS/2003 J 9\nS/2004 N 1\nS/2004 S 12\nS/2004 S 13\nS/2004 S 17\nS/2004 S 7\nS/2006 S 1\nS/2006 S 3\nS/2007 S 2\nS/2007 S 3\nS/2009 S 1\nS/2010 J 1\nS/2010 J 2\nS/2011 J 1\nS/2011 J 2\nSao\nSetebos\nSiarnaq\nSinope\nSkathi\nSkoll\nSponde\nStephano\nStyx\nSurtur\nSuttungr\nSycorax\nTarqeq\nTarvos\nTaygete\nTelesto\nTethys\nThalassa\nThebe\nThelxinoe\nThemisto\nThrymr\nThyone\nTitan\nTitania\nTrinculo\nTriton\nUmbriel\nXI\nYmir\n",
      rhs: "Rhea\nRosalind\nS/2003 J 10\nS/2003 J 12\nS/2003 J 15\nS/2003 J 16\nS/2003 J 18\nS/2003 J 19\nS/2003 J 2\nS/2003 J 23\nS/2003 J 3\nS/2003 J 4\nS/2003 J 5\nS/2003 J 9\nS/2004 N 1 S/2004 N 1S/2004 N 1S/2004 N 1S/2004 N 1S/2004 N 1S/2004 N 1S/2004 N 1\nS/2004 S 12\nS/2004 S 13\nS/2004 S 17\nS/2004 S 7\nS/2006 S 1\nS/2006 S 3\nS/2007 S 2\nS/2007 S 3\nS/2009 S 1\nS/2010 J 1\nS/2010 J 2\nS/2011 J 1\nS/2011 J 2\nSao\nSetebos\nSiarnaq\nSinope Sinope Sinope Sinope Sinope Sinope Sinope Sinope Sinope Sinope\nSkathi\nSkoll\nSponde\nStephano Stephano  Stephano Stephano Stephano Stephano Stephano\nStyx\nSurtur\nSuttungr\nSycorax\nTarqeq\nTarvos\nTaygete\nTelesto\nTethys\nThalassa\nThebe\nThelxinoe\nThemisto\nThrymr\nThyone\nTitan\nTitania\nTrinculo\nTriton\nUmbrella\nXI\nYmir\n"
      // _debug: true,
    }); */

    const group: CompareItem[] = [
      { type: 'file', uid: uuidv4() }, // blank folder compare
    ];
    const groupView = this.groupView = new GroupView(this.container, group, {});
    this.container.appendChild(groupView.create());
  }

  addFolderCompareView(): void {
    const group: CompareItem[] = [
      { type: 'folder', uid: uuidv4() }, // blank folder compare
    ];
    const groupView = this.groupView = new GroupView(this.container, group, {});
    this.container.appendChild(groupView.create());

    // occur layout event for explicitly set canvas w,h
    const mainLayoutService = getService(mainLayoutServiceId) as MainLayoutService;
    mainLayoutService.layout();
  }

  sendFolderViewRowData(arg: CompareFolderData): void {
    this.groupView.sendRowData('folder', arg);
  }

  sendFileViewReadData(arg: any): void {
    this.groupView.sendReadData('file', arg);
  }
}