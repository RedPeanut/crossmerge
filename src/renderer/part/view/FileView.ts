import { CompareFileData, CompareItem } from "../../../common/Types";
import Mergely from "../../../lib/mergely/Mergely";
import { CompareView } from "../../Types";
import { $ } from "../../util/dom";

export interface FileViewOptions {}

export class FileView implements CompareView {

  parent: HTMLElement;
  element: HTMLElement;
  item: CompareItem;

  input_lhs: HTMLInputElement;
  input_rhs: HTMLInputElement;
  mergely_el: HTMLInputElement;
  mergely: Mergely;

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
  }

  create(): HTMLElement {
    const el = this.element = $('.file-compare-view');

    const inputs = $(".inputs");
    const input_column_lhs = $(".input-column.lhs");
    const input_lhs = this.input_lhs = $('input.lhs') as HTMLInputElement;
    input_lhs.placeholder = 'Left file';

    const input_margin = $(".input-margin");
    const input_column_rhs = $(".input-column.rhs");
    const input_rhs = this.input_rhs = $('input.rhs') as HTMLInputElement;
    input_rhs.placeholder = 'Right file';

    input_lhs.value = '/Users/kimjk/workspace/electron/crossmerge/test/fixture/one single diff file/left/moons.txt';
    input_rhs.value = '/Users/kimjk/workspace/electron/crossmerge/test/fixture/one single diff file/right/moons.txt';

    function inputKeyPressHandler(e: KeyboardEvent) {
      console.log('keypress event is called ..');
      // console.log('e.keyCode =', e.keyCode);

      if(e.keyCode == 13) {
        // launch comparison
        this.doCompare();
        return;
      }

      // TODO: auto completion

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

    input_lhs.addEventListener('keypress', inputKeyPressHandler.bind(this));
    input_rhs.addEventListener('keypress', inputKeyPressHandler.bind(this));

    input_column_lhs.appendChild(input_lhs);
    inputs.appendChild(input_column_lhs);
    inputs.appendChild(input_margin);
    input_column_rhs.appendChild(input_rhs);
    inputs.appendChild(input_column_rhs);

    const suggests = $(".suggests");
    suggests.style.display = 'none';
    const suggest_column_lhs = $(".suggest-column.lhs");
    const suggest_margin = $(".suggest-margin");
    const suggest_column_rhs = $(".suggest-column.rhs");
    suggests.appendChild(suggest_column_lhs);
    suggests.appendChild(suggest_margin);
    suggests.appendChild(suggest_column_rhs);

    const mergely = this.mergely_el = $('#mergely');
    // mergely.style.height = '740px';

    el.appendChild(inputs);
    el.appendChild(suggests);
    el.appendChild(mergely);
    return el;
  }

  doCompare(): void {
    const input_lhs_value = this.input_lhs.value;
    const input_rhs_value = this.input_rhs.value;

    /* window.ipc.send('new', {
      ...this.item,
      path_lhs: input_lhs_value,
      path_rhs: input_rhs_value
    }); */

    window.ipc.invoke('read file in fileview',
      this.input_lhs.value,
      this.input_rhs.value
    ).then(result => {
      console.log('result =', result);
      const mergely = this.mergely = new Mergely(
      // '#mergely',
      this.mergely_el,
      {
        ...{},
        lhs: result.data_lhs,
        rhs: result.data_rhs,
        // _debug: true,
      }
    );
    }).catch(error => {
      // console.log(error);
    });
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

  layout(): void {}

  css(style: { active?: boolean; }): void {
    const { active } = style;
    if(active) this.element.classList.add('active');
    else this.element.classList.remove('active');
  }

}