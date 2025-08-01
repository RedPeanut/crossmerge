import path from "path";
import { StringUtil } from "../../common/util/StringUtil";
import { Dialog } from "../Dialog";
import { Popup } from "../Popup";
import { $ } from "../util/dom";
import { ProgressPopup } from "./ProgressPopup";

/** Emit events
 * ok:
 * folder selcted:
 */
export class CopyPopup extends Popup {

  srcPathInput: HTMLInputElement;
  dstPathInput: HTMLInputElement;
  table: HTMLElement;
  tbody: HTMLElement;

  progressPopup: ProgressPopup;
  dialog: Dialog;
  fileInfos: {}[];

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

    const head = $('.head');
    table = $('table'); colgroup = $('colgroup'); tbody = this.tbody = $('tbody');
    table.appendChild(colgroup);
    table.appendChild(tbody);
    tr = $('tr'); tbody.appendChild(tr);
    th = $('th'); th.innerHTML = 'Source'; tr.appendChild(th);
    th = $('th'); th.innerHTML = 'Destination'; tr.appendChild(th);
    th = $('th'); tr.appendChild(th);
    head.appendChild(table);

    const body = $('.body.scrollable');
    table = this.table = $('table'); colgroup = $('colgroup'); tbody = this.tbody = $('tbody');
    table.appendChild(colgroup);
    table.appendChild(tbody);
    body.appendChild(table);

    listView.appendChild(head);
    listView.appendChild(body);
    this.contentArea.appendChild(listView);

    const buttonArea = $('.button-area');
    const copyBtn = $('button');
    copyBtn.innerHTML = 'Copy';
    copyBtn.addEventListener('click', () => {
      this.emit('copy clicked');
      this.close();
    });
    const cancelBtn = $('button');
    cancelBtn.innerHTML = 'Cancel';
    cancelBtn.addEventListener('click', () => {
      this.close();
    });
    buttonArea.appendChild(copyBtn);
    buttonArea.appendChild(cancelBtn);

    this.contentArea.appendChild(buttonArea);

    this.progressPopup = new ProgressPopup(this.container);
    this.dialog = new Dialog(this.container);
  }

  clearExceptHead(container: HTMLElement) {
    while(container.lastChild) {
      if(container.firstChild !== container.lastChild)
        container.removeChild(container.lastChild);
      else
        break;
    }
  }

  open(srcPath: string, dstPath: string, files: { path: string, name: string }[]): void {
    this.srcPathInput.value = srcPath;
    this.dstPathInput.value = dstPath;
    this.fileInfos = [ ...files ];

    this.clearExceptHead(this.tbody);
    let tr, td, textContent;
    for(let i = 0; i < files.length; i++) {
      tr = $('tr');
      td = $('td'); td.textContent = files[i].name; tr.appendChild(td);
      td = $('td');
      if(!StringUtil.isEmpty(dstPath))
        textContent = dstPath + path.sep + files[i].path + path.sep + files[i].name;
      else
        textContent = files[i].path + path.sep + files[i].name;
      td.textContent = textContent;
      tr.appendChild(td);
      td = $('td'); tr.appendChild(td);
      this.tbody.appendChild(tr);
    }
    this.show();
  }

}