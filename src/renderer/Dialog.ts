import { EventEmitter } from "events";
import { $ } from "./util/dom";
import * as dom from "./util/dom";
import { Disposable } from "./util/Lifecycle";

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

export class Dialog extends Disposable {
  container: HTMLElement;
  dialog: HTMLElement;
  options: DialogOptions;
  titlebar: HTMLElement;
  title: HTMLElement;
  contentArea: HTMLElement;
  icon: HTMLElement;
  message: HTMLElement;
  buttons: HTMLElement;

  constructor(parent: HTMLElement,
      type: DialogType = 'info',
      options: DialogOptions = {}
  ) {
    super();
    this.options = options;

    const container = this.container = $('.dialog-container');
    container.style.display = 'none';
    const dialog = this.dialog = $('.dialog');
    const titlebar = this.titlebar = $('.titlebar');
    const _title = this.title = $('span.title');
    titlebar.appendChild(_title);
    const closeBtn = $('a.codicon.codicon-chrome-close.close');
    closeBtn.addEventListener('click', async () => {
      dom.clearContainer(this.buttons);
      this.dispose();
      this.close();
    });
    titlebar.appendChild(closeBtn);
    dialog.appendChild(titlebar);

    const contentArea = this.contentArea = $('.content-area');
    const body = $('.body');
    const icon = this.icon = $(`.icon.${type}`);
    const span = $(`span.codicon.codicon-${type}`);
    icon.appendChild(span);
    const _message = this.message = $('.message');
    body.appendChild(icon);
    body.appendChild(_message);
    contentArea.appendChild(body);

    const _buttons = this.buttons = $('.buttons');
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

  open(
    type: DialogType = 'info',
    title: string = 'enter title in here',
    message: string = 'Lorem ipsum dolor sit amet<br/>Lorem ipsum dolor sit amet<br/>Lorem ipsum dolor sit amet<br/>Lorem ipsum dolor sit amet<br/>Lorem ipsum dolor sit amet',
    buttons: ButtonDesc[] = [ { label: 'Yes' }, { label: 'No' }, { label: 'Cancel' } ],
    options: DialogOptions = {}
  ): void {
    this.title.innerHTML = title;
    this.icon.classList.remove(...['info', 'error', 'warning']);
    this.icon.classList.add(type);
    this.icon.children[0].classList.remove(...['codicon-info', 'codicon-error', 'codicon-warning']);
    this.icon.children[0].classList.add(`codicon-${type}`);
    this.message.innerHTML = message;

    let button;
    for(let i = 0; i < buttons.length; i++) {
      button = $('button');
      button.textContent = buttons[i].label;
      if(buttons[i].click) {

        function clickWrapper() {
          dom.clearContainer(this.buttons);
          this.dispose();
          this.close();
          buttons[i].click();
        }

        this.register(button, 'click', clickWrapper.bind(this));
      }
      this.buttons.appendChild(button);
    }

    this.show();
  }
}