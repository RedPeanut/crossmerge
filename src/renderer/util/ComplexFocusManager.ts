import CodeMirror from "codemirror";

interface ComplexItem { what: HTMLElement | CodeMirror.EditorFromTextArea, cb: (...args: any[]) => void }

/**
 * FocusManager for FileView: handle editor focus event
 */
export class ComplexFocusManager {

  list: ComplexItem[] = [];

  register(what: HTMLElement | CodeMirror.EditorFromTextArea, cb: (...args: any[]) => void = null): void {
    this.list.push({what, cb});

    // console.log('typeof what =', typeof what); // all is object
    // console.log('what instanceof CodeMirror.fromTextArea =', what instanceof CodeMirror.fromTextArea); // false
    // console.log('what instanceof CodeMirror.Editor =', what instanceof CodeMirror.Editor); // Property 'Editor' does not exist on type
    // console.log('what instanceof CodeMirror =', what instanceof CodeMirror); // o

    if(what instanceof HTMLElement) {
      what.addEventListener('focus', (e: FocusEvent) => {
        // console.log('args =', args);
        for(let i = 0; i < this.list.length; i++) {
          const item: ComplexItem = this.list[i];
          if(item.what instanceof HTMLElement) {
            if(item.what === e.currentTarget) {
              (e.currentTarget as HTMLElement).classList.add('focus');
              if(item.cb) item.cb('focus');
            } else {
              (item.what as HTMLElement).classList.remove('focus');
              if(item.cb) item.cb('focusout');
            }
          } else if(item.what instanceof CodeMirror) {
            item.what.getWrapperElement().classList.remove('focus');
            if(item.cb) item.cb('focusout');
          }
        }
      });
    } else if(what instanceof CodeMirror) {
      what.on('focus', (instance: CodeMirror.Editor, event: FocusEvent) => {
        // console.log('focus event is called ..');
        for(let i = 0; i < this.list.length; i++) {
          const item: ComplexItem = this.list[i];
          if(item.what instanceof HTMLElement) {
            (item.what as HTMLElement).classList.remove('focus');
            if(item.cb) item.cb('focusout');
          } else if(item.what instanceof CodeMirror) {
            if(item.what === instance) {
              item.what.getWrapperElement().classList.add('focus');
              if(item.cb) item.cb('focus');
            } else {
              item.what.getWrapperElement().classList.remove('focus');
              if(item.cb) item.cb('focusout');
            }
          }
        }
      });
    }
  }

  unregister(what: HTMLElement | CodeMirror.EditorFromTextArea): void {
    for(let i = 0; i < this.list.length; i++) {
      if(this.list[i].what === what) {
        this.list.splice(i, 1);
        // console.log('successfully unregistered!!');
        break;
      }
    }
  }
}