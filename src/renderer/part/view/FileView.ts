import { Input } from "../../component/Input";
import { CompareFileData, CompareItem, editPrevChangeMenuId, editNextChangeMenuId, toggleWrapLinesMenuId } from "../../../common/Types";
import Mergely from "../../../lib/mergely/Mergely";
import { CompareView } from "../../Types";
import { $ } from "../../util/dom";
import { ComplexFocusManager } from "../../util/ComplexFocusManager";
import { BodyLayoutService } from "../../layout/BodyLayout";
import { getService, bodyLayoutServiceId, statusbarPartServiceId } from "../../Service";
import { renderer } from "../..";
import { StatusbarPartService } from "../StatusbarPart";
import { Change } from "../../../lib/mergely/Types";
import { broadcast } from "../../Broadcast";
import { listenerManager } from "../../util/ListenerManager";

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

    listenerManager.register(this, broadcast, 'menu click', this.menuClickHandler.bind(this));
    listenerManager.register(this, window.ipc, 'menu click', this.menuClickHandler.bind(this));

    this.focusManager = new ComplexFocusManager();
  }

  menuClickHandler(...args: any[]): void {
    if(args && args.length > 1
      && this.element.classList.contains('active')
    ) {
      // console.log('args =', args);
      const id = args[1];

      if(id.startsWith('file')) {

      } else if(id.startsWith('edit')) {
        if(id === editPrevChangeMenuId) {
          this.mergely.scrollToDiffByPos('prev');
        } else if(id === editNextChangeMenuId) {
          this.mergely.scrollToDiffByPos('next');
        }
      } else if(id.startsWith('view')) {
        if(id === toggleWrapLinesMenuId) {
          // this.mergely.options({ wrap_lines: !curr });
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
    input_lhs.setValue('/Users/kimjk/workspace/electron/fixture/mixed case/left/b/ba/baa.txt');
    input_rhs.setValue('/Users/kimjk/workspace/electron/fixture/mixed case/right/b/ba/baa.txt');
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
      this.doCompare();
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

  doCompare(): void {
    if(this.mergely) {
      this.focusManager.unregister(this.mergely.cm('lhs'));
      this.focusManager.unregister(this.mergely.cm('rhs'));
      this.mergely.unbind();
      this.mergely = null;
    }
    this.mergely_el && this.element.removeChild(this.mergely_el);
    this.mergely_el = null;

    this.input_lhs.related.style.display = 'none';
    this.input_rhs.related.style.display = 'none';

    const mergely_el = this.mergely_el = $('.mergely');
    mergely_el.id = `_${renderer.idx++}`;
    this.element.appendChild(mergely_el);

    window.ipc.invoke('read file in fileview',
      this.input_lhs.getValue(),
      this.input_rhs.getValue()
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

            this.item.status = { removal, insertion, change };
            const statusbarPartService = getService(statusbarPartServiceId) as StatusbarPartService;
            statusbarPartService.update(this.item);
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
            scrollbarStyle: 'simple'
          }
        }
      );

      this.focusManager.register(this.mergely.cm('lhs'));
      this.focusManager.register(this.mergely.cm('rhs'));

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