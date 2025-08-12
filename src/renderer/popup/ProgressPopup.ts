import path from "path";
import { StringUtil } from "../../common/util/StringUtil";
import { Popup } from "../Popup";
import { $ } from "../util/dom";
import { FileDesc } from "../Types";
import { DirentExt, ResultMap } from "../../common/Types";
import { Dialog } from "../Dialog";

/** Emit events
 * ok:
 */
export class ProgressPopup extends Popup {

  fromSpan: HTMLElement;
  toSpan: HTMLElement;
  table: HTMLElement;
  tbody: HTMLElement;

  srcPath: string;
  dstPath: string;
  files: FileDesc[];
  index: number;

  dialog: Dialog;

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

  async next(): Promise<void> {
    const srcPath = this.srcPath;
    const dstPath = this.dstPath;

    const file = this.files[this.index];
    if(file.type === 'folder') {
      let _path = srcPath;
      if(!StringUtil.isEmpty(file.relPath))
        _path += path.sep + file.relPath;
      _path += path.sep + file.name;
      const reads: DirentExt[] = await window.ipc.invoke('read folder', _path);
      const items: FileDesc[] = [];
      for(let i = 0; i < reads.length; i++) {
        items.push({
          type: reads[i].isDirectory ? 'folder' : 'file',
          name: reads[i].name,
          relPath: reads[i].path.replace(srcPath+path.sep, '')
        });
      }
      this.files.splice(this.index+1, 0, ...items);
      console.log('this.files =', this.files);
    } else {
      let from = srcPath;
      if(!StringUtil.isEmpty(file.relPath)) from += path.sep + file.relPath;
      from += path.sep + file.name;

      let to = dstPath;
      if(!StringUtil.isEmpty(file.relPath)) to += path.sep + file.relPath;
      to += path.sep + file.name;

      this.fromSpan.textContent = from;
      this.toSpan.textContent = to;

      const resultMap: ResultMap = await window.ipc.invoke('copy file', from, to, {});
      console.log('retVal =', resultMap);
      if(resultMap.resultCode === '400') {
      }
    }

    if(this.index < this.files.length-1) {
      this.index++;
      this.next();
    }
  }

  open(srcPath: string, dstPath: string, files: FileDesc[]): void {

    this.srcPath = srcPath;
    this.dstPath = dstPath;
    this.files = [ ...files ];

    // clear screen
    this.clearExceptHead(this.tbody);
    this.show();

    this.index = 0;
    this.next();
  }

}