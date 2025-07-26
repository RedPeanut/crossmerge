import { EventEmitter } from "events";
import { $ } from "./util/dom";

export interface ButtonDesc {
  label: string;
  click?: () => void;
}

export type DialogType = 'info' | 'error' | 'warning';

export interface DialogResult {
  button: number;
  values?: string[];
}

export interface DialogOptions {
  // type: 'info' | 'error' | 'warning';
}

export class Dialog extends EventEmitter {
  container: HTMLElement;
  dialog: HTMLElement;
  options: DialogOptions;
  titlebar: HTMLElement;
  title: HTMLElement;
  contentArea: HTMLElement;

  constructor(parent: HTMLElement,
      type: DialogType = 'info',
      title: string = 'enter title in here',
      message: string = 'Lorem ipsum dolor sit amet\nLorem ipsum dolor sit amet\nLorem ipsum dolor sit amet\nLorem ipsum dolor sit amet\nLorem ipsum dolor sit amet',
      buttons: ButtonDesc[] = [ { label: 'Yes' }, { label: 'No' }, { label: 'Cancel' } ],
      options: DialogOptions = {}
  ) {
    super();
    this.options = options;

    const container = this.container = $('.dialog-container');
    container.style.display = 'none';
    const dialog = this.dialog = $('.dialog');
    const titlebar = this.titlebar = $('.titlebar');
    const _title = this.title = $('span.title');
    this.title.innerHTML = title;
    titlebar.appendChild(_title);
    const closeBtn = $('a.codicon.codicon-chrome-close.close');
    closeBtn.addEventListener('click', async () => {
      this.close();
    });
    titlebar.appendChild(closeBtn);
    dialog.appendChild(titlebar);

    const contentArea = this.contentArea = $('.content-area');
    const body = $('.body');
    const icon = $(`.icon.${type}`);
    const span = $(`span.codicon.codicon-${type}`);
    icon.appendChild(span);
    const _message = $('.message');
    _message.textContent = message;
    body.appendChild(icon);
    body.appendChild(_message);
    contentArea.appendChild(body);

    const _buttons = $('.buttons');
    let button;
    for(let i = 0; i < buttons.length; i++) {
      button = $('button');
      button.textContent = buttons[i].label;
      if(buttons[i].click) button.addEventListener('click', buttons[i].click);
      _buttons.appendChild(button);
    }
    contentArea.appendChild(_buttons);

    dialog.appendChild(contentArea);
    container.appendChild(dialog);
    parent.appendChild(container);
  }

  show(): void {
    this.container.style.display = 'block';
    /* return new Promise<DialogResult>((resolve) => {
      resolve({
        button: 0,
        values: []
      });
    }); */
  }

  close(): void {
    this.container.style.display = 'none';
  }
}