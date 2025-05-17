import { CompareFolderData, CompareItem } from "../../../common/Types";
import { CompareView } from "../../Types";
import { $ } from "../../util/dom";

interface Node {
  parent: Node | null;
  elem: HTMLElement;
  type: 'file' | 'folder';
  children?: Node[];
  depth: number;
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

  list_selectbar: HTMLElement;
  list_lhs: HTMLElement;
  list_changes: HTMLElement;
  list_rhs: HTMLElement;

  /*
  tree = [
    // only directory have children
    // directory can have no children
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

  treeList: Node[];
  nextNode;
  lastRecvData: CompareFolderData;

  constructor(parent: HTMLElement, item: CompareItem) {
    this.parent = parent;
    this.item = item;
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
    /* input_lhs.addEventListener('keydown', (e: KeyboardEvent) => {
      console.log('keydown event is called ..');
    }); */
    input_lhs.addEventListener('keypress', (e: KeyboardEvent) => {
      console.log('keypress event is called ..');
      // console.log('e.keyCode =', e.keyCode);

      if(e.keyCode == 13) {
        // launch folder comparison
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

    });

    const input_margin = $(".input-margin");
    const input_column_rhs = $(".input-column.rhs");
    const input_rhs = this.input_rhs = $('input.rhs') as HTMLInputElement;
    input_rhs.placeholder = 'Right folder';

    input_lhs.value = '/Users/kimjk/workspace/electron/crossmerge-compare';
    input_rhs.value = '/Users/kimjk/workspace/electron/crossmerge';

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

    const body = $(".body");
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
    lists.addEventListener('scroll', (e: Event) => {
      setTimeout(() => {
        this._scrolling();
      }, 1);
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

    this.treeList = null;
    this.nextNode = null;
    this.lastRecvData = null;
    for(let i = 0; i < this.list_lhs.firstChild.childNodes.length; i++) {
      this.list_lhs.firstChild.removeChild(this.list_lhs.firstChild.childNodes[i]);
    }
    const input_lhs_value = this.input_lhs.value;
    const input_rhs_value = this.input_rhs.value;

    window.ipc.send('new', {
      ...this.item,
      path_lhs: input_lhs_value,
      path_rhs: input_rhs_value
    });
  }

  _addNode(parent: HTMLElement, data: CompareFolderData): HTMLElement {

    const hasChildren = data.data.isDirectory && data.length > 0, isCollapsed = true;

    const node = $(".node");
    node.style.paddingLeft = `${data.depth*10}px`;
    const content = $(".content");
    const header = $(".ln-header");
    const body = $(".ln-body");
    body.innerHTML = data.data.name;

    if(hasChildren) {
      const arrow = $('.arrow');
      if(isCollapsed) node.classList.add('collapsed');
      arrow.onclick = (e) => {
        // onChange(data.id, { isCollapsed: !isCollapsed });
        node.classList.toggle('collapsed');
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
    parent.appendChild(node);
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
    // TODO: occur expand event to parent node when state is not unchanged (changed, removed in left, inserted in right)

    // add node n make tree

    // console.log('data =', data);
    const currRecvData = data;

    ///* // 최초
    if(this.treeList == null) {
      this.treeList = [];
      const elem: HTMLElement = this._addNode(this.list_lhs.firstChild as HTMLElement, data);
      const node: Node = { parent: null, elem, type: data.type, depth: data.depth};
      this.treeList.push(node);
      this.nextNode = node;
      this.lastRecvData = currRecvData;
      return;
    } //*/

    const diff = currRecvData.depth - (this.lastRecvData ? this.lastRecvData.depth : 0);
    // console.log(`diff = ${diff}, data.name = ${data.data.name}`);

    let workNode: Node; //, nextNode: Node;

    if(diff > 0) { // only +1
      workNode = this.nextNode;
      const elem: HTMLElement = this._addNode(workNode.elem, data);
      const node: Node = { parent: workNode, elem, type: data.type, depth: data.depth};
      if(!workNode.children)
        workNode.children = [];
      workNode.children.push(node);
      // nextNode = node;
      this.nextNode = node;
    } else if(diff <= 0) {
      ///*
      let workNodeOrTreeList: Node|Node[];
      function getParentNodeOrList(node: Node, diff: number): Node|Node[] {
        if(diff < 0)
          return getParentNodeOrList.bind(this)(node.parent, diff+1);
        if(node.parent == null) //
          return this.treeList;
        return node.parent;
      }

      workNodeOrTreeList = getParentNodeOrList.bind(this)(this.nextNode, diff);

      // console.log('workNodeOrList =', workNodeOrTreeList);
      // console.log('typeof workNodeOrList =', typeof workNodeOrTreeList);
      // console.log('workNodeOrList instanceof Node =', workNodeOrTreeList instanceof Node);
      // console.log('workNodeOrList === this.treeList =', workNodeOrTreeList === this.treeList);
      if(workNodeOrTreeList == this.treeList) {
        const elem: HTMLElement = this._addNode(this.list_lhs.firstChild as HTMLElement, data);
        const node: Node = { parent: null, elem, type: data.type, depth: data.depth};
        this.treeList.push(node);
        this.nextNode = node;
      } else {
        workNode = workNodeOrTreeList as Node;
        const elem: HTMLElement = this._addNode(workNode.elem, data);
        const node: Node = { parent: workNode, elem, type: data.type, depth: data.depth};
        if(!workNode.children)
          workNode.children = [];
        workNode.children.push(node);
        // nextNode = node;
        this.nextNode = node;
      }
      //*/
    }

    // console.log('this.treeList =', this.treeList);
    this.lastRecvData = currRecvData;
  }
}