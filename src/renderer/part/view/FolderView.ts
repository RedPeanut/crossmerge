import { CompareFolderData, CompareItem, MenuItem,
  leftToRightFolderMenuId, rightToLeftFolderMenuId, leftToOtherFolderMenuId, rightToOtherFolderMenuId,
  selectChangedMenuId, selectByStateMenuId, expandAllFoldersMenuId, collapseAllFoldersMenuId
} from "../../../common/Types";
import { CompareView, FileDesc } from "../../Types";
import { $ } from "../../util/dom";
import { DebouncedFunc } from "lodash";
import _ from "lodash";
import { popup } from "../../util/contextmenu";
import { Input } from "../../component/Input";
import { renderer } from "../..";
import { SelectPopup } from "../../popup/SelectPopup";
import { recur_do, recur_expand, recur_select } from "../../util/utils";
import { CopyPopup } from "../../popup/CopyPopup";
import { bodyLayoutServiceId, getService, statusbarPartServiceId } from "../../Service";
import { BodyLayoutService } from "../../layout/BodyLayout";
import { StringUtil } from "../../../common/util/StringUtil";
// import { Dialog } from "../../Dialog";
// import { ProgressPopup } from "../../popup/ProgressPopup";
import { StatusbarPartService } from "../StatusbarPart";
import { listenerManager } from "../../util/ListenerManager";
import { broadcast } from "../../Broadcast";

interface Node {
  parent: Node | null;
  elem: HTMLElement;
  children?: Node[];
  // type: 'file' | 'folder';
  // depth: number;

  // for scrollbar
  index?: number;
  type?: 'file' | 'folder';
  indexes?: number[];
  min?: number;
  max?: number;
}

interface PartNodeList {
  left: Node[];
  right: Node[];
  changes: Node[];
  // scrollbar: Node[]; // left
  selectbar: Node[];
}

interface PartNode {
  left: Node;
  right: Node;
  changes: Node;
  // scrollbar: Node; // left
  selectbar: Node;
}

type Change = {
  op?: string, // first character of state: r,i,c
               // 'removed' in right (inserted in left)
               // 'inserted' in right (removed in left)
               // 'changed'
  index?: number,
  line?: number,
  y_start?: number,
  y_end?: number,
}

interface FlattenItem {
  index: number;
  elem: HTMLElement;
}

export interface FolderViewOptions {}

const SCROLLBAR_WIDTH: number = 16;
// const SCROLLBAR_HEIGHT = 100%;

export class FolderView implements CompareView {

  parent: HTMLElement;
  element: HTMLElement;
  item: CompareItem;

  // input_lhs: HTMLInputElement;
  // input_rhs: HTMLInputElement;
  input_lhs: Input;
  input_rhs: Input;

  lists: HTMLElement;
  list_body: HTMLElement;
  list_scrollable: HTMLElement;
  list_selectbar: HTMLElement;
  list_lhs: HTMLElement;
  list_changes: HTMLElement;
  list_rhs: HTMLElement;
  list_scrollbar_vertical: HTMLCanvasElement;
  // list_scrollbar_horizontal: HTMLCanvasElement;

  /*
  // only directory have children but can have no children
  Node[] = [
    {
      parent: null, elem, type: 'directory',
      children: [
        {
          parent, elem, type: 'directory',
          children = [
            { parent, elem, type: 'directory', },
            { parent, elem, type: 'file', },
          ]
        },
        { parent, elem, type: 'directory', },
      ]
    },
    { parent: null, elem, type: 'directory', },
    { parent: null, elem, type: 'file', },
  ]
  */

  partNodeList: PartNodeList;
  lastPartNode: PartNode;
  lastData: CompareFolderData; // for find depth change
  index: number;

  // for scrollbar
  changes: Change[];
  indexes: number[];
  min: number;
  max: number;

  throttle_pushChange: DebouncedFunc<(...args: any[]) => any>;
  throttle_renderChanges: DebouncedFunc<(...args: any[]) => any>;
  throttle_scrolling: DebouncedFunc<(...args: any[]) => any>;

  // for selectbar
  selected: number[] = []; // for multi (ctrl or cmd) select
  flatten: FlattenItem[] = []; // for range (shift) select

  selectPopup: SelectPopup;
  copyPopup: CopyPopup;
  // progressPopup: ProgressPopup;
  // dialog: Dialog;

  constructor(parent: HTMLElement, item: CompareItem) {
    this.parent = parent;
    this.item = item;

    this.throttle_pushChange = _.throttle(this.pushChange.bind(this), 50);
    this.throttle_renderChanges = _.throttle(this.renderChanges.bind(this), 50);
    this.throttle_scrolling = _.throttle(this.scrolling.bind(this), 50);

    window.ipc.on('compare folder start', (...args: any[]) => {});
    window.ipc.on('compare folder end', (...args: any[]) => {

      if(!args || args.length <= 1) return;

      const arg = args[1];
      if(this.item.uid != arg.uid) return;

      this.renewFlatten();

      const statusbarPartService = getService(statusbarPartServiceId) as StatusbarPartService;
      statusbarPartService.update(args[1]);
    });

    window.ipc.on('compare folder data', (...args: any[]) => {
      // console.log('on compare folder data is called ..');
      // console.log('args =', args);
      if(!args || args.length <= 1) return;

      const arg = args[1];
      if(this.item.uid != arg.uid) return;

      this.recv(arg as CompareFolderData);
    });

    listenerManager.register(this, broadcast, 'menu click', this.menuClickHandler.bind(this));
    listenerManager.register(this, window.ipc, 'menu click', this.menuClickHandler.bind(this));
  }

  menuClickHandler(...args: any[]) {
    // console.log('on menu click is called ..');
    // console.log('args =', args);
    if(args && args.length > 1) {
      const id = args[1];

      // merging
      if(id.startsWith('merging')) {

        if(id === leftToRightFolderMenuId) {
          // this.progressPopup.show();
          return;
        }

        if(id === rightToLeftFolderMenuId) {
          // this.dialog.show();
          return;
        }

        let srcPath = '', dstPath = '';

        if(id === leftToRightFolderMenuId) {
          srcPath = this.input_lhs.value() as string;
          dstPath = this.input_rhs.value() as string;
        } else if(id === rightToLeftFolderMenuId) {
          srcPath = this.input_rhs.value() as string;
          dstPath = this.input_lhs.value() as string;
        } else if(id === leftToOtherFolderMenuId) {
          srcPath = this.input_lhs.value() as string;
          dstPath = '';
        } else if(id === rightToOtherFolderMenuId) {
          srcPath = this.input_rhs.value() as string;
          dstPath = ''; //'/Users/kimjk/workspace/electron/저장/tmp';
        }

        let src_tree: HTMLElement | null | undefined, src_part: 'left' | 'right'; //, dest_tree: HTMLElement | null | undefined;
        if(id === leftToRightFolderMenuId) {
          src_tree = this.list_lhs.firstChild as HTMLElement; src_part = 'left';
          // dest_tree = this.list_rhs.firstChild as HTMLElement;
        } else if(id === rightToLeftFolderMenuId) {
          src_tree = this.list_lhs.firstChild as HTMLElement; src_part = 'right';
          // dest_tree = this.list_rhs.firstChild as HTMLElement;
        } else if(id === leftToOtherFolderMenuId) {
          src_tree = this.list_lhs.firstChild as HTMLElement; src_part = 'left';
          // dest_tree = null;
        } else if(id === rightToOtherFolderMenuId) {
          src_tree = this.list_rhs.firstChild as HTMLElement; src_part = 'right';
          // dest_tree = null;
        }

        let files: FileDesc[] = [];
        for(let i = 0; i < this.selected.length; i++) {
          const index = this.selected[i];
          const list = src_tree.querySelectorAll(`#node_${src_part}_${index}`);
          if(list.length > 0) {
            const node = list[0] as HTMLElement;
            let _path: string = '';
            recur_do(node.parentElement, (node) => { _path = renderer.path.sep + node.dataset.name + _path; })
            _path = _path.replace(renderer.path.sep, ''); // replace first
            files.push({ relPath: _path, name: node.dataset.name, type: node.dataset.type });
          }
        }

        files = files.filter(f => !StringUtil.isEmpty(f.name));
        console.log('files =', files);

        for(let i = 0; i < files.length; i++) {
          if(files[i].type === 'folder') {
            let filtered = [];
            for(let j = 0; j < files.length; j++) {
              // 폴더의 하위 파일은 무조건 뒤에 위치하기 때문에
              if(j > i) {
                if(files[j].relPath.startsWith(files[i].name)) {
                  /* filter in here */
                } else
                  filtered.push(files[j]);
              } else
                filtered.push(files[j]);
            }
            files = filtered;
          }
        }
        console.log('files =', files);

        this.copyPopup.open(srcPath, dstPath, files);
      }

      if(id.startsWith('actions')) {
        if(id === selectByStateMenuId) {
          // show select by state popup
          this.selectPopup.show();
        }

        if(id === selectChangedMenuId) {
          // find n select changed in node (only file)
          // if node is collapsed then expand recursively top-ward

          this.clearSelected();

          const tree = this.list_selectbar.firstChild as HTMLElement;
          recur_select(tree, (node) => {
            if(node.dataset.type === 'file' && node.classList.contains('changed')) {
              const index = parseInt(node.dataset.index);

              // do select
              node.classList.add('selected');
              this.selected.push(index);

              // recursively expand node
              recur_expand(node);

              // expand another
              let another = 'left|right|changes'; // |selectbar'
              let anothers: string[] = another.split('|');
              for(let i = 0; i < anothers.length; i++) {
                const node = document.getElementById(`node_${anothers[i]}_${index}`);
                recur_expand(node);
              }
            }
          });

          this.throttle_renderChanges();
          this.renewFlatten();
        }

        if(id === expandAllFoldersMenuId || id === collapseAllFoldersMenuId) {
          // console.log('this.partNodeList.selectbar =', this.partNodeList.selectbar);
          if(this.list_selectbar && this.list_lhs && this.list_changes && this.list_rhs) {

            function recur(list: HTMLElement, fn: (el) => void) {
              for(let i = 0; i < list.childNodes.length; i++) {
                const child = list.childNodes[i] as HTMLElement;

                if(child.classList.contains('content')) continue;
                if(child.classList.contains('node')) {
                  fn(child);
                  recur(child, fn);
                }
              }
            }

            const trees = [
              this.list_selectbar.firstChild as HTMLElement,
              this.list_lhs.firstChild as HTMLElement,
              this.list_changes.firstChild as HTMLElement,
              this.list_rhs.firstChild as HTMLElement,
            ];

            for(let i = 0; i < trees.length; i++) {
              recur(trees[i], (el) => {
                if(id === expandAllFoldersMenuId) {
                  if(el.classList.contains('collapsed'))
                    el.classList.remove('collapsed');
                } else { // == 'collapse all folders'
                  if(!el.classList.contains('collapsed'))
                    el.classList.add('collapsed');
                }
              });
            }
          }

          this.throttle_renderChanges();
          this.renewFlatten();
        }
      }
    }
  };

  renewFlatten(): void {
    this.flatten = [];

      function recur(list: HTMLElement, fn: (el) => boolean) {
        for(let i = 0; i < list.childNodes.length; i++) {
          const child = list.childNodes[i] as HTMLElement;

          if(child.classList.contains('content')) continue;
          if(child.classList.contains('node')) {
            if(fn(child))
              recur(child, fn);
          }
        }
      }

      const tree = this.list_selectbar.firstChild as HTMLElement;
      recur(tree, (el) => {
        this.flatten.push({ index: el.dataset.index, elem: el });
        if(el.classList.contains('collapsed'))
          return false;
        else
          return true;
      });
      // console.log('this.flatten =', this.flatten);
  }

  modifyChanges(): void {

    const changes: Change[] = this.changes;
    for(let i = 0; i < changes.length; i++) {
      const change = changes[i];
      const index = change.index;

      function getLineIndex(nodes: Node[], line: number): number {
        for(let i = 0; i < nodes.length; i++, line++) {
          const node = nodes[i];
          if(node.index >= index) return line;

          if(node.type && node.type == 'folder') {
            if(node.elem.classList.contains('collapsed')) {
              if(node.min <= index && index <= node.max)
                return -1;
              // line++;
            } else {
              if(node.min <= index && index <= node.max) {
                return getLineIndex.bind(this)(node.children, ++line);
              } else {
                if(node.children) line += node.children.length;
                // line++;
              }
            }
          } else {
            // line++;
          }
        }

        // console.log('line =', line);
        return line;
      }

      // console.log('this.partNodeList.left =', this.partNodeList.left);
      const line = getLineIndex.bind(this)(this.partNodeList.left, 0);
      change.line = line;
    }

    // console.log('this.changes =', this.changes);
    this.throttle_renderChanges();
  }

  pushChange(op: string, index: number): void {

    function getLineIndex(nodes: Node[], line: number): number {
      for(let i = 0; i < nodes.length; i++, line++) {
        const node = nodes[i];
        if(node.index >= index) return line;

        if(node.type && node.type == 'folder') {
          if(node.elem.classList.contains('collapsed')) {
            if(node.min <= index && index <= node.max)
                return -1;
            // line++;
          } else {
            if(node.min <= index && index <= node.max) {
              return getLineIndex.bind(this)(node.children, ++line);
            } else {
              if(node.children) line += node.children.length;
              // line++;
            }
          }
        } else {
          // line++;
        }
      }

      // console.log('line =', line);
      return line;
    }

    // console.log('this.partNodeList.left =', this.partNodeList.left);
    const line = getLineIndex.bind(this)(this.partNodeList.left, 0);
    this.changes.push({ op, index, line });
    // console.log('this.changes =', this.changes);
    this.throttle_renderChanges();
  }

  clearCanvases(): void {
    // console.log('clearCanvases is called..');

    const width = this.list_scrollbar_vertical.clientWidth;
    const height = this.list_scrollbar_vertical.clientHeight;
    const ctx = this.list_scrollbar_vertical.getContext('2d');
    // ctx.clearRect(0, 0, width, height);
    // ctx.fillStyle = 'rgb(240 240 240)';
    ctx.fillStyle = 'rgb(255 255 255)';
    ctx.fillRect(0, 0, width, height);
  }

  renderScroll(): void {
    // console.log('renderScroll is called..'); // e =', e);

    const { scrollLeft, scrollTop, scrollWidth, scrollHeight,
      clientLeft, clientTop, clientWidth, clientHeight,
      offsetLeft, offsetTop, offsetWidth, offsetHeight
    } = this.list_scrollable;

    // console.log(`element.scrollLTWH = ${scrollLeft},${scrollTop},${scrollWidth},${scrollHeight}`);
    // console.log(`element.clientLTWH = ${clientLeft},${clientTop},${clientWidth},${clientHeight}`);
    // console.log(`element.offsetLTWH = ${offsetLeft},${offsetTop},${offsetWidth},${offsetHeight}`);

    // console.log(`element.scrollTH = ${scrollTop},${scrollHeight}`);
    // console.log(`element.clientTH = ${clientTop},${clientHeight}`);
    // console.log(`element.offsetTH = ${offsetTop},${offsetHeight}`);

    const ctx = this.list_scrollbar_vertical.getContext('2d');

    let ratio, y, h;

    const totalLine = this.index; // number
    ratio = scrollHeight / totalLine;

    // render changes
    const changes: Change[] = this.changes;
    // console.log('changes =', changes);
    for(let i = 0; i < changes.length; ++i) {
      const change = changes[i];
      if(change.line == -1) continue;
      y = change.line * ratio;
      h = ratio;
      if(change.op == 'c') ctx.fillStyle = 'rgb(152 85 214)';
      else if(change.op == 'r') ctx.fillStyle = 'rgb(224 158 87)';
      else if(change.op == 'i') ctx.fillStyle = 'rgb(95 216 85)';
      ctx.fillRect(5, y, 6, h); // xywh
    }

    // render thumb
    ratio = clientHeight / scrollHeight;
    y = scrollTop * ratio;
    h = clientHeight * ratio;

    ctx.fillStyle = 'rgb(167 167 167 / 50%)';
    ctx.fillRect(3, y, 10, h); // xywh

    // (opt) add click listener

  }

  renderChanges() {

    if(!this.changes || !this.changes.length)
      return;

    this.clearCanvases();

    const { scrollLeft, scrollTop, scrollWidth, scrollHeight,
      clientLeft, clientTop, clientWidth, clientHeight,
      offsetLeft, offsetTop, offsetWidth, offsetHeight
    } = this.list_scrollable;

    if(scrollHeight > clientHeight) {
      this.renderScroll();
    }
    // this.element.dispatchEvent(new Event('updated'));
  }

  scrolling(e: Event): void {
    // console.log('scrolling is called..'); // e =', e);
    // const { scrollLeft, scrollTop, scrollWidth, scrollHeight } = this.list_body;
    // console.log(`element.scrollLTWH = ${scrollLeft},${scrollTop},${scrollWidth},${scrollHeight}`);
    this.renderChanges();
  }

  create(): HTMLElement {
    const el = this.element = $('.folder-compare-view');

    const selectPopup = this.selectPopup = new SelectPopup(el);

    selectPopup.on('ok', (data) => {
      const rdoType = this.selectPopup.contentArea.querySelectorAll('input[name=rdoType]:checked');
      const chkboxLeft = this.selectPopup.contentArea.querySelectorAll('input[name=chkboxLeft]:checked');
      const chkboxRight = this.selectPopup.contentArea.querySelectorAll('input[name=chkboxRight]:checked');

      let checkedValues: string[] = [];
      for(let i = 0; i < chkboxLeft.length; i++) {
        let value = (chkboxLeft[i] as HTMLInputElement).value;
        if(!checkedValues.includes(value))
          checkedValues.push(value);
      }

      for(let i = 0; i < chkboxRight.length; i++) {
        let value = (chkboxRight[i] as HTMLInputElement).value;
        if(!checkedValues.includes(value))
          checkedValues.push(value);
      }

      this.clearSelected();

      const tree = this.list_selectbar.firstChild as HTMLElement;
      recur_select(tree, (node) => {
        if(node.dataset.type === 'file') {

          for(let i = 0; i < checkedValues.length; i++) {
            if(node.classList.contains(checkedValues[i])) {
              const index = parseInt(node.dataset.index);

              // do select
              node.classList.add('selected');
              this.selected.push(index);

              // recursively expand node
              recur_expand(node);

              // expand another
              let another = 'left|right|changes'; // |selectbar'
              let anothers: string[] = another.split('|');
              for(let i = 0; i < anothers.length; i++) {
                const node = document.getElementById(`node_${anothers[i]}_${index}`);
                recur_expand(node);
              }
            }
          } // for every checked value

        } // if file
      });

      this.throttle_renderChanges();
      this.renewFlatten();
    });

    const copyPopup = this.copyPopup = new CopyPopup(el);
    // copyPopup.on('do copy', (data) => {});
    // copyPopup.on('folder selected', (data) => {});

    // const progressPopup = this.progressPopup = new ProgressPopup(el);
    // const disalog = this.dialog = new Dialog(el);

    // tree area, changes area, customized scrollbar, etc.

    /*
    <div class="inputs">
      <div class="input-column lhs">
        <input type="text" placeholder="First folder">
      </div>
      <div class="input-margin"></div>
      <div class="input-column rhs">
        <input type="text" placeholder="Second folder">
      </div>
    </div>

    <div class="suggests">
      <div class="suggest-column lhs">
      </div>
      <div class="suggest-margin"></div>
      <div class="suggest-column rhs">
      </div>
    </div>

    <div class="lists">
      <div class="header">
        <div class="list-margin lhs"/>
        <div class="list-column lhs"/>
        <div class="list-changes"/>
        <div class="list-column rhs"/>
        <div class="list-margin rhs"/>
      </div>
      <div class="body">
        <div class="list-margin lhs"/>
        <div class="list-scrollable">
          <div class="list-selectbar">
            <div class="tree"> nodes .. </div>
          </div>
          <!-- <canvas class="list-scrollbar lhs"></div> -->
          <div class="list-column lhs">
            <div class="tree">
              <div class="node" style="padding indent">
                <div class="content">
                  <div class="ln-header">
                    <div class="arrow"><a class="codicon codicon-chevron-right"></a></div>
                  </div>
                  <div class="ln-body">
                    <div class="title"><span class="icon"><a class="codicon codicon-folder"></a></span>folder</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="list-changes">
            <div class="tree"> nodes .. </div>
          </div>
          <div class="list-column rhs">
            <div class="tree"> nodes .. </div>
          </div>
        </div>
        <canvas class="list-scrollbar vertical"></div>
        <canvas class="list-scrollbar horizontal"></div>
      </div>
    </div>
    */

    const inputs = $(".inputs");
    const input_column_lhs = $(".input-column.lhs");
    // const input_lhs = this.input_lhs = $('input.lhs') as HTMLInputElement;
    // input_lhs.placeholder = 'Left folder';
    const input_lhs = this.input_lhs = new Input(input_column_lhs, { mode: 'folder' });
    input_lhs.placeholder('Left folder');

    const input_margin = $(".input-margin");
    const input_column_rhs = $(".input-column.rhs");
    // const input_rhs = this.input_rhs = $('input.rhs') as HTMLInputElement;
    // input_rhs.placeholder = 'Right folder';
    const input_rhs = this.input_rhs = new Input(input_column_rhs, { mode: 'folder' });
    input_rhs.placeholder('Right folder');

    input_lhs.value('/Users/kimjk/workspace/electron/fixture/mixed case/left');
    input_rhs.value('/Users/kimjk/workspace/electron/fixture/mixed case/right');

    // input_lhs.value = '/Users/kimjk/workspace/electron/crossmerge/test/fixture/simple insert/left';
    // input_rhs.value = '/Users/kimjk/workspace/electron/crossmerge/test/fixture/simple insert/right';

    // input_lhs.value = '/Users/kimjk/workspace/electron/crossmerge/test/fixture/simple change/left';
    // input_rhs.value = '/Users/kimjk/workspace/electron/crossmerge/test/fixture/simple change/right';

    // input_lhs.value = '/Users/kimjk/workspace/electron/crossmerge-compare';
    // input_rhs.value = '/Users/kimjk/workspace/electron/crossmerge';

    function keyPressHandler(e: KeyboardEvent) {
      // console.log('keypress event is called ..');
      // console.log('e.keyCode =', e.keyCode);

      // if(e.keyCode == 13) {
      if(e.key === 'Enter') {
        // launch comparison
        this.doCompare();
        this.lists.focus();
        return;
      }
    }

    input_lhs.addEventListener('keypress', keyPressHandler.bind(this));
    input_rhs.addEventListener('keypress', keyPressHandler.bind(this));

    // input_column_lhs.appendChild(input_lhs);
    inputs.appendChild(input_column_lhs);
    inputs.appendChild(input_margin);
    // input_column_rhs.appendChild(input_rhs);
    inputs.appendChild(input_column_rhs);

    // const suggests = $(".suggests");
    // // suggests.style.display = 'none';
    // const suggest_column_lhs = $(".suggest-column.lhs");
    // const suggest_margin = $(".suggest-margin");
    // const suggest_column_rhs = $(".suggest-column.rhs");
    // suggests.appendChild(suggest_column_lhs);
    // suggests.appendChild(suggest_margin);
    // suggests.appendChild(suggest_column_rhs);

    const lists = this.lists = $(".lists");
    lists.tabIndex = 0;
    lists.contentEditable = 'true';

    const header = $(".header");
    const header_list_margin_lhs = $(".list-margin.lhs");
    const header_list_column_lhs = $(".list-column.lhs");
    header_list_column_lhs.innerHTML = 'Left';
    const header_list_changes = $(".list-changes");
    header_list_changes.innerHTML = 'Changes';
    const header_list_column_rhs = $(".list-column.rhs");
    header_list_column_rhs.innerHTML = 'Right';
    const header_list_margin_rhs = $(".list-margin.rhs");
    // const header_list_scrollbar_rhs = $(".list-scrollbar.rhs");

    header.appendChild(header_list_margin_lhs);
    header.appendChild(header_list_column_lhs);
    header.appendChild(header_list_changes);
    header.appendChild(header_list_column_rhs);
    header.appendChild(header_list_margin_rhs);
    // header.appendChild(header_list_scrollbar_rhs);
    lists.appendChild(header);

    const body = this.list_body = $(".body");
    const list_margin_lhs = $(".list-margin.lhs");
    const list_scrollable = this.list_scrollable = $(".list-scrollable");
    const list_selectbar = this.list_selectbar = $(".list-selectbar");
    const list_column_lhs = this.list_lhs = $(".list-column.lhs");
    const list_changes = this.list_changes = $(".list-changes");
    const list_column_rhs = this.list_rhs = $(".list-column.rhs");
    const list_margin_rhs = $(".list-margin.rhs");

    const list_scrollbar_vertical = this.list_scrollbar_vertical = $("canvas.list-scrollbar.vertical");
    // const list_scrollbar_horizontal = this.list_scrollbar_horizontal = $("canvas.list-scrollbar.horizontal");

    function addTree(el: HTMLElement) {
      const tree = $(".tree");
      el.appendChild(tree);
    }

    addTree(list_selectbar);
    addTree(list_column_lhs);
    addTree(list_changes);
    addTree(list_column_rhs);

    list_scrollable.appendChild(list_selectbar);
    list_scrollable.appendChild(list_column_lhs);
    list_scrollable.appendChild(list_changes);
    list_scrollable.appendChild(list_column_rhs);

    // TODO: customized scrollbar in list
    list_scrollable.addEventListener('scroll', (e: Event) => {
      this.throttle_scrolling(e);
    });

    body.appendChild(list_margin_lhs);
    body.appendChild(list_scrollable);
    body.appendChild(list_margin_rhs);
    body.appendChild(list_scrollbar_vertical);
    // body.appendChild(list_scrollbar_horizontal);
    lists.appendChild(body);

    el.appendChild(inputs);
    // el.appendChild(suggests);
    el.appendChild(lists);

    return el;
  }

  doCompare(): void {

    // reset
    this.partNodeList = { left: [], right: [], changes: [], selectbar: [] };
    this.lastPartNode = null; //{ left: null, right: null, changes: null };
    this.lastData = null;
    this.index = 0;

    this.changes = [];
    this.indexes = [];
    this.min = -1;
    this.max = -1;

    const parts = [ this.list_selectbar, this.list_lhs, this.list_changes, this.list_rhs ];
    for(let i = 0; i < parts.length; i++) {
      const length = parts[i].firstChild.childNodes.length;
      for(let j = 0; j < length; j++)
        parts[i].firstChild.removeChild(parts[i].firstChild.childNodes[0]);
    }

    // this.flatten = [];
    this.selected = [];

    const input_lhs_value = this.input_lhs.value();
    const input_rhs_value = this.input_rhs.value();

    window.ipc.send('new', {
      ...this.item,
      path_lhs: input_lhs_value,
      path_rhs: input_rhs_value
    });
  }

  addNode(container: HTMLElement, data: CompareFolderData,
    mode: string,
    part: string, index: number
  ): HTMLElement {
    const self = this;
    const hasChildren = data.data.isDirectory && data.length > 0, isCollapsed = true;
    const node = $(".node");
    node.id = `node_${part}_${index}`;
    node.dataset.index = index+'';
    node.dataset.type = data.type; // data.type; // ? 'folder' : 'file';
    node.dataset.name = mode === 'empty' ? '' : StringUtil.fixNull(data.data.name);
    // node.dataset.path_lhs = StringUtil.fixNull(data.data.lhs.path);
    // node.dataset.path_rhs = StringUtil.fixNull(data.data.rhs.path);

    if(mode == 'empty') {
      const content = $(".content");
      if(hasChildren) {
        if(isCollapsed) node.classList.add('collapsed');
      }
      node.appendChild(content);
      container.appendChild(node);
      return node;
    } else if(mode == 'changes') {
      const content = $(".content");
      content.innerHTML = data.changes ? data.changes+'' : '';

      if(hasChildren) {
        if(isCollapsed) node.classList.add('collapsed');
      }
      node.appendChild(content);
      container.appendChild(node);
      return node;
    } else if(mode == 'selectbar') {

      node.classList.add(data.state); // changed, inserted, removed

      node.onclick = (e: PointerEvent) => {
        // console.log('selectbar node clicked ..');

        /* function clearSelected() {
          for(let i = 0; i < this.selected.length; i++) {
            // (this.list_selectbar.firstChild as HTMLElement).getElement
            const find = document.getElementById('node_selectbar_' + this.selected[i]);
            find && find.classList.remove('selected');
          }
          this.selected = [];
        } */

        function handleShiftOp(lastIndex: number): void {

          // if(this.selected.length == 0) return;
          // const lastIndex = this.selected[this.selected.length-1];

          let found = false;
          let start = 0;
          for(; start < this.flatten.length; start++) {
            const item = this.flatten[start];
            if(item.index == lastIndex) {
              found = true;
              break;
            }
          }

          if(!found) return;

          found = false;
          let end = 0;
          for(; end < this.flatten.length; end++) {
            const item = this.flatten[end];
            if(item.index == index) {
              found = true;
              break;
            }
          }

          if(!found) return;

          console.log(`start: ${start}, end: ${end}`);

          if(start > end) {
            let tmp = start;
            start = end;
            end = tmp;
          }

          for(let i = start; i <= end; i++) {
            this.flatten[i].elem.classList.add('selected');
            if(!this.selected.includes(this.flatten[i].index))
              this.selected.push(this.flatten[i].index);
          }
        }

        const index: number = parseInt((e.target as HTMLElement).parentElement.dataset.index);
        const cmdOrCtrlKey = renderer.process.platform === 'darwin' ? e.metaKey : e.ctrlKey;
        if(cmdOrCtrlKey && e.shiftKey) {
          if(this.selected.length == 0) return;
          const lastIndex = this.selected[this.selected.length-1];
          handleShiftOp.bind(this)(lastIndex);
        } else if(cmdOrCtrlKey) {
          node.classList.toggle('selected');
          this.selected.push(index);
        } else if(e.shiftKey) {
          if(this.selected.length == 0) return;
          const lastIndex = this.selected[this.selected.length-1];
          this.clearSelected.bind(this)();
          handleShiftOp.bind(this)(lastIndex);
        } else {
          this.clearSelected.bind(this)();
          node.classList.toggle('selected');
          this.selected.push(index);
        }

        // e.preventDefault();
        // return false;
        e.stopPropagation();
      }

      const content = $(".content");
      content.oncontextmenu = (e) => {
        // console.log('e =', e);
        // console.log('node =', node);

        const items: MenuItem[] = [];
        items.push({
          accelerator: 'Cmd+Shift+L',
          label: 'Launch Comparisons for Selected Rows', //localize(key, msg),
          click: () => {
            console.log('click event is received ..');

            let path_lhs, path_rhs;

            if(StringUtil.isEmpty(node.dataset.path_lhs))
              path_lhs = '';
            else
              path_lhs = node.dataset.path_lhs + renderer.path.sep + node.dataset.name;

            if(StringUtil.isEmpty(node.dataset.path_rhs))
              path_rhs = '';
            else
              path_rhs = node.dataset.path_rhs + renderer.path.sep + node.dataset.name;

            const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
            bodyLayoutService.addFileCompareView(path_lhs, path_rhs);
          }
        });
        popup(items);
      };

      if(hasChildren) {
        if(isCollapsed) node.classList.add('collapsed');
      }
      node.appendChild(content);
      container.appendChild(node);
      return node;
    }

    node.style.paddingLeft = `10px`;
    const content = $(".content");
    const header = $(".ln-header");
    const body = $(".ln-body");
    body.innerHTML = data.data.name;

    if(hasChildren) {
      const arrow = $('.arrow');
      if(isCollapsed) node.classList.add('collapsed');
      arrow.onclick = (e) => {
        // console.log('(arrow) onclick() is called ..');
        // onChange(data.id, { isCollapsed: !isCollapsed });
        node.classList.toggle('collapsed');

        // toggle another
        let another = '|left|right|changes|selectbar';
        another = another.replace('|'+part, '');
        if(another.startsWith('|')) another = another.substring(1);
        let anothers: string[] = another.split('|');
        for(let i = 0; i < anothers.length; i++) {
          document.getElementById(`node_${anothers[i]}_${index}`).classList.toggle('collapsed');
        }
        self.modifyChanges();


        // HERE: after toggled

        function recur(list: HTMLElement, fn: (el) => boolean) {
          for(let i = 0; i < list.childNodes.length; i++) {
            const child = list.childNodes[i] as HTMLElement;

            if(child.classList.contains('content')) continue;
            if(child.classList.contains('node')) {
              if(fn(child))
                recur(child, fn);
            }
          }
        }

        let items: FlattenItem[] = [];
        let i = 0;
        for(; i < this.flatten.length; i++) {
          const item = this.flatten[i];
          if(item.index == index) {
            recur(node, (el) => {
              const index = el.dataset.index;
              const selectbar = document.getElementById(`node_selectbar_${index}`);
              items.push({ index, elem: selectbar });
              if(el.classList.contains('collapsed'))
                return false;
              else
                return true;
            });
            break;
          }
        }

        const collapsed: boolean = node.classList.contains('collapsed');
        if(collapsed) {
          this.flatten.splice(i+1, items.length);
        } else {
          this.flatten.splice(i+1, 0, ...items);
        }
        // console.log('this.flatten =', this.flatten);
      };

      const collapseArrow = $('a.codicon.codicon-chevron-right');
      if(collapseArrow)
        arrow.appendChild(collapseArrow);
      else
        arrow.innerHTML = '>';

      header.append(arrow);
    }
    content.appendChild(header);
    content.appendChild(body);
    node.appendChild(content);
    container.appendChild(node);
    return node;
  }

  recv(data: CompareFolderData): void {
    /* log data
    let indent = '';
    for(let i = 0; i < data.depth; i++) indent += '  ';
    let icon;
    if(data.data.isDirectory) {
      if(data.length > 0) icon = '+';
      else icon = '-';
    } else {
      if(data.state == 'unchanged') icon = 'u';
      else if(data.state == 'changed') { icon = 'c'; icon += data.changes; }
      else if(data.state == 'removed') icon = 'r';
      else if(data.state == 'inserted') icon = 'i';
    }
    console.log(icon + ' ' + indent + data.data.name); //*/

    // TODO: use system icon

    // add node n make tree
    // console.log('data =', data);

    // 최초
    // console.log('this.lastData =', this.lastData);
    if(this.index == 0) {
      let elem: HTMLElement, node: Node;
      const workPartNode: PartNode = { left: null, right: null, changes: null, selectbar: null };

      this.indexes.push(this.index);
      this.min = 0;
      this.max = 0;

      elem = this.addNode(this.list_lhs.firstChild as HTMLElement, data,
        data.data.side.indexOf('left') > -1 ? null : 'empty',
        'left', this.index
      );

      if(data.data.isDirectory) {
        const indexes = [];
        // indexes.push(data.index);
        node = { parent: null, elem, index: this.index, type: 'folder', indexes, min: -1, max: -1 };
      } else
        node = { parent: null, elem, index: this.index, type: 'file' };

      this.partNodeList.left.push(node);
      workPartNode.left = node;

      elem = this.addNode(this.list_rhs.firstChild as HTMLElement, data,
        data.data.side.indexOf('right') > -1 ? null : 'empty',
        'right', this.index
      );
      node = { parent: null, elem };
      this.partNodeList.right.push(node);
      workPartNode.right = node;

      elem = this.addNode(this.list_changes.firstChild as HTMLElement, data,
        'changes',
        'changes', this.index,
      );
      node = { parent: null, elem };
      this.partNodeList.changes.push(node);
      workPartNode.changes = node;

      elem = this.addNode(this.list_selectbar.firstChild as HTMLElement, data,
        'selectbar',
        'selectbar', this.index,
      );
      node = { parent: null, elem };
      this.partNodeList.selectbar.push(node);
      workPartNode.selectbar = node;

      if(data.state != 'unchanged') {
        const op = data.state.substring(0, 1);
        // this.changes.push({ op: op, index: this.index, line: -1 });
        // this.throttle_pushChange(op, this.index);
        this.pushChange(op, this.index);
      }
      this.throttle_renderChanges();

      this.lastPartNode = workPartNode;
      this.lastData = data;
      this.index++;
      return;
    }

    /**
     * diff (number):
     *   +1: do not occur
     *    0: current parent node
     *   -1: parent parent node
     */
    function getParentNodeOrList(node: Node, diff: number, part: string): Node|Node[] {
      if(diff < 0)
        return getParentNodeOrList.bind(this)(node.parent, diff+1, part);

      if(node.parent == null) {
        /* if(part == 'left') return this.partNodeList.left;
        if(part == 'right') return this.partNodeList.right;
        if(part == 'changes') return this.partNodeList.changes;
        if(part == 'selectbar') return this.partNodeList.selectbar;
        throw new Error('do not enter here'); */
        return this.partNodeList[part];
      }

      return node.parent;
    }

    function recurMax(node: Node, index: number): void {
      node.max = index;
      if(node.parent) recurMax(node.parent, index);
    }

    const diff = data.depth - (this.lastData ? this.lastData.depth : 0);
    // console.log(`diff = ${diff}, data.name = ${data.data.name}`);

    if(diff > 0) { // only +1
      const workPartNode: PartNode = this.lastPartNode;

      if(workPartNode.left.type == 'folder') {
        workPartNode.left.indexes.push(this.index);
        if(workPartNode.left.min == -1) workPartNode.left.min = this.index;
        workPartNode.left.max = this.index;
      }

      if(workPartNode.left.parent) recurMax(workPartNode.left.parent, this.index);

      let elem: HTMLElement, node: Node;
      elem = this.addNode(workPartNode.left.elem as HTMLElement, data,
        data.data.side.indexOf('left') > -1 ? null : 'empty',
        'left', this.index
      );

      if(data.data.isDirectory) {
        const indexes = [];
        // indexes.push(data.index);
        node = { parent: workPartNode.left, elem, index: this.index, type: 'folder', indexes, min: -1, max: -1 };
      } else
        node = { parent: workPartNode.left, elem, index: this.index, type: 'file' };

      if(!workPartNode.left.children)
        workPartNode.left.children = [];
      workPartNode.left.children.push(node);
      workPartNode.left = node;

      elem = this.addNode(workPartNode.right.elem as HTMLElement, data,
        data.data.side.indexOf('right') > -1 ? null : 'empty',
        'right', this.index
      );
      node = { parent: workPartNode.right, elem };
      if(!workPartNode.right.children)
        workPartNode.right.children = [];
      workPartNode.right.children.push(node);
      workPartNode.right = node;

      elem = this.addNode(workPartNode.changes.elem as HTMLElement, data,
        'changes',
        'changes', this.index
      );
      node = { parent: workPartNode.changes, elem };
      if(!workPartNode.changes.children)
        workPartNode.changes.children = [];
      workPartNode.changes.children.push(node);
      workPartNode.changes = node;

      elem = this.addNode(workPartNode.selectbar.elem as HTMLElement, data,
        'selectbar',
        'selectbar', this.index
      );
      node = { parent: workPartNode.selectbar, elem };
      if(!workPartNode.selectbar.children)
        workPartNode.selectbar.children = [];
      workPartNode.selectbar.children.push(node);
      workPartNode.selectbar = node;

      this.lastPartNode = workPartNode;
    } else { //if(diff <= 0) {
      const workPartNode: PartNode = this.lastPartNode;
      let workNodeOrList: Node|Node[];

      workNodeOrList = getParentNodeOrList.bind(this)(workPartNode.left, diff, 'left');
      // console.log('workNodeOrList =', typeof workNodeOrList);

      if(Array.isArray(workNodeOrList)) { // root

        this.indexes.push(this.index);
        // this.max = this.index;

        let elem: HTMLElement, node: Node;
        elem = this.addNode(this.list_lhs.firstChild as HTMLElement, data,
          data.data.side.indexOf('left') > -1 ? null : 'empty',
          'left', this.index
        );

        if(data.data.isDirectory) {
          const indexes = [];
          // indexes.push(this.index);
          node = { parent: null, elem, index: this.index, type: 'folder', indexes, min: -1, max: -1 };
        } else
          node = { parent: null, elem, index: this.index, type: 'file' };

        this.partNodeList.left.push(node);
        workPartNode.left = node as Node;
      } else {
        const workNode: Node = workNodeOrList as Node;

        if(workNode.type == 'folder') {
          workNode.indexes.push(this.index);
          if(workNode.min == -1) workNode.min = this.index;
          workNode.max = this.index;
        }

        if(workNode.parent) recurMax(workNode.parent, this.index);

        let elem: HTMLElement, node: Node;
        elem = this.addNode(workNode.elem, data,
          data.data.side.indexOf('left') > -1 ? null : 'empty',
          'left', this.index
        );

        if(data.data.isDirectory) {
          const indexes = [];
          // indexes.push(this.index);
          node = { parent: workNode, elem, index: this.index, type: 'folder', indexes, min: -1, max: -1 };
        } else
          node = { parent: workNode, elem, index: this.index, type: 'file' };

        if(!workNode.children)
          workNode.children = [];
        workNode.children.push(node);
        workPartNode.left = node as Node;
      }

      workNodeOrList = getParentNodeOrList.bind(this)(workPartNode.right, diff, 'right');

      if(Array.isArray(workNodeOrList)) {
        let elem: HTMLElement, node: Node;
        elem = this.addNode(this.list_rhs.firstChild as HTMLElement, data,
          data.data.side.indexOf('right') > -1 ? null : 'empty',
          'right', this.index
        );
        node = { parent: null, elem };
        this.partNodeList.right.push(node);
        workPartNode.right = node as Node;
      } else {
        const workNode: Node = workNodeOrList as Node;
        const elem: HTMLElement = this.addNode(workNode.elem, data,
          data.data.side.indexOf('right') > -1 ? null : 'empty',
          'right', this.index
        );
        const node: Node = { parent: workNode, elem };
        if(!workNode.children)
          workNode.children = [];
        workNode.children.push(node);
        workPartNode.right = node as Node;
      }

      workNodeOrList = getParentNodeOrList.bind(this)(workPartNode.changes, diff, 'changes');

      if(Array.isArray(workNodeOrList)) {
        let elem: HTMLElement, node: Node;
        elem = this.addNode(this.list_changes.firstChild as HTMLElement, data,
          'changes',
          'changes', this.index
        );
        node = { parent: null, elem };
        this.partNodeList.changes.push(node);
        workPartNode.changes = node as Node;
      } else {
        const workNode: Node = workNodeOrList as Node;
        const elem: HTMLElement = this.addNode(workNode.elem, data,
          'changes',
          'changes', this.index
        );
        const node: Node = { parent: workNode, elem };
        if(!workNode.children)
          workNode.children = [];
        workNode.children.push(node);
        workPartNode.changes = node as Node;
      }

      workNodeOrList = getParentNodeOrList.bind(this)(workPartNode.selectbar, diff, 'selectbar');

      if(Array.isArray(workNodeOrList)) {
        let elem: HTMLElement, node: Node;
        elem = this.addNode(this.list_selectbar.firstChild as HTMLElement, data,
          'selectbar',
          'selectbar', this.index
        );
        node = { parent: null, elem };
        this.partNodeList.selectbar.push(node);
        workPartNode.selectbar = node as Node;
      } else {
        const workNode: Node = workNodeOrList as Node;
        const elem: HTMLElement = this.addNode(workNode.elem, data,
          'selectbar',
          'selectbar', this.index
        );
        const node: Node = { parent: workNode, elem };
        if(!workNode.children)
          workNode.children = [];
        workNode.children.push(node);
        workPartNode.selectbar = node as Node;
      }

      this.lastPartNode = workPartNode;
    }

    // 주의. 여기서 부터 this.lastPartNode 에 현재 노드로 교체된 상태

    // HERE: occur expand event to parent node when changed states are met
    if(data.state != 'unchanged') {
      let workedNode: Node, part: string;
      if(data.state == 'removed') {
        workedNode = this.lastPartNode.left; part = 'left';
      } else if(data.state == 'inserted' || data.state == 'changed') {
        workedNode = this.lastPartNode.right; part = 'right';
      }

      function recur(node: Node, fn: (node: Node) => void): void {
        if(node.parent) {
          fn(node.parent);
          recur(node.parent, fn);
        }
      }

      recur.bind(this)(workedNode, (node: Node) => {
        const id = node.elem.id; // node_${part}_${index}
          const index = id.split('_')[2]; // pick index

          // clear collapsed in all
          let all = '|left|right|changes|selectbar';
          if(all.startsWith('|')) all = all.substring(1);
          let alls: string[] = all.split('|');
          for(let i = 0; i < alls.length; i++) {
            const _node = document.getElementById(`node_${alls[i]}_${index}`);
            if(_node.classList.contains('collapsed'))
              _node.classList.remove('collapsed');
          }
      });
    }

    this.max = this.index;
    // console.log('this.partNodeList.left =', this.partNodeList.left);
    // console.log('this.indexes =', this.indexes);
    // console.log(`this.min = ${this.min}, this.max = ${this.max}`);

    if(data.state != 'unchanged') {
      const op = data.state.substring(0, 1);
      // this.changes.push({ op: op, index: this.index, line: -1 });
      // this.throttle_pushChange(op, this.index);
      this.pushChange(op, this.index);
    }
    this.throttle_renderChanges();

    this.lastData = data;
    this.index++;
  }

  layout(): void {
    // console.log('layout() is called..');
    // this.scrollbar_horizontal.width = SCROLLBAR_WIDTH;
    // this.scrollbar_horizontal.height = this.list_body.clientHeight; // 100%
    if(this.list_scrollbar_vertical.width != SCROLLBAR_WIDTH)
      this.list_scrollbar_vertical.width = SCROLLBAR_WIDTH;
    if(this.list_scrollbar_vertical.height != this.list_body.clientHeight)
      this.list_scrollbar_vertical.height = this.list_body.clientHeight; // 100%
    this.throttle_renderChanges();
  }

  css(style: { active?: boolean; }): void {
    const { active } = style;
    if(active) this.element.classList.add('active');
    else this.element.classList.remove('active');
  }

  clearSelected() {
    for(let i = 0; i < this.selected.length; i++) {
      // (this.list_selectbar.firstChild as HTMLElement).getElement
      const find = document.getElementById('node_selectbar_' + this.selected[i]);
      find && find.classList.remove('selected');
    }
    this.selected = [];
  }
}