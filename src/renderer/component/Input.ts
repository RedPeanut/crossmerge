import path from "path";
import { DirentExt } from "../../main/Types";
import * as dom from "../util/dom";
import { $ } from "../util/dom";
import { DebouncedFunc } from "lodash";
import _ from "lodash";

export interface InputOptions {}

export class Input {

  parent: HTMLElement;
  element: HTMLElement;
  input: HTMLInputElement;
  related: HTMLElement;

  constructor(parent: HTMLElement) {
    this.parent = parent;
    const el = this.element = $('.input');
    const input = this.input = $('input');
    const related = this.related = $('ul.related.scrollable');
    // related.style.display = 'none';

    function keyDownHandler(e: KeyboardEvent) {
      // console.log('keydown handler is called ..');
      console.log('e.keyCode =', e.keyCode);
      console.log('e.key =', e.key);

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

                if(after) {
                  if(after.offsetTop < this.related.scrollTop)
                    this.related.scrollTop = after.offsetTop;
                }
              }
            } else {
              // this.related.children[0].classList.add('on');
            }
          }
        }
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
      console.log('input handler is called ..');
      // const self = this;
      const target = e.target as HTMLInputElement;
      const value: string = target.value;

      window.ipc.invoke('read folder in input', value, 'folder')
        .then((result: DirentExt[]) => {
          console.log('result =', result);

          // draw auto completion
          // const related: HTMLElement = this.related;
          console.log('this.related =', this.related);
          // console.log('self.related =', self.related);
          dom.clearContainer(this.related);

          for(let i = 0; i < result.length; i++) {
            const item = result[i];
            const li = $('li');
            if(i % 2 === 1)
              li.style.backgroundColor = 'rgb(241,241,241)';
            const a = $('a');
            a.innerHTML = item.path + path.sep + item.name;
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
    input.addEventListener('focusout', (e: KeyboardEvent) => {
      console.log('focusout is called ..');
      this.related.style.display = 'none';
    });

    /* window.addEventListener('mousedown', (e) => {
      console.log('mousedown is called ..');
    }); */

    el.appendChild(input);
    el.appendChild(related);
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