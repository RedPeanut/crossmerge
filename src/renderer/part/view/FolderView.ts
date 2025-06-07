import { CompareFolderData, CompareItem } from "../../../common/Types";
import { CompareView } from "../../Types";
import { $ } from "../../util/dom";
import { DebouncedFunc } from "lodash";
import _ from "lodash";

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
  /**
   * first character of state: r,i,c
   * 'removed in right'(inserted in left), 'inserted in right'(removed in left), 'changed'
   */
  op?: string,
  index?: number,
  line?: number,
  y_start?: number,
  y_end?: number,
}

export interface FolderViewOptions {}

export class FolderView implements CompareView {

  parent: HTMLElement;
  element: HTMLElement;
  item: CompareItem;

  input_lhs: HTMLInputElement;
  input_rhs: HTMLInputElement;
  scrollbar_lhs: HTMLCanvasElement;
  scrollbar_rhs: HTMLCanvasElement;

  list_body: HTMLElement;
  list_selectbar: HTMLElement;
  list_lhs: HTMLElement;
  list_changes: HTMLElement;
  list_rhs: HTMLElement;

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
  throttle_scroll: DebouncedFunc<(...args: any[]) => any>;

  constructor(parent: HTMLElement, item: CompareItem) {
    this.parent = parent;
    this.item = item;

    this.throttle_pushChange = _.throttle(this.pushChange.bind(this), 50);
    this.throttle_scroll = _.throttle(this.scroll.bind(this), 50);
  }

  pushChange(op: string, index: number): void {

    function getLineIndex(nodes: Node[], line: number): number {
      for(let i = 0; i < nodes.length; i++, line++) {
        const node = nodes[i];
        if(node.index >= index) return line;

        if(node.type && node.type == 'folder') {
          if(node.elem.classList.contains('collapsed')) {
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

    console.log('this.partNodeList.left =', this.partNodeList.left);
    const line = getLineIndex.bind(this)(this.partNodeList.left, 0);
    this.changes.push({ op, index, line });
    console.log('this.changes =', this.changes);
    // this.throttle_drawScroll();
    // this.scroll();
  }

  scroll(e: Event): void {
    console.log('scroll is called.. e =', e);
    const { scrollLeft, scrollTop, scrollWidth, scrollHeight } = this.list_body;
    console.log(`element.scrollLTWH = ${scrollLeft},${scrollTop},${scrollWidth},${scrollHeight}`);
  }

  create(): HTMLElement {
    const el = this.element = $('.folder-compare-view');

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
        <div class="list-column lhs">
        </div>
        <div class="list-changes">
        </div>
        <div class="list-column rhs">
        </div>
      </div>
      <div class="body">
        <div class="list-selectbar">
          <div class="tree"> nodes .. </div>
        </div>
        <canvas class="list-scrollbar lhs"></div>
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
        <canvas class="list-scrollbar rhs"></div>
      </div>
    </div>
    */

    const inputs = $(".inputs");
    const input_column_lhs = $(".input-column.lhs");
    const input_lhs = this.input_lhs = $('input.lhs') as HTMLInputElement;
    input_lhs.placeholder = 'Left folder';

    const input_margin = $(".input-margin");
    const input_column_rhs = $(".input-column.rhs");
    const input_rhs = this.input_rhs = $('input.rhs') as HTMLInputElement;
    input_rhs.placeholder = 'Right folder';

    // input_lhs.value = '/Users/kimjk/workspace/electron/crossmerge/test/fixture/simple insert/left';
    // input_rhs.value = '/Users/kimjk/workspace/electron/crossmerge/test/fixture/simple insert/right';

    // input_lhs.value = '/Users/kimjk/workspace/electron/crossmerge/test/fixture/simple change/left';
    // input_rhs.value = '/Users/kimjk/workspace/electron/crossmerge/test/fixture/simple change/right';

    input_lhs.value = '/Users/kimjk/workspace/electron/crossmerge-compare';
    input_rhs.value = '/Users/kimjk/workspace/electron/crossmerge';

    function inputKeyPressHandler(e: KeyboardEvent) {
      console.log('keypress event is called ..');
      // console.log('e.keyCode =', e.keyCode);

      if(e.keyCode == 13) {
        // launch comparison
        this.doCompare();
        return;
      }

      // TODO: auto completion

      // check every keyboard's capable char
      // TODO: capture paste event, arrow event?
      if(
        (33 <= e.keyCode && e.keyCode <= 41) // !"#$%&'()
        || (42 <= e.keyCode && e.keyCode <= 47) // *+,-./
        || (48 <= e.keyCode && e.keyCode <= 57) // 0-9
        || (65 <= e.keyCode && e.keyCode <= 90) // A-Z
        || (97 <= e.keyCode && e.keyCode <= 122) // a-z
        || e.keyCode == 92 || e.keyCode == 95 // \_
      ) {

      }
    }

    input_lhs.addEventListener('keypress', inputKeyPressHandler.bind(this));
    input_rhs.addEventListener('keypress', inputKeyPressHandler.bind(this));

    input_column_lhs.appendChild(input_lhs);
    inputs.appendChild(input_column_lhs);
    inputs.appendChild(input_margin);
    input_column_rhs.appendChild(input_rhs);
    inputs.appendChild(input_column_rhs);

    const suggests = $(".suggests");
    suggests.style.display = 'none';
    const suggest_column_lhs = $(".suggest-column.lhs");
    const suggest_margin = $(".suggest-margin");
    const suggest_column_rhs = $(".suggest-column.rhs");
    suggests.appendChild(suggest_column_lhs);
    suggests.appendChild(suggest_margin);
    suggests.appendChild(suggest_column_rhs);

    const lists = $(".lists");
    const header = $(".header");
    const header_list_scrollbar_lhs = $(".list-scrollbar.lhs");
    const header_list_column_lhs = $(".list-column.lhs");
    header_list_column_lhs.innerHTML = 'Left';
    const header_list_changes = $(".list-changes");
    header_list_changes.innerHTML = 'Changes';
    const header_list_column_rhs = $(".list-column.rhs");
    header_list_column_rhs.innerHTML = 'Right';
    const header_list_scrollbar_rhs = $(".list-scrollbar.rhs");

    header.appendChild(header_list_scrollbar_lhs);
    header.appendChild(header_list_column_lhs);
    header.appendChild(header_list_changes);
    header.appendChild(header_list_column_rhs);
    header.appendChild(header_list_scrollbar_rhs);
    lists.appendChild(header);

    const body = this.list_body = $(".body");
    const body_list_selectbar = this.list_selectbar = $(".list-selectbar");
    const body_list_scrollbar_lhs = this.scrollbar_lhs = $("canvas.list-scrollbar.lhs");
    const body_list_column_lhs = this.list_lhs = $(".list-column.lhs");
    const body_list_changes = this.list_changes = $(".list-changes");
    const body_list_column_rhs = this.list_rhs = $(".list-column.rhs");
    const body_list_scrollbar_rhs = this.scrollbar_rhs = $("canvas.list-scrollbar.rhs");

    function addTree(el: HTMLElement) {
      const tree = $(".tree");
      el.appendChild(tree);
    }

    addTree(body_list_selectbar);
    // addTree(body_list_scrollbar_lhs);
    addTree(body_list_column_lhs);
    addTree(body_list_changes);
    addTree(body_list_column_rhs);

    body.appendChild(body_list_selectbar);
    body.appendChild(body_list_scrollbar_lhs);
    body.appendChild(body_list_column_lhs);
    body.appendChild(body_list_changes);
    body.appendChild(body_list_column_rhs);
    body.appendChild(body_list_scrollbar_rhs);
    lists.appendChild(body);

    // TODO: customized scrollbar in list
    body.addEventListener('scroll', (e: Event) => {
      this.throttle_scroll(e);
    });

    el.appendChild(inputs);
    el.appendChild(suggests);
    el.appendChild(lists);

    return el;
  }

  _renderDiff(changes) {
    // const mcanvas_lhs = this.lhs_margin;
    // const ctx_lhs = mcanvas_lhs.getContext('2d');
    // mcanvas_lhs.removeEventListener('click', this._handleLhsMarginClick);

    const rhs_margin = this.scrollbar_rhs;
    const ctx_rhs = rhs_margin.getContext('2d');
    // rhs_margin.removeEventListener('click', this._handleRhsMarginClick);

    const radius = 3;
    /* // const lhsScrollTop = ex.lhs_scroller.scrollTop;
    const rhsScrollTop = rhs_scroller.scrollTop;

    // const lratio = lhs_margin.offsetHeight / lhs_scroller.scrollHeight;
    const rratio = rhs_margin.offsetHeight / rhs_scroller.scrollHeight;

    // draw margin indicators
    for(let i = 0; i < changes.length; ++i) {
      const change = changes[i];

      // const lhs_y_start = change['lhs-y-start'] - lhsScrollTop;
      // const lhs_y_end = change['lhs-y-end'] - lhsScrollTop;
      const rhs_y_start = change['rhs-y-start'] - rhsScrollTop;
      const rhs_y_end = change['rhs-y-end'] - rhsScrollTop;

      const mkr_rhs_y_start = change['rhs-y-start'] * rratio;
      const mkr_rhs_y_end = Math.max(change['rhs-y-end'] * rratio, 5);
      ctx_rhs.beginPath();
      ctx_rhs.fillStyle = '#a3a3a3';
      ctx_rhs.strokeStyle = '#000';
      ctx_rhs.lineWidth = 0.5;
      ctx_rhs.fillRect(1.5, mkr_rhs_y_start, 4.5, Math.max(mkr_rhs_y_end - mkr_rhs_y_start, 5));
      ctx_rhs.strokeRect(1.5, mkr_rhs_y_start, 4.5, Math.max(mkr_rhs_y_end - mkr_rhs_y_start, 5));
      ctx_rhs.stroke();

      // draw connect boxes
    }

    // const lfrom = lhsScrollTop * lratio;
    // const lto = Math.max(ex.lhs_scroller.clientHeight * lratio, 5);
    const rfrom = rhsScrollTop * rratio;
    const rto = Math.max(rhs_scroller.clientHeight * rratio, 5);

    // ctx_lhs.fillRect(1.5, lfrom, 4.5, lto);
    ctx_rhs.fillRect(1.5, rfrom, 4.5, rto);

    this._handleRhsMarginClick = function(ev) {
      const y = ev.pageY - rhs_xyoffset.top - (rto / 2);
      const sto = Math.max(0, (y / rhs_margin.height) * rhs_scroller.scrollHeight);
      rhs_scroller.scrollTo({ top: sto });
    };

    // lhs_margin.addEventListener('click', this._handleLhsMarginClick);
    rhs_margin.addEventListener('click', this._handleRhsMarginClick);
    //*/
  }

  _renderChanges() {
    this._renderDiff(null); //this.changes);
    // this.element.dispatchEvent(new Event('updated'));
  }

  _scrolling() {
    // what to do in here: find can scroll

    /*
    let height;
    let midway;
    height = scroller.clientHeight - (scroller.offsetHeight - scroller.offsetParent.offsetHeight);

    midway = (height / 2.0 + top).toFixed(2);

    const top_to = scroller.scrollTop;
    const left_to = scroller.scrollLeft;
    */

    let scroll = true;
    if(scroll) {
    }
    this._renderChanges();
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

    const parts = [ this.list_lhs, this.list_changes, this.list_rhs ];
    for(let i = 0; i < parts.length; i++) {
      const length = parts[i].firstChild.childNodes.length;
      for(let j = 0; j < length; j++)
        parts[i].firstChild.removeChild(parts[i].firstChild.childNodes[0]);
    }

    /* for(let i = 0; i < this.list_lhs.firstChild.childNodes.length; i++) {
      this.list_lhs.firstChild.removeChild(this.list_lhs.firstChild.childNodes[i]);
    } */

    const input_lhs_value = this.input_lhs.value;
    const input_rhs_value = this.input_rhs.value;

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
      node.onclick = (e) => {
        console.log('selectbar node clicked ..');
        node.classList.toggle('selected');
        e.stopPropagation();
        // return false;
      }

      const content = $(".content");
      if(hasChildren) {
        if(isCollapsed) node.classList.add('collapsed');
      }
      node.appendChild(content);
      container.appendChild(node);
      return node;
    }

    node.style.paddingLeft = `${data.depth*10}px`;
    const content = $(".content");
    const header = $(".ln-header");
    const body = $(".ln-body");
    body.innerHTML = data.data.name;

    if(hasChildren) {
      const arrow = $('.arrow');
      if(isCollapsed) node.classList.add('collapsed');
      arrow.onclick = (e) => {
        console.log('(arrow) onclick() is called ..');
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

  sendRowData(data: CompareFolderData): void {
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
      this.partNodeList.changes.push(node);
      workPartNode.selectbar = node;

      if(data.state != 'unchanged') {
        const op = data.state.substring(0, 1);
        // this.changes.push({ op: op, index: this.index, line: -1 });
        this.throttle_pushChange(op, this.index);
      }

      this.lastPartNode = workPartNode;
      this.lastData = data;
      this.index++;
      return;
    }

    function getParentNodeOrList(node: Node, diff: number, part: string): Node|Node[] {
      if(diff < 0)
        return getParentNodeOrList.bind(this)(node.parent, diff+1, part);
      if(node.parent == null) {
        if(part == 'left') return this.partNodeList.left;
        if(part == 'right') return this.partNodeList.right;
        if(part == 'changes') return this.partNodeList.changes;
        if(part == 'selectbar') return this.partNodeList.selectbar;
        throw new Error('do not enter here');
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

    // HERE: occur expand event to parent node when changed states are met

    ///*
    if(data.state != 'unchanged') {
      // 주의. this.lastPartNode 에 현재 노드 교체된 상태
      let workedNode: Node, part: string;
      if(data.state == 'removed') {
        workedNode = this.lastPartNode.left; part = 'left';
      } else if(data.state == 'inserted' || data.state == 'changed') {
        workedNode = this.lastPartNode.right; part = 'right';
      }

      for(let i = 0; i >= -data.depth; i--) {
        const nodeOrList = getParentNodeOrList.bind(this)(workedNode, i, part);
        if(Array.isArray(nodeOrList)) { // root
        } else {
          const node = nodeOrList as Node;
          // console.log(node.elem.id);
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
        }
      }
    } //*/

    this.max = this.index;
    // console.log('this.partNodeList.left =', this.partNodeList.left);
    // console.log('this.indexes =', this.indexes);
    // console.log(`this.min = ${this.min}, this.max = ${this.max}`);

    if(data.state != 'unchanged') {
      const op = data.state.substring(0, 1);
      // this.changes.push({ op: op, index: this.index, line: -1 });
      this.throttle_pushChange(op, this.index);
    }

    this.lastData = data;
    this.index++;
  }

  sendReadData(data: any): void {
    // not use
  }
}