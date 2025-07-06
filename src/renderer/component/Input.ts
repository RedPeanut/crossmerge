import { $ } from "../util/dom";

export interface InputOptions {}

export class Input {

  parent: HTMLElement;
  element: HTMLElement;
  input: HTMLInputElement;
  suggest: HTMLElement;

  constructor(parent: HTMLElement) {
    this.parent = parent;
    const el = this.element = $('.input');
    const input = this.input = $('input');
    const suggest = this.suggest = $('.suggest');
    suggest.style.display = 'none';

    function inputKeyDownHandler(e: KeyboardEvent) {
      // console.log('keydown event is called ..');
      console.log('e.keyCode =', e.keyCode);

      // TODO: auto completion
      // check every keyboard's capable char
      // TODO: capture paste event, arrow event?

      if(
        (e.keyCode === 8 || e.keyCode === 46) // backspace
        || (33 <= e.keyCode && e.keyCode <= 41) // !"#$%&'()
        || (42 <= e.keyCode && e.keyCode <= 47) // *+,-./
        || (48 <= e.keyCode && e.keyCode <= 57) // 0-9
        || (65 <= e.keyCode && e.keyCode <= 90) // A-Z
        || (97 <= e.keyCode && e.keyCode <= 122) // a-z
        || e.keyCode == 92 || e.keyCode == 95 // \_
      ) {
        const value: string = this.input.value;
        // value.lastIndexOf(path.Separator);
        window.ipc.invoke('read folder in input', value, 'folder')
        .then(result => {
          console.log('result =', result);
        })
        .catch(error => {});
      }
    }

    input.addEventListener('keydown', inputKeyDownHandler.bind(this));

    el.appendChild(input);
    el.appendChild(suggest);
    parent.appendChild(el);
  }

  placeholder(value: string): void {
    this.input.placeholder = value;
  }

  value(value?: string): void | string {
    if(arguments.length)
      this.input.value = value;
    else
      return this.input.value;
  }

  addEventListener(event, handler) {
    this.input.addEventListener(event, handler);
  }

}