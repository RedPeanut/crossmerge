import { CompareItem } from "../../../common/Types";
import { CompareView } from "../../Types";
import { $ } from "../../util/dom";

export interface FolderViewOptions {}

export class FolderView implements CompareView {

  parent: HTMLElement;
  element: HTMLElement;
  item: CompareItem;

  input_lhs: HTMLInputElement;
  input_rhs: HTMLInputElement;
  scrollbar_lhs: HTMLCanvasElement;
  scrollbar_rhs: HTMLCanvasElement;

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
        <div class="list-column lhs">
        </div>
        <div class="list-changes">
        </div>
        <div class="list-column rhs">
        </div>
      </div>
    </div>

    <div class="suggests">
      <div class="input-column lhs">
        <input type="text" placeholder="First folder">
      </div>
      <div class="input-margin"></div>
      <div class="input-column rhs">
        <input type="text" placeholder="Second folder">
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
    const body = $(".body");
    const body_list_scrollbar_lhs = this.scrollbar_lhs = $("canvas.list-scrollbar.lhs");
    const body_list_column_lhs = $(".list-column.lhs");
    const body_list_changes = $(".list-changes");
    const body_list_column_rhs = $(".list-column.rhs");
    const body_list_scrollbar_rhs = this.scrollbar_rhs = $("canvas.list-scrollbar.rhs");

    header.appendChild(header_list_scrollbar_lhs);
    header.appendChild(header_list_column_lhs);
    header.appendChild(header_list_changes);
    header.appendChild(header_list_column_rhs);
    header.appendChild(header_list_scrollbar_rhs);
    lists.appendChild(header);

    // TODO: customized scrollbar in list

    function _renderDiff(changes) {
      // const mcanvas_lhs = this.lhs_margin;
      // const ctx_lhs = mcanvas_lhs.getContext('2d');
      // mcanvas_lhs.removeEventListener('click', this._handleLhsMarginClick);

      const rhs_margin = this.rhs_margin;
      const ctx_rhs = rhs_margin.getContext('2d');
      rhs_margin.removeEventListener('click', this._handleRhsMarginClick);

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

    function _renderChanges() {
      _renderDiff(null); //this.changes);
      // this.element.dispatchEvent(new Event('updated'));
    }

    function _scrolling() {
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
      _renderChanges();
    }

    lists.addEventListener('scroll', (e: Event) => {
      setTimeout(() => {
        _scrolling();
      }, 1);
    });

    body.appendChild(body_list_scrollbar_lhs);
    body.appendChild(body_list_column_lhs);
    body.appendChild(body_list_changes);
    body.appendChild(body_list_column_rhs);
    body.appendChild(body_list_scrollbar_rhs);
    lists.appendChild(body);

    el.appendChild(inputs);
    el.appendChild(lists);

    return el;
  }

  doCompare(): void {
    // throw new Error("Method not implemented.");
    const input_lhs_value = this.input_lhs.value;
    const input_rhs_value = this.input_rhs.value;

    window.ipc.send('new', { ...this.item,
      path_lhs: input_lhs_value,
      path_rhs: input_rhs_value
    });
  }

}