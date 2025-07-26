import { StringUtil } from "../../common/util/StringUtil";
import { Popup } from "../Popup";
import { $ } from "../util/dom";

/** Emit events
 * ok:
 * folder selcted:
 */
export class CopyFilesPopup extends Popup {

  srcPathInput: HTMLInputElement;
  dstPathInput: HTMLInputElement;
  table: HTMLElement;
  tbody: HTMLElement;

  constructor(parent: HTMLElement) {
    super(parent);
    this.title.innerHTML = 'Copy files';

    this.contentArea.classList.add('cf'); // abbr. copy files

    // label, input, label, input
    // list
    // button

    let line;
    let label, input, id;

    line = $('.line');
    id = 'source_path';
    label = $('label');
    label.setAttribute('for', id);
    label.textContent = 'Source path:';
    input = this.srcPathInput = $('input');
    input.type = 'text';
    input.id = id;
    input.name = 'source_path';
    input.value = '';
    input.setAttribute('readonly', true);

    line.appendChild(label);
    line.appendChild(input);
    this.contentArea.appendChild(line);

    line = $('.line');
    id = 'destination_path';
    label = $('label');
    label.setAttribute('for', id);
    label.textContent = 'Destination path:';
    input = this.dstPathInput = $('input');
    input.type = 'text';
    input.id = id;
    input.name = 'destination_path';
    input.value = '';

    line.appendChild(label);
    line.appendChild(input);

    const a = $('a.codicon.codicon-ellipsis');
    a.addEventListener('click', async () =>  {
      const selectedFolderPaths = await window.ipc.invoke('picker folder');
      // console.log('selectedFolderPaths =', selectedFolderPaths);
      this.dstPathInput.value = StringUtil.fixNull(selectedFolderPaths);
      this.emit('folder selected');
    });
    line.appendChild(a);

    this.contentArea.appendChild(line);

    const listView = $('.list-view');

    let table, colgroup, tbody, tr, th, td;

    table = this.table = $('table'); colgroup = $('colgroup'); tbody = this.tbody = $('tbody');
    table.appendChild(colgroup);
    table.appendChild(tbody);

    // head
    tr = $('tr'); tbody.appendChild(tr);
    th = $('th'); th.innerHTML = 'Source'; tr.appendChild(th);
    th = $('th'); th.innerHTML = 'Destination'; tr.appendChild(th);
    th = $('th'); tr.appendChild(th);

    // body
    /* tr = $('tr'); tbody.appendChild(tr);
    td = $('td'); tr.appendChild(td);
    td = $('td'); tr.appendChild(td);
    td = $('td'); tr.appendChild(td); */

    listView.appendChild(table);
    this.contentArea.appendChild(listView);

    const buttonArea = $('.button-area');
    const okBtn = $('button');
    okBtn.innerHTML = 'Ok';
    okBtn.addEventListener('click', () => {
      this.emit('ok');
      this.close();
    });
    const cancelBtn = $('button');
    cancelBtn.innerHTML = 'Cancel';
    cancelBtn.addEventListener('click', () => {
      this.close();
    });
    buttonArea.appendChild(okBtn);
    buttonArea.appendChild(cancelBtn);

    this.contentArea.appendChild(buttonArea);
  }
}