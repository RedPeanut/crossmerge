import { StringUtil } from "../../common/util/StringUtil";
import { Popup } from "../Popup";
import { $ } from "../util/dom";
import * as dom from "../util/dom";
import { FileDesc } from "../Types";
import { DirentExt, ResultMap } from "../../common/Types";
import { Dialog } from "../Dialog";
import { renderer } from "..";

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
  yesToAll: boolean;
  noToAll: boolean;

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

    const listView = $('.list-view');
    let table, colgroup, col, tbody, tr, th, td;

    const head = $('.head');
    table = $('table');
    colgroup = $('colgroup');
    col = $('col'); col.setAttribute('width', '40%'); colgroup.appendChild(col);
    col = $('col'); col.setAttribute('width', '40%'); colgroup.appendChild(col);
    col = $('col'); col.setAttribute('width', '20%'); colgroup.appendChild(col);

    tbody = $('tbody');
    table.appendChild(colgroup);
    table.appendChild(tbody);
    tr = $('tr'); tbody.appendChild(tr);
    th = $('th'); th.innerHTML = 'Event'; tr.appendChild(th);
    th = $('th'); th.innerHTML = 'File'; tr.appendChild(th);
    th = $('th'); th.innerHTML = 'Error'; tr.appendChild(th);
    head.appendChild(table);

    const body = $('.body.scrollable');
    table = this.table = $('table');
    colgroup = $('colgroup');
    col = $('col'); col.setAttribute('width', '40%'); colgroup.appendChild(col);
    col = $('col'); col.setAttribute('width', '40%'); colgroup.appendChild(col);
    col = $('col'); col.setAttribute('width', '20%'); colgroup.appendChild(col);
    tbody = this.tbody = $('tbody');
    table.appendChild(colgroup);
    table.appendChild(tbody);
    body.appendChild(table);

    listView.appendChild(head);
    listView.appendChild(body);
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
        _path += renderer.path.sep + file.relPath;
      _path += renderer.path.sep + file.name;
      const reads: DirentExt[] = await window.ipc.invoke('read folder', _path);
      const items: FileDesc[] = [];
      for(let i = 0; i < reads.length; i++) {
        items.push({
          type: reads[i].isDirectory ? 'folder' : 'file',
          name: reads[i].name,
          relPath: reads[i].path.replace(srcPath+renderer.path.sep, '')
        });
      }
      this.files.splice(this.index+1, 0, ...items);
      console.log('this.files =', this.files);
    } else {
      let from = srcPath;
      if(!StringUtil.isEmpty(file.relPath)) from += renderer.path.sep + file.relPath;
      from += renderer.path.sep + file.name;

      let to = dstPath;
      if(!StringUtil.isEmpty(file.relPath)) to += renderer.path.sep + file.relPath;
      to += renderer.path.sep + file.name;

      this.fromSpan.textContent = from;
      this.toSpan.textContent = to;

      const resultMap: ResultMap = await window.ipc.invoke('copy file', from, to, {});
      console.log('resultMap =', resultMap);
      if(resultMap.resultCode === '400') {

        let relPathName = file.relPath + renderer.path.sep + file.name;
        if(relPathName.startsWith('/')) relPathName = relPathName.substring(1);

        if(this.yesToAll) {
          await window.ipc.invoke('copy file', from, to, { overwrite: true, });
          if(this.index < this.files.length-1) {
            this.index++;
            this.next();
          } else {
            this.emit('finished');
          }
        } else if(this.noToAll) {
          this.addRow('warning', 'The existing file was not replaced', relPathName);
          if(this.index < this.files.length-1) {
            this.index++;
            this.next();
          } else {
            this.emit('finished');
          }
        } else {
          this.dialog.open(
            'warning',
            'Confirm replace',
            `A file being copied already exists.<br/><br/>
Would like to replace the existing file<br/><br/>
${from}<br/>
${resultMap.resultData.src.size} bytes modified: ${resultMap.resultData.src.mtime}<br/><br/>
with this file?<br/><br/>
${to}<br/>
${resultMap.resultData.dst.size} bytes modified: ${resultMap.resultData.dst.mtime}<br/>`,
            [
              {
                label: 'Yes',
                click: async () => {
                  await window.ipc.invoke('copy file', from, to, { overwrite: true, });
                  if(this.index < this.files.length-1) {
                    this.index++;
                    this.next();
                  } else {
                    this.emit('finished');
                  }
                }
              },
              {
                label: 'Yes to all',
                click: async () => {
                  this.yesToAll = true;
                  await window.ipc.invoke('copy file', from, to, { overwrite: true, });
                  if(this.index < this.files.length-1) {
                    this.index++;
                    this.next();
                  } else {
                    this.emit('finished');
                  }
                }
              },
              {
                label: 'No',
                click: () => {
                  this.addRow('error', 'The existing file was not replaced', relPathName);
                  if(this.index < this.files.length-1) {
                    this.index++;
                    this.next();
                  } else {
                    this.emit('finished');
                  }
                }
              },
              {
                label: 'No to all',
                click: () => {
                  this.noToAll = true;
                  this.addRow('warning', 'The existing file was not replaced', relPathName);
                  if(this.index < this.files.length-1) {
                    this.index++;
                    this.next();
                  }
                }
              },
              { label: 'Cancel',
                click: () => {
                }
              },
            ]
          );
        }

        return;
      }
    }

    if(this.index < this.files.length-1) {
      this.index++;
      this.next();
    } else {
      this.emit('finished');
    }
  }

  addRow(level, event, file) {
    let tr, td, span;
    tr = $('tr');
    td = $('td');
    span = $('span.level');
    span.classList.add(level);
    if(level === 'warning' || level === 'info') span.textContent = '!';
    else if(level === 'error') span.textContent = 'x';

    td.appendChild(span);
    td.innerHTML = td.innerHTML + event;
    tr.append(td);

    td = $('td');
    td.textContent = file;
    tr.append(td);

    td = $('td');
    td.textContent = ' ';
    tr.append(td);
    this.tbody.appendChild(tr);
  }

  open(srcPath: string, dstPath: string, files: FileDesc[]): void {

    this.yesToAll = false;
    this.noToAll = false;

    this.srcPath = srcPath;
    this.dstPath = dstPath;
    this.files = [ ...files ];

    // clear screen
    dom.clearContainer(this.tbody);
    this.show();

    this.index = 0;
    this.next();
  }

}