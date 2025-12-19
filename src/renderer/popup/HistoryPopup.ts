import { MainLayoutService } from "../layout/MainLayout";
import { Popup, PopupOptions } from "../Popup";
import { getService, mainLayoutServiceId } from "../Service";
import { $ } from "../util/dom";
import * as dom from "../util/dom";

/**
 * clear:
 * ok:
 */
export class HistoryPopup extends Popup {

  table: HTMLElement;
  tbody: HTMLElement;
  clearBtn: HTMLButtonElement;
  okBtn: HTMLButtonElement;
  cancelBtn: HTMLButtonElement;

  constructor(parent: HTMLElement, options?: PopupOptions) {
    super(parent, options);
    this.title.innerHTML = 'History';
    this.contentArea.classList.add('history');

    const listView = $('.list-view');

    let table, colgroup, col, tbody, tr, th, td;

    const head = $('.head');
    table = $('table');
    colgroup = $('colgroup');
    col = $('col'); col.setAttribute('width', '50%'); colgroup.appendChild(col);
    col = $('col'); col.setAttribute('width', '50%'); colgroup.appendChild(col);
    tbody = $('tbody');
    table.appendChild(colgroup);
    table.appendChild(tbody);
    tr = $('tr'); tbody.appendChild(tr);
    th = $('th'); th.innerHTML = 'Left'; tr.appendChild(th);
    th = $('th'); th.innerHTML = 'Right'; tr.appendChild(th);
    // th = $('th'); tr.appendChild(th);
    head.appendChild(table);

    const body = $('.body.scrollable');
    table = this.table = $('table');
    colgroup = $('colgroup');
    col = $('col'); col.setAttribute('width', '50%'); colgroup.appendChild(col);
    col = $('col'); col.setAttribute('width', '50%'); colgroup.appendChild(col);
    tbody = this.tbody = $('tbody');
    table.appendChild(colgroup);
    table.appendChild(tbody);
    body.appendChild(table);

    listView.appendChild(head);
    listView.appendChild(body);
    this.contentArea.appendChild(listView);

    const buttonArea = $('.button-area');
    const clearBtn = this.clearBtn = $('button');
    clearBtn.innerHTML = 'Clear';
    clearBtn.addEventListener('click', () => {});
    const okBtn = this.okBtn = $('button');
    okBtn.innerHTML = 'Ok';
    okBtn.classList.add('disabled');
    okBtn.addEventListener('click', (e: PointerEvent) => {
      const el = e.currentTarget as HTMLElement;
      // if(el.classList.contains('disabled')) return;

      // change input value with item value in current folder-view
      const inputs = document.querySelectorAll('.compares .active .input input');
      // console.log(typeof inputs);
      const left = inputs[0] as HTMLInputElement;
      const right = inputs[1] as HTMLInputElement;

      left.value = (this.table.querySelector('tr.on td:nth-of-type(1)') as HTMLElement).textContent;
      right.value = (this.table.querySelector('tr.on td:nth-of-type(2)') as HTMLElement).textContent;

      // // close popup & re-compare
      // this.close();
      // (getService(mainLayoutServiceId) as MainLayoutService).reCompare();
    });

    const cancelBtn = this.cancelBtn = $('button');
    cancelBtn.innerHTML = 'Cancel';
    cancelBtn.addEventListener('click', () => {
      this.close();
    });

    const left = $('.left');
    const right = $('.right');

    left.appendChild(clearBtn);
    right.appendChild(okBtn);
    right.appendChild(cancelBtn);

    buttonArea.appendChild(left);
    buttonArea.appendChild(right);

    this.contentArea.appendChild(buttonArea);
  }

  async open(args: any[])/* : Promise<void> */ {
    dom.clearContainer(this.tbody);

    const history = await window.ipc.invoke('config get', 'history');

    let tr: HTMLTableRowElement, td: HTMLTableColElement;
    for(let i = 0; i < history.folder.length; i++) {
      tr = $('tr');
      tr.addEventListener('click', (e: PointerEvent) => {
        for(let _i = 0; _i < this.tbody.children.length; _i++)
          this.tbody.children[_i].classList.remove('on');
        (e.currentTarget as HTMLElement).classList.add('on');
        this.okBtn.classList.remove('disabled');
      });
      td = $('td'); td.textContent = history.folder[i].left; tr.appendChild(td);
      td = $('td'); td.textContent = history.folder[i].right; tr.appendChild(td);
      this.tbody.appendChild(tr);
    }

    this.show();
  }

}