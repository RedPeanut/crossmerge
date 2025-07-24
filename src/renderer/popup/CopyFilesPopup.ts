import { Popup } from "../Popup";
import { $ } from "../util/dom";

export class CopyFilesPopup extends Popup {
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
    input = $('input');
    input.type = 'text';
    input.id = id;
    input.name = 'source_path';
    input.value = '';

    line.appendChild(label);
    line.appendChild(input);
    this.contentArea.appendChild(line);

    line = $('.line');
    id = 'destination_path';
    label = $('label');
    label.setAttribute('for', id);
    label.textContent = 'Destination path:';
    input = $('input');
    input.type = 'text';
    input.id = id;
    input.name = 'destination_path';
    input.value = '';

    line.appendChild(label);
    line.appendChild(input);
    this.contentArea.appendChild(line);

    const listView = $('.list-view');

    let table, colgroup, tbody, tr, th, td;

    table = $('table'); colgroup = $('colgroup'); tbody = $('tbody');
    table.appendChild(colgroup);
    table.appendChild(tbody);

    // head
    tr = $('tr'); tbody.appendChild(tr);
    th = $('th'); th.innerHTML = 'Source'; tr.appendChild(th);
    th = $('th'); th.innerHTML = 'Destination'; tr.appendChild(th);
    th = $('th'); tr.appendChild(th);

    // body
    tr = $('tr'); tbody.appendChild(tr);
    td = $('td'); tr.appendChild(td);
    td = $('td'); tr.appendChild(td);
    td = $('td'); tr.appendChild(td);

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