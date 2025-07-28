import path from "path";
import { StringUtil } from "../../common/util/StringUtil";
import { Popup } from "../Popup";
import { $ } from "../util/dom";

/** Emit events
 * ok:
 */
export class ProgressPopup extends Popup {

  fromSpan: HTMLElement;
  toSpan: HTMLElement;
  table: HTMLElement;
  tbody: HTMLElement;

  constructor(parent: HTMLElement) {
    super(parent);
    this.title.innerHTML = 'Files and folders progress';

    this.contentArea.classList.add('fnfp'); // abbr. files n folders progress

    const top = $('.top');
    const left = $('.left');
    const right = $('.right');
    const bottom = $('.bottom');

    let line;
    let label, span, id;

    line = $('.line');
    id = 'copy_from';
    label = $('label');
    label.setAttribute('for', id);
    label.textContent = 'Copying from:';
    span = this.fromSpan = $('span');
    span.id = id;
    span.name = 'copy_from';
    span.textContent = '';

    line.appendChild(label);
    line.appendChild(span);
    left.appendChild(line);

    line = $('.line');
    id = 'copy_to';
    label = $('label');
    label.setAttribute('for', id);
    label.textContent = 'Copying to:';
    span = this.toSpan = $('span');
    span.id = id;
    span.name = 'copy_to';
    span.textContent = '';

    line.appendChild(label);
    line.appendChild(span);
    left.appendChild(line);

    top.appendChild(left);

    const cancelBtn = $('button');
    cancelBtn.innerHTML = 'Cancel';
    cancelBtn.addEventListener('click', () => {
      // this.cancel();
    });
    const closeBtn = $('button');
    closeBtn.innerHTML = 'Close';
    closeBtn.addEventListener('click', () => {
      this.close();
    });
    right.appendChild(cancelBtn);
    right.appendChild(closeBtn);

    top.appendChild(right);

    this.contentArea.appendChild(top);

    let h4 = $('h4');
    h4.textContent = 'Warnings and errors';
    bottom.appendChild(h4);

    const listView = $('.list-view.scrollable');
    let table, colgroup, tbody, tr, th, td;
    table = this.table = $('table'); colgroup = $('colgroup'); tbody = this.tbody = $('tbody');
    table.appendChild(colgroup);
    table.appendChild(tbody);

    // head
    tr = $('tr'); tbody.appendChild(tr);
    th = $('th'); th.innerHTML = 'Event'; tr.appendChild(th);
    th = $('th'); th.innerHTML = 'File'; tr.appendChild(th);
    th = $('th'); th.innerHTML = 'Error'; tr.appendChild(th);
    // th = $('th'); tr.appendChild(th);

    listView.appendChild(table);
    bottom.appendChild(listView);
    this.contentArea.appendChild(bottom);
  }

  clearExceptHead(container: HTMLElement) {
    while(container.lastChild) {
      if(container.firstChild !== container.lastChild)
        container.removeChild(container.lastChild);
      else
        break;
    }
  }

  open(from: string[], to: string[]): void {
    this.show();
    this.clearExceptHead(this.tbody);

    let retVal;
    for(let i = 0; i < from.length; i++) {
      this.fromSpan.textContent = from[i];
      this.toSpan.textContent = to[i];
      retVal = window.ipc.invoke('copy file', from[i], to[i]);
      window.ipc.invoke('copy file', from[i], to[i])
        .then(result => console.log(result))
        .catch(error => console.log(error));
    }
  }

}