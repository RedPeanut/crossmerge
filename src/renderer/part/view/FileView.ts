import { Input } from "../../component/Input";
import { CompareFileData, CompareItem,
  fileSaveLeftMenuId, fileSaveRightMenuId, fileSaveAllMenuId, // file
  editPrevChangeMenuId, editNextChangeMenuId, // edit
  pushToLeftMenuId, pushToRightMenuId, // merging
  toggleWrapLinesMenuId, // view
} from "../../../common/Types";
import Mergely from "../../../lib/mergely/Mergely";
import { CompareOptions, CompareView } from "../../Types";
import { $ } from "../../util/dom";
import { ComplexFocusManager } from "../../util/ComplexFocusManager";
import { BodyLayoutService } from "../../layout/BodyLayout";
import { getService, bodyLayoutServiceId, statusbarPartServiceId, mainLayoutServiceId } from "../../Service";
import { renderer } from "../..";
import { StatusbarPartService } from "../StatusbarPart";
import { Change } from "../../../lib/mergely/Types";
import { broadcast } from "../../Broadcast";
import { listenerManager } from "../../util/ListenerManager";
import { Channels } from "../../../main/preload";
import { Editor } from "../../../types/codemirror";
import { MainLayoutService } from "../../layout/MainLayout";

export interface FileViewOptions {}

export class FileView implements CompareView {

  parent: HTMLElement;
  element: HTMLElement;
  item: CompareItem;

  // input_lhs: HTMLInputElement;
  // input_rhs: HTMLInputElement;
  input_lhs: Input;
  input_rhs: Input;

  mergely_el: HTMLElement;
  mergely: Mergely;

  focusManager: ComplexFocusManager;

  broadcastListeners: [ event: string, handler: () => void ][] = [];
  ipcRemoveListeners: any[] = [];

  constructor(parent: HTMLElement, item: CompareItem) {
    this.parent = parent;
    this.item = item;

    /* window.ipc.on('read file data', (...args: any[]) => {
      // console.log('on compare folder data is called ..');
      // console.log('args =', args);
      if(!args || args.length <= 1) return;

      const arg = args[1];
      if(this.item.uid != arg.uid) return;

      this.recvReadData(arg);
    }); */

    // listenerManager.register(this, broadcast, 'menu click', this.menuClickHandler.bind(this));
    // listenerManager.register(this, window.ipc, 'menu click', this.menuClickHandler.bind(this));
    this.bind_b('menu click', this.menuClickHandler.bind(this));
    this.bind_i('menu click', this.menuClickHandler.bind(this));

    this.focusManager = new ComplexFocusManager();
  }

  bind_b(event: string, handler: () => void): void {
    this.broadcastListeners.push([ event, handler ]);
    broadcast.addListener(event, handler);
  }

  unbind_b(): void {
    console.log('this.broadcastListeners.length =', this.broadcastListeners.length);
    for(const [ event, handler ] of this.broadcastListeners) {
      broadcast.removeListener(event, handler);
      console.log(`'${event}' event listener remains in broadcast: ${broadcast.listenerCount(event)}`);
    }
  }

  bind_i(event: string, handler: any): void {
    const removeListener = window.ipc.on(event as Channels, handler);
    this.ipcRemoveListeners.push(removeListener);
  }

  unbind_i(): void {
    for(let i = 0; i < this.ipcRemoveListeners.length; i++) {
      this.ipcRemoveListeners[i]();
    }

    const event = 'menu click';
    // console.log(`'${event}' event listener remains in ipc: ${window.ipc.listenerCount(event)}`);
  }

  menuClickHandler(...args: any[]): void {
    if(args && args.length > 1
      && this.element.classList.contains('active')
    ) {
      // console.log('args =', args);
      const id = args[1];

      if(id.startsWith('file')) {
        if(id === fileSaveLeftMenuId) {
          if(!this.input_lhs.getChanged()) return;

          const path = this.input_lhs.getValue();
          const contents = this.mergely.get('lhs');
          window.ipc.invoke('save file', path, contents).then((result) => {
            // clear modified mark
            this.input_lhs.clearChanged();
            this.mergely.clearHistory('lhs');

            // const ohistorySize = this.mergely.getHistory('rhs');
            const ohistorySize = this.mergely.cm('rhs').historySize();
            console.log(ohistorySize);

            const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
            if(ohistorySize.undo > 0)
              bodyLayoutService.callTabFn(this.item.uid, 'setChanged');
            else
              bodyLayoutService.callTabFn(this.item.uid, 'clearChanged');
          });
        } else if(id === fileSaveRightMenuId) {
          if(!this.input_rhs.getChanged()) return;

          const path = this.input_rhs.getValue();
          const contents = this.mergely.get('rhs');
          window.ipc.invoke('save file', path, contents).then((result) => {
            // clear modified mark
            this.input_rhs.clearChanged();
            this.mergely.clearHistory('rhs');

            // const ohistorySize = this.mergely.getHistory('lhs');
            const ohistorySize = this.mergely.cm('lhs').historySize();
            console.log(ohistorySize);

            const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
            if(ohistorySize.undo > 0)
              bodyLayoutService.callTabFn(this.item.uid, 'setChanged');
            else
              bodyLayoutService.callTabFn(this.item.uid, 'clearChanged');
          });
        } else if(id === fileSaveAllMenuId) {
          if(!this.input_lhs.getChanged() && !this.input_rhs.getChanged()) return;

          const path_lhs = this.input_lhs.getValue();
          const contents_lhs = this.mergely.get('lhs');
          window.ipc.invoke('save file', path_lhs, contents_lhs).then((result) => {
            // clear modified mark
            this.input_lhs.clearChanged();
            this.mergely.clearHistory('lhs');
          });

          const path_rhs = this.input_rhs.getValue();
          const contents_rhs = this.mergely.get('rhs');
          window.ipc.invoke('save file', path_rhs, contents_rhs).then((result) => {
            // clear modified mark
            this.input_rhs.clearChanged();
            this.mergely.clearHistory('rhs');
          });

          const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
          bodyLayoutService.callTabFn(this.item.uid, 'clearChanged');
        }
      } else if(id.startsWith('edit')) {
        if(id === editPrevChangeMenuId) {
          this.mergely.scrollToDiffByPos('prev');
        } else if(id === editNextChangeMenuId) {
          this.mergely.scrollToDiffByPos('next');
        }
      }/*  else if(id.startsWith('merging')) {
        if(id === pushToLeftMenuId) {
          this.mergely.mergeChangeByPos('rhs', 'lhs');
        } else if(id === pushToRightMenuId) {
          this.mergely.mergeChangeByPos('lhs', 'rhs');
        }
      } */else if(id.startsWith('view')) {
        if(id === toggleWrapLinesMenuId) {
          // const toggled = renderer.wrapLine = !renderer.wrapLine;
          window.ipc.invoke('config get', 'wrap_lines').then((v) => {
            const toggled = !v;
            this.mergely.options({ wrap_lines: toggled });
            window.ipc.invoke('config update', { wrap_lines: toggled });
          });
        }
      }
    }
  }

  create(): HTMLElement {
    const el = this.element = $('.file-compare-view');

    const inputs = $(".inputs");
    const input_column_lhs = $(".input-column.lhs");
    // const input_lhs = this.input_lhs = $('input.lhs') as HTMLInputElement;
    // input_lhs.placeholder = 'Left file';
    const input_lhs = this.input_lhs = new Input(input_column_lhs, this.focusManager, { mode: 'file' });
    input_lhs.setPlaceholder('Left file');

    const input_margin = $(".input-margin");
    const input_column_rhs = $(".input-column.rhs");
    // const input_rhs = this.input_rhs = $('input.rhs') as HTMLInputElement;
    // input_rhs.placeholder = 'Right file';
    const input_rhs = this.input_rhs = new Input(input_column_rhs, this.focusManager, { mode: 'file' });
    input_rhs.setPlaceholder('Right file');

    // input_lhs.setValue('/Users/kimjk/workspace/electron/fixture/one single diff file/left/moons.txt');
    // input_rhs.setValue('/Users/kimjk/workspace/electron/fixture/one single diff file/right/moons.txt');
    // input_lhs.setValue('/Users/kimjk/workspace/electron/fixture/mixed case/left/b/ba/baa.txt');
    // input_rhs.setValue('/Users/kimjk/workspace/electron/fixture/mixed case/right/b/ba/baa.txt');
    input_lhs.setValue('/Users/kimjk/workspace/electron/fixture/mixed case/left/b/ba.txt');
    input_rhs.setValue('/Users/kimjk/workspace/electron/fixture/mixed case/right/b/ba.txt');
    // input_lhs.setValue(this.item.path_lhs);
    // input_rhs.setValue(this.item.path_rhs);

    input_lhs.addEventListener('keypress', this.inputKeyPressHandler.bind(this));
    input_rhs.addEventListener('keypress', this.inputKeyPressHandler.bind(this));

    // input_column_lhs.appendChild(input_lhs);
    inputs.appendChild(input_column_lhs);
    inputs.appendChild(input_margin);
    // input_column_rhs.appendChild(input_rhs);
    inputs.appendChild(input_column_rhs);

    /* const suggests = $(".suggests");
    suggests.style.display = 'none';
    const suggest_column_lhs = $(".suggest-column.lhs");
    const suggest_margin = $(".suggest-margin");
    const suggest_column_rhs = $(".suggest-column.rhs");
    suggests.appendChild(suggest_column_lhs);
    suggests.appendChild(suggest_margin);
    suggests.appendChild(suggest_column_rhs); */

    // const mergely_el = this.mergely_el = $('.mergely');
    // // mergely.id = 'mergely';
    // mergely_el.id = `_${renderer.idx++}`;
    // // mergely.style.height = '740px';

    el.appendChild(inputs);
    // el.appendChild(suggests);
    // el.appendChild(mergely_el);
    return el;
  }

  inputKeyPressHandler(e: KeyboardEvent) {
    // console.log('keypress event is called ..');
    // console.log('e.keyCode =', e.keyCode);

    if(e.keyCode == 13) {
      // launch comparison
      this.compare();
      return;
    }

    // check every keyboard's capable char
    // TODO: capture paste event, arrow event?
    if(
      (33 <= e.keyCode && e.keyCode <= 41) // !"#$%&'()
      || (42 <= e.keyCode && e.keyCode <= 47) // *+,-./
      || (48 <= e.keyCode && e.keyCode <= 57) // 0-9
      || (65 <= e.keyCode && e.keyCode <= 90) // A-Z
      || (97 <= e.keyCode && e.keyCode <= 122) // a-z
      || e.keyCode == 92 || e.keyCode == 95 // \_
    ) {

    }
  }

  unbind(): void {
    if(this.mergely) {
      this.focusManager.unregister(this.mergely.cm('lhs'));
      this.focusManager.unregister(this.mergely.cm('rhs'));
      this.mergely.unbind();
      this.mergely = null;
    }
    this.mergely_el && this.element.removeChild(this.mergely_el);
    this.mergely_el = null;
  }

  async compare(options?: CompareOptions): Promise<void> {
    this.unbind();

    this.input_lhs.related.style.display = 'none';
    this.input_rhs.related.style.display = 'none';

    const mergely_el = this.mergely_el = $('.mergely');
    mergely_el.id = `_${renderer.idx++}`;
    this.element.appendChild(mergely_el);

    const wrap_lines = await window.ipc.invoke('config get', 'wrap_lines');
    const configuredEncoding = await window.ipc.invoke('config get', 'encoding');
    let encoding;
    if(options && options.encoding) {
      encoding = options.encoding;
    } else if(this.item.status && this.item.status.encoding)
      encoding = this.item.status.encoding;
    else
      encoding = configuredEncoding;

    window.ipc.invoke('read file in fileview',
      this.input_lhs.getValue(),
      this.input_rhs.getValue(),
      encoding
    ).then(result => {
      // console.log('result =', result);
      const mergely = this.mergely = new Mergely(
        // '#mergely',
        this.mergely_el,
        {
          ...{},
          lhs: result.data_lhs,
          rhs: result.data_rhs,
          bgcolor: 'white',
          vpcolor: 'rgb(167 167 167 / 50%)',
          // _debug: true,
          changes: (changes: Change[]) => {
            // console.log('changes =', changes);
            let removal = 0, insertion = 0, change = 0;
            for(let i = 0; i < changes.length; i++) {
              if(changes[i].op == 'd')
                removal++;
              else if(changes[i].op == 'a')
                insertion++;
              else //if(changes[i].op == 'c')
                change++;
            }

            this.item.status = { removal, insertion, change, encoding };
            const mainLayouttService = getService(mainLayoutServiceId) as MainLayoutService;
            mainLayouttService.updateStatusbar(this.item);
          },
          changed: (args: any[]) => {
            if(args && args.length > 0) {
              const ev = args[0] as CustomEvent;
              if(ev.detail && ev.detail.side && ev.detail.historySize && ev.detail.ohistorySize) {
                const input = ev.detail.side === 'rhs' ? this.input_rhs : this.input_lhs;
                if(ev.detail.historySize.undo > 0)
                  input.setChanged();
                else
                  input.clearChanged();

                const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
                if(ev.detail.historySize.undo > 0 || ev.detail.ohistorySize.undo > 0)
                  bodyLayoutService.callTabFn(this.item.uid, 'setChanged');
                else
                  bodyLayoutService.callTabFn(this.item.uid, 'clearChanged');
              }
            }
          },
          cmsettings: {
            scrollbarStyle: 'simple',
            keyMaps: [
              {
                name: 'wrapLines',
                'Alt-Z': (instance: Editor) => {
                  window.ipc.invoke('config get', 'wrap_lines').then((v) => {
                    const toggled = !v;
                    this.mergely.options({ wrap_lines: toggled });
                    window.ipc.invoke('config update', { wrap_lines: toggled });
                  });
                }
              },
              {
                name: 'pushToLeft',
                'Ctrl-Shift-Left': (instance: Editor) => {
                  this.mergely.mergeChangeByPos('rhs', 'lhs');
                }
              },
              {
                name: 'pushToRight',
                'Ctrl-Shift-Right': (instance: Editor) => {
                  this.mergely.mergeChangeByPos('lhs', 'rhs');
                }
              },
            ],
          },
          wrap_lines
        }
      );

      this.focusManager.register(this.mergely.cm('lhs'));
      this.focusManager.register(this.mergely.cm('rhs'));

      setTimeout(() => {this.mergely.cm('lhs').focus()});

    }).catch(error => {
      console.log(error);
    });

    const input_lhs_value = this.input_lhs.getValue();
    const input_rhs_value = this.input_rhs.getValue();

    const bodyLayoutService = getService(bodyLayoutServiceId) as BodyLayoutService;
    bodyLayoutService.updateTabLabel(this.item.uid, input_lhs_value as string, input_rhs_value as string);
  }

  /* recvReadData(data: any): void {
    console.log('data =', data);
    const mergely = this.mergely = new Mergely(
      // '#mergely',
      this.mergely_el,
      {
        ...{},
        lhs: data.data_lhs,
        rhs: data.data_rhs,
        // _debug: true,
      }
    );
  } */

  layout(): void {
    if(this.element.classList.contains('active'))
      this.mergely && this.mergely.resize();
  }

  setClass(style: { active?: boolean; }): void {
    const { active } = style;
    if(active != null) {
      if(active) this.element.classList.add('active');
      else this.element.classList.remove('active');
    }
  }

  getClass(): DOMTokenList {
    return this.element.classList;
  }

}