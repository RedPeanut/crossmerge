import { renderer } from "..";
import { DirentExt } from "../../common/Types";
import * as dom from "../util/dom";
import { $ } from "../util/dom";
import { DebouncedFunc } from "lodash";
import _ from "lodash";
import { SimpleFocusManager } from "../util/SimpleFocusManager";
import { ComplexFocusManager } from "../util/ComplexFocusManager";

export interface InputOptions {
  mode: 'file' | 'folder';
}

export class Input {

  parent: HTMLElement;
  element: HTMLElement;
  input: HTMLInputElement;
  mark: HTMLElement;
  related: HTMLElement;
  options: InputOptions;

  constructor(parent: HTMLElement, focusManager: SimpleFocusManager | ComplexFocusManager, options: InputOptions) {
    this.parent = parent;
    this.options = options;

    const el = this.element = $('.input');
    const input = this.input = $('input');
    focusManager.register(input, (...args: any[]) => {
      // console.log(typeof args);
      const [ event ] = args;
      if(event === 'focusout') {
        this.related.style.display = 'none';
      }
    });

    const mark = this.mark = $('.mark');
    const span = $('span.codicon.codicon-circle-filled');
    mark.appendChild(span);

    const related = this.related = $('ul.related.scrollable');
    related.tabIndex = -1;
    // related.style.display = 'none';

    function keyDownHandler(e: KeyboardEvent) {
      // console.log('keydown handler is called ..');
      // console.log('e.keyCode =', e.keyCode);
      // console.log('e.key =', e.key);

      if(e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if(this.element.classList.contains('have-related')) {
          // console.log(this.related.children);
          let b: boolean = false, i = 0;
          for(; i < this.related.children.length; i++) {
            if(this.related.children[i].classList.contains('on')) {
              b = true; break;
            }
          }

          if(e.key === 'ArrowDown') {
            let before, after: HTMLElement;
            if(b) {
              if(i !== this.related.children.length-1) {
                this.related.children[i].classList.remove('on');
                after = this.related.children[++i];
                after.classList.add('on');
                // console.log(this.related.children[i].firstChild.innerHTML);
                this.input.value = (after.firstChild as HTMLElement).innerHTML;
              }
            } else {
              after = this.related.children[0];
              after.classList.add('on');
              this.input.value = (after.firstChild as HTMLElement).innerHTML;
            }

            if(after) {
              if(after.offsetTop + after.clientHeight > this.related.clientHeight)
                this.related.scrollTop = after.offsetTop + after.clientHeight - this.related.clientHeight;
            }

          } else if(e.key === 'ArrowUp') {
            if(b) {
              let before, after: HTMLElement;
              if(i !== 0) {
                this.related.children[i].classList.remove('on');
                after = this.related.children[--i];
                after.classList.add('on');
                this.input.value = (after.firstChild as HTMLElement).innerHTML;

                // set cursor to last
                const length = this.input.value.length;
                // console.log('length =', length);
                this.input.focus();
                this.input.setSelectionRange(length, length);

                if(after) {
                  if(after.offsetTop < this.related.scrollTop)
                    this.related.scrollTop = after.offsetTop;
                }
              }
            } else {
              // this.related.children[0].classList.add('on');
            }

            // return false; // x
            // return true; // x
            // e.stopPropagation(); // x
            e.preventDefault();
          }
        }
      } else if(e.key === 'Escape') {
        this.related.style.display = 'none';
      }

      // TODO: auto completion
      // check every keyboard's capable char
      // TODO: capture paste event, arrow event?

      /* if(
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
      } */
    }

    function inputHandler(e: Event) {
      // console.log('input handler is called ..');
      // const self = this;
      const target = e.target as HTMLInputElement;
      const value: string = target.value;

      window.ipc.invoke('read folder in input', value, this.options.mode)
        .then((result: DirentExt[]) => {
          // console.log('result =', result);

          // draw auto completion
          // const related: HTMLElement = this.related;
          // console.log('this.related =', this.related);
          // console.log('self.related =', self.related);
          dom.clearContainer(this.related);

          for(let i = 0; i < result.length; i++) {
            const item = result[i];
            const li = $('li');
            if(i % 2 === 1)
              li.style.backgroundColor = 'rgb(241,241,241)';
            const a = $('a');
            const innerHTML = item.path + renderer.path.sep + item.name;
            a.innerHTML = innerHTML;
            a.addEventListener('click', (e: MouseEvent) => {
              for(let i = 0; i < this.related.children.length; i++) {
                if(this.related.children[i] !== li)
                  this.related.children[i].classList.remove('on');
              }
              li.classList.add('on');
              this.input.value = innerHTML;
              this.input.focus();
            });
            li.append(a);
            this.related.appendChild(li);
          }

          if(result.length > 0) {
            this.element.classList.add('have-related');
            this.related.style.display = 'block';
          } else
            this.element.classList.remove('have-related');
        })
        .catch(error => { console.log(error); });
    }

    input.addEventListener('keydown', keyDownHandler.bind(this));
    input.addEventListener('input', inputHandler.bind(this));
    /* input.addEventListener('focus', (e: FocusEvent) => {
      console.log('focus is called ..');
    });
    input.addEventListener('focusout', (e: FocusEvent) => {
      // console.log('focusout is called ..');
      this.related.style.display = 'none';
    }); */

    /* window.addEventListener('mousedown', (e) => {
      console.log('mousedown is called ..');
    }); */

    el.appendChild(input);
    el.appendChild(mark);
    el.appendChild(related);
    parent.appendChild(el);
  }

  setPlaceholder(value: string): void {
    this.input.placeholder = value;
  }

  getValue(): string {
    return this.input.value;
  }

  setValue(value: string): void {
    this.input.value = value;
  }

  addEventListener(event, handler): void {
    this.input.addEventListener(event, handler);
  }

  setChanged(): void {
    this.mark.style.display = 'flex';
  }
  clearChanged(): void {
    this.mark.style.display = 'none';
  }
}