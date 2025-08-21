import { SplitView, SplitViewItemSizeType, SplitViewItemView } from "../component/SplitView";
import { Layout } from "../Layout";
import * as dom from "../util/dom";
import { bodyLayoutServiceId, getService, mainLayoutServiceId, Service, setService } from "../Service";
import { MainLayoutService } from "./MainLayout";

import '../../lib/mergely/mergely.css';
import { GroupView } from "../part/view/GroupView";
import { CompareFolderData, CompareItem,
  leftToRightFolderMenuId, rightToLeftFolderMenuId, leftToOtherFolderMenuId, rightToOtherFolderMenuId,
} from "../../common/Types";

import { v4 as uuidv4 } from 'uuid';
import { StringUtil } from "../../common/util/StringUtil";
import { CopyPopup } from "../popup/CopyPopup";
import { ProgressPopup } from "../popup/ProgressPopup";
import { FolderView } from "../part/view/FolderView";
import { FileDesc } from "../Types";
import { Dialog } from "../Dialog";
import { listenerManager } from "../util/ListenerManager";
import { broadcast } from "../Broadcast";

export interface BodyOptions {
  sizeType?: SplitViewItemSizeType;
}

export interface BodyLayoutService extends Service {
  getServices(): void;
  inflate(): void;
  layout(offset: number, size: number): void;
  addFileCompareView(path_lhs?: string, path_rhs?: string): void;
  addFolderCompareView(): void;
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
    // console.log(`offset = ${offset}, size = ${size}`);
    // console.log('dimension =', dimension);
    if(this.groupView) this.groupView.layout();
  }

  groupView: GroupView;
  copyPopup: CopyPopup;
  progressPopup: ProgressPopup;
  dialog: Dialog;

  constructor(parent: HTMLElement, options: BodyOptions) {
    super(parent);
    if(options) {
      this.sizeType = options.sizeType;
    }
    this.border = true;
    this.sashEnablement = false;
    setService(bodyLayoutServiceId, this);

    const menuClickHandler = function(...args: any[]) {
      // console.log('on menu click is called ..');
      // console.log('args =', args);
      if(args && args.length > 1) {
        const id = args[1];

        // merging.copySelected

        if(id === leftToRightFolderMenuId) {
          const srcPath = '/Users/kimjk/workspace/electron/fixture/mixed case/right';
          const dstPath = '/Users/kimjk/workspace/electron/저장/tmp';
          const files: FileDesc[] =
            [
              { relPath: '', name: 'a', type: 'folder' },
              { relPath: 'b/ba', name: 'bab.txt', type: 'file' },
              { relPath: 'b', name: 'bc.txt', type: 'file' },
              { relPath: 'c', name: 'ca.txt', type: 'file' },
              { relPath: 'c', name: 'cb.txt', type: 'file' },
              { relPath: '', name: 'a.txt', type: 'file' }, // empty path case
            ]
          ;
          this.copyPopup.open(srcPath, dstPath, files);
          return;
        }

        if(id === rightToLeftFolderMenuId) {
            const srcPath = '/Users/kimjk/workspace/electron/fixture/mixed case/right';
            const dstPath = '/Users/kimjk/workspace/electron/저장/tmp';
            const files: FileDesc[] =
              [
                // { relPath: '', name: 'a', type: 'folder' },
                { relPath: '', name: 'b', type: 'folder' },
                // { relPath: 'b/ba', name: 'bab.txt', type: 'file' },
                // { relPath: 'b', name: 'bc.txt', type: 'file' },
                // { relPath: 'c', name: 'ca.txt', type: 'file' },
                // { relPath: 'c', name: 'cb.txt', type: 'file' },
                { relPath: '', name: 'a.txt', type: 'file' }, // empty path case
              ]
            ;
            this.progressPopup.open(srcPath, dstPath, files);
            return;
        }

        if(id === leftToOtherFolderMenuId) {
          // this.dialog.open('warning', 'blarblarblar');
          // this.dialog.open('error', 'blarblarblar');
          this.dialog.open('info', 'blarblarblar');
          // , null, [
          //   { label: 'Yes', click: () => {} },
          //   { label: 'Yes to all', click: () => {} },
          //   { label: 'No', click: () => {} },
          //   { label: 'No to all', click: () => {} },
          //   { label: 'Cancel', click: () => {} },
          // ]);
          return;
        }

      }
    };

    listenerManager.register(this, broadcast, 'menu click', menuClickHandler.bind(this))
    listenerManager.register(this, window.ipc, 'menu click', menuClickHandler.bind(this));
  }

  create(): void {
    this.container.classList.add(...['body', 'layout']);
    // const splitView = this.splitView = new SplitView(this.container, { orientation: Orientation.HORIZONTAL });
    this.parent && this.parent.appendChild(this.container);
    const copyPopup = this.copyPopup = new CopyPopup(this.container);
    const progressPopup = this.progressPopup = new ProgressPopup(this.container);
    const dialog = this.dialog = new Dialog(this.container);
  }

  inflate(): void {}

  getServices(): void {}

  addFileCompareView(path_lhs: string, path_rhs: string): void {
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
      { type: 'file', uid: uuidv4(), path_lhs: StringUtil.fixNull(path_lhs), path_rhs: StringUtil.fixNull(path_rhs) }, // blank folder compare
    ];

    if(this.groupView) {
      this.groupView.addGroup(group);
    } else {
      const groupView = this.groupView = new GroupView(this.container, group, {});
      this.container.appendChild(groupView.create());
    }
  }

  addFolderCompareView(): void {
    const group: CompareItem[] = [
      { type: 'folder', uid: uuidv4() }, // blank folder compare
    ];

    if(this.groupView) {
      this.groupView.addGroup(group);
    } else {
      const groupView = this.groupView = new GroupView(this.container, group, {});
      this.container.appendChild(groupView.create());

      // occur layout event for explicitly set canvas w,h
      const mainLayoutService = getService(mainLayoutServiceId) as MainLayoutService;
      mainLayoutService.layout();

      /* // TEST: do compare automatically
      // -> select inserted, changed
      // -> copy selected item to other folder
      console.log(this.groupView.compares.map);
      const v = this.groupView.compares.map.get(group[0].uid) as FolderView;
      v.doCompare();
      setTimeout(() => {
        v.selectPopup.emit('ok');
        // setTimeout(() => {
        //   window.ipc.send('menu click', { cmd: 'merging:right to other folder' });
        // }, 10);
      }, 100); */
    }
  }

}