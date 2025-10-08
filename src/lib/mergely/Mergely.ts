// const CodeMirrorDiffView = require('./diff-view');
// const { default: DiffWorker } = require('./diff.worker.js');
// const diff = require('./diff');
// const dom = require('./dom.js');
import CodeMirrorDiffView from './DiffView';
import DiffWorker from './DiffWorker';
import Diff from './Diff';
import * as dom from './dom';
import { Change, Direction, Side } from './Types';
import DiffView from './DiffView';
import { EditorConfiguration, EditorFromTextArea } from '../../types/codemirror';

const trace = console.log;

export interface MergelyOptions {
  autoupdate?: boolean;
  rhs_margin?: any;
  wrap_lines?: boolean;
  line_numbers?: boolean;
  lcs?: boolean;
  sidebar?: boolean;
  viewport?: boolean;
  ignorews?: boolean;
  ignorecase?: boolean;
  ignoreaccents?: boolean;
  resize_timeout?: number;
  change_timeout?: number;
  bgcolor?: string;
  vpcolor?: string;
  license?: string;
  cmsettings?: {
    styleSelectedText?: boolean,
    mode?: string
  };
  lhs_cmsettings?: CodeMirror.EditorConfiguration;
  rhs_cmsettings?: CodeMirror.EditorConfiguration;
  lhs?: any;
  rhs?: any;
  _debug?: boolean;
  changes?: (changes: Change[]) => void;
  changed?: (args: any[]) => void;
}

const defaultOptions: MergelyOptions = {
  autoupdate: true,
  rhs_margin: 'right',
  wrap_lines: false,
  line_numbers: true,
  lcs: true,
  sidebar: true,
  viewport: false,
  ignorews: false,
  ignorecase: false,
  ignoreaccents: false,
  resize_timeout: 500,
  change_timeout: 50,
  bgcolor: '#eee',
  vpcolor: 'rgba(0, 0, 200, 0.5)',
  license: 'lgpl',
  cmsettings: {
    styleSelectedText: true,
    mode: null
  },
  lhs_cmsettings: {},
  rhs_cmsettings: {},
  lhs: null,
  rhs: null,
  _debug: false,
  changes: null,
  changed: null
};

export default class Mergely {

  el: HTMLElement;
  _initOptions;
  _viewOptions;
  _diffView: CodeMirrorDiffView;
  _listeners;
  _addEventListener;
  _removeEventListener;
  _options;
  _diffWorker: DiffWorker;
  _changes: Change[];

  ///* // exposes view methods
  public cm(side: Side): EditorFromTextArea { return this._diffView.cm(side); }
  public get(side: Side): string { return this._diffView.get(side); }
  public lhs(text: string): void { return this._diffView.lhs(text); }
  public mergeCurrentChange(side: Side): void { return this._diffView.mergeCurrentChange(side); }
  public resize(): void { return this._diffView.resize(); }
  public rhs(text: string): void { return this._diffView.rhs(text); }
  public scrollTo(side: Side): void { return this._diffView.scrollTo(side); }
  public scrollToDiff(direction: Direction): void { return this._diffView.scrollToDiff(direction); }
  public scrollToDiffByPos(direction: Direction): void { return this._diffView.scrollToDiffByPos(direction); }
  public search(side: Side): void { return this._diffView.search(side); }
  public unmarkup(): void { return this._diffView.unmarkup(); }
  public update(): void { return this._diffView.update(); }
  public clearHistory(side: Side): void { return this._diffView.clearHistory(side); }
  //*/

  constructor(selector: string | HTMLElement, options: MergelyOptions) {
    let element: HTMLElement;
    if(typeof selector === 'string') {
      element = document.querySelector(selector) as HTMLElement;
      if(!element) {
        throw new Error(`Failed to find: ${selector}`);
      }
    } else if(typeof selector !== 'object') {
      throw new Error(`The 'selector' element must be a string or DOM element`);
    } else {
      element = selector as HTMLElement;
    }

    const computedStyle = window.getComputedStyle(element);
    if(!element.style.height
      && (!computedStyle.height || computedStyle.height === '0px')
    ) {
      throw new Error(
        `The element "${selector}" requires an explicit height`);
    }

    this.el = element;
    this._initOptions = { ...options };
    this._setOptions(options);

    const view = new CodeMirrorDiffView(element, this._viewOptions);
    this._diffView = view;

    /* const exposedViewMethods = [
      'cm',
      'get',
      'lhs',
      'mergeCurrentChange',
      'resize',
      'rhs',
      'scrollTo',
      'scrollToDiff',
      'search',
      'unmarkup',
      'update'
    ];
    for(const method of exposedViewMethods) {
      this[method] = view[method].bind(view);
    } */
    this._listeners = [];
    this._addEventListener = element.addEventListener.bind(element);
    this._removeEventListener = element.removeEventListener.bind(element);

    // Add change listener for when the view needs a new diff
    this.on('changed', (...args) => {
      const options = this._options;
      if(options._debug) {
        trace('event#changed got event');
      }
      this._stopWorker();

      // create worker
      const worker = new DiffWorker();
      this._diffWorker = worker;
      worker.onerror = (ev) => {
        console.error('Unexpected error with web worker', ev);
      }
      // worker.onmessage = (ev) => {
      worker.on('changes', (changes: Change[]) => {
        if(options._debug) {
          trace('event#changed worker finished');
        }
        this._changes = changes;
        view.setChanges(this._changes);
        this._options.changes && this._options.changes(changes);
      });
      worker.postMessage({
        lhs: this.get('lhs'),
        rhs: this.get('rhs'),
        options: {
          ignoreaccents: options.ignoreaccents,
          ignorews: options.ignorews,
          ignorecase: options.ignorecase,
        }
      });

      this._options.changed && this._options.changed(args);
    });

    this.once('changed', (...args) => {
      view.clearHistory();
    });

    view.bind(this.el);
  }

  _setOptions(options: MergelyOptions) {
    if(this._options && this._options._debug) {
      trace('api#options');
    }
    const colors = dom.getColors(this.el);
    this._options = {
      ...defaultOptions,//lgpl
      ...(this._options || this._initOptions),
      ...options//lgpl-separate-notice
    };
    this._viewOptions = {
      ...this._options,
      _colors: colors
    };
  }

  _stopWorker() {
    if(!this._diffWorker) {
      return;
    }
    if(this._options._debug) {
      trace('event#changed terminating worker');
    }
    this._diffWorker.terminate();
    this._diffWorker = null;
  }

  unbind() {
    this._stopWorker();
    for(const [ event, listener ] of this._listeners) {
      this._removeEventListener(event, listener);
    }
    if(this._diffWorker) {
      this._diffWorker.terminate();
    }
    this._diffView.unbind();
    delete this._diffView;
  }

  /**
   * @deprecated
   */
  mergelyUnregister() {
  }

  on(event: string, handler: () => void) {
    this._listeners.push([ event, handler ]);
    this._addEventListener(event, handler);
  }

  once(event: string, handler: () => void) {
    this._listeners.push([ event, handler ]);
    this._addEventListener(event, handler, { once: true });
  }

  clear(side: Side): void {
    if(this._options._debug) {
      trace('api#clear', side);
    }
    if(side === 'lhs') {
      if(!this._diffView.readOnly('lhs')) {
        this._diffView.lhs('');
      }
    } else if(side === 'rhs') {
      if(!this._diffView.readOnly('rhs')) {
        this._diffView.rhs('');
      }
    }
  }

  diff(): string {
    if(this._options._debug) {
      trace('api#diff');
    }
    const lhs_text = this.get('lhs');
    const rhs_text = this.get('rhs');
    const comparison = new Diff(lhs_text, rhs_text, {
      ignoreaccents: this._options.ignoreaccents,
      ignorews: this._options.ignorews,
      ignorecase: this._options.ignorecase
    });
    return comparison.normal_form();
  }

  merge(side: Side): void {
    if(this._options._debug) {
      trace('api#merge', side);
    }
    const lhs_text = this.get('lhs');
    const rhs_text = this.get('rhs');
    if(side === 'lhs' && !this._diffView.readOnly('lhs')) {
      this._diffView.lhs(rhs_text);
    } else if(!this._diffView.readOnly('rhs')) {
      this._diffView.rhs(lhs_text);
    }
  }

  options(opts): void | MergelyOptions {
    if(opts) {
      this._setOptions(opts);
      this._diffView.setOptions(opts);
    }
    else {
      return this._options;
    }
  }

  summary(): {
    numChanges: number;
    lhsLength: number;
    rhsLength: number;
    c: number;
    a: number;
    d: number;
  } {
    if(this._options._debug) {
      trace('api#summary');
    }
    const lhs_text = this.get('lhs');
    const rhs_text = this.get('rhs');
    return {
      numChanges: this._changes.length,
      lhsLength: lhs_text.length,
      rhsLength: rhs_text.length,
      c: this._changes.filter(function(a) { return a.op === 'c'; }).length,
      a: this._changes.filter(function(a) { return a.op === 'a'; }).length,
      d: this._changes.filter(function(a) { return a.op === 'd'; }).length
    }
  }

  swap(): void {
    if(this._options._debug) {
      trace('api#swap');
    }
    if(this._diffView.readOnly()) {
      trace('api#swap readOnly');
      return;
    }
    const lhs_text = this.get('lhs');
    const rhs_text = this.get('rhs');
    this._diffView.lhs(rhs_text);
    this._diffView.rhs(lhs_text);
  }
}

// window.Mergely = Mergely;

// module.exports = Mergely;
