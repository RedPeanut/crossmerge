import { Popup } from "../Popup";
import { $ } from "../util/dom";

export class SelectPopup extends Popup {
  constructor(parent: HTMLElement) {
    super(parent);
    this.title.innerHTML = 'Select files and folders';

    this.contentArea.classList.add('sbs'); // abbr. select by state

    const top = $('.top');
    const middle = $('.middle');
    const bottom = $('.bottom');

    const desc = $('p.desc');
    desc.innerHTML = 'Rows that contains a file or folder whose state matched a checked item in the lists below will be selected.';
    this.contentArea.appendChild(desc);

    const leftArea = $('.left-area.list-view');

    // let listView = $('.list-view');
    let table, colgroup, tbody, tr, th, td;
    let checkbox, label, id;

    table = $('table'); colgroup = $('colgroup'); tbody = $('tbody');
    table.appendChild(colgroup);
    table.appendChild(tbody);

    // head
    tr = $('tr'); tbody.appendChild(tr);
    th = $('th'); th.innerHTML = 'Left'; tr.appendChild(th);
    th = $('th'); tr.appendChild(th);

    // body
    tr = $('tr'); tbody.appendChild(tr);
    td = $('td');
    checkbox = $('input');
    checkbox.type = 'checkbox';
    id = 'chkboxLeft_changed';
    checkbox.id = id;
    checkbox.name = 'chkboxLeft';
    checkbox.value = 'changed';
    label = $('label');
    label.setAttribute('for', id);
    label.innerHTML = 'Changed';
    td.appendChild(checkbox);
    td.appendChild(label);
    tr.appendChild(td);
    td = $('td'); tr.appendChild(td);

    tr = $('tr'); tbody.appendChild(tr);
    td = $('td');
    checkbox = $('input');
    checkbox.type = 'checkbox';
    id = 'chkboxLeft_removed';
    checkbox.id = id;
    checkbox.name = 'chkboxLeft';
    checkbox.value = 'removed';
    // checkbox.setAttribute('checked', true);
    label = $('label');
    label.setAttribute('for', id);
    label.innerHTML = 'Removed';
    td.appendChild(checkbox);
    td.appendChild(label);
    tr.appendChild(td);
    td = $('td'); tr.appendChild(td);

    leftArea.appendChild(table);


    const rightArea = $('.right-area.list-view');
    table = $('table'); colgroup = $('colgroup'); tbody = $('tbody');
    table.appendChild(colgroup);
    table.appendChild(tbody);

    // head
    tr = $('tr'); tbody.appendChild(tr);
    th = $('th'); th.innerHTML = 'Right'; tr.appendChild(th);
    th = $('th'); tr.appendChild(th);

    // body
    tr = $('tr'); tbody.appendChild(tr);
    td = $('td');
    checkbox = $('input');
    checkbox.type = 'checkbox';
    id = 'chkboxRight_changed';
    checkbox.id = id;
    checkbox.name = 'chkboxRight';
    checkbox.value = 'changed';
    checkbox.setAttribute('checked', true);
    label = $('label');
    label.setAttribute('for', id);
    label.innerHTML = 'Changed';
    td.appendChild(checkbox);
    td.appendChild(label);
    tr.appendChild(td);
    td = $('td'); tr.appendChild(td);

    tr = $('tr'); tbody.appendChild(tr);
    td = $('td');
    checkbox = $('input');
    checkbox.type = 'checkbox';
    id = 'chkboxRight_inserted';
    checkbox.id = id;
    checkbox.name = 'chkboxRight';
    checkbox.value = 'inserted';
    checkbox.setAttribute('checked', true);
    label = $('label');
    label.setAttribute('for', id);
    label.innerHTML = 'Inserted';
    td.appendChild(checkbox);
    td.appendChild(label);
    tr.appendChild(td);
    td = $('td'); tr.appendChild(td);

    rightArea.appendChild(table);


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

    middle.appendChild(leftArea);
    middle.appendChild(rightArea);
    middle.appendChild(buttonArea);

    this.contentArea.appendChild(middle);


    let radio; //, label;
    radio = $('input');
    radio.type = 'radio';
    id = 'rdoType_add';
    radio.id = id;
    radio.name = 'rdoType';
    radio.value = 'add';
    label = $('label');
    label.setAttribute('for', id);
    label.textContent = 'Add to current Selection';
    bottom.appendChild(radio);
    bottom.appendChild(label);

    radio = $('input');
    radio.type = 'radio';
    id = 'rdoType_replace';
    radio.id = id;
    radio.name = 'rdoType';
    radio.value = 'replace';
    radio.setAttribute('checked', true);
    label = $('label');
    label.setAttribute('for', id);
    label.textContent = 'Replace current Selection';
    bottom.appendChild(radio);
    bottom.appendChild(label);

    this.contentArea.appendChild(bottom);
  }

  /* createContentArea(): void {
    this.contentArea.appendChild(null);
  } */
}