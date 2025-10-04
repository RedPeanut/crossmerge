// import CodeMirror from 'codemirror';
// const diff = require('./diff');
import Diff from './Diff';
import { Side, Change, Viewport } from './Types';

const trace = console.log;

const expLetters = new RegExp(
  /\p{Letter}\p{Mark}*|\p{Number}\p{Mark}*|\p{Punctuation}\p{Mark}*|\p{Symbol}\p{Mark}*|\p{White_Space}/gu
);

interface VDocOptions {
  _debug: boolean;
}

interface RenderOptions {
  isCurrent?: boolean;
  lineDiff?: boolean;
  mergeButton?: HTMLElement;
  getMergeHandler?: (change: Change, side: Side, oside: Side) => void;
}

export default class VDoc {

  options: VDocOptions;
  _lines: {
    lhs: { [id: number]: VLine },
    rhs: { [id: number]: VLine },
  };
  _rendered: {
    lhs: { [id: number]: boolean },
    rhs: { [id: number]: boolean },
  };

  constructor(options: VDocOptions) {
    this.options = options;
    this._lines = {
      lhs: {},
      rhs: {}
    };
    this._rendered = {
      lhs: {},
      rhs: {}
    };
  }

  addRender(side: Side, change: Change, changeId: number, options: RenderOptions) {
    if(this.options._debug) {
      trace('vdoc#addRender', side, changeId, change);
    }
    const {
      isCurrent,
      lineDiff,
      mergeButton,
      getMergeHandler
    } = options;

    const alreadyRendered = !!this._rendered[side][changeId];

    if(alreadyRendered) {
      if(this.options._debug) {
        trace('vdoc#addRender (already rendered)', side, changeId, change);
      }
      return;
    }

    const oside = (side === 'lhs') ? 'rhs' : 'lhs';
    const wrapClass = [ 'mergely', side, `cid-${changeId}` ];
    const bgClass = [ 'bg' ]; // marker
    const { lf, lt, olf } = getExtents(side, change);

    if(isCurrent) {
      /* if(lf !== lt) {
        this._getLine(side, lf).addLineClass(['background'], 'current');
      }
      this._getLine(side, lt).addLineClass(['background'], 'current');
      for(let j = lf; j <= lt; ++j) {
        this._getLine(side, j).addLineClass(['gutter'], 'mergely current');
      } */
      for(let j = lf; j <= lt; ++j) {
        this._getLine(side, j).addLineClass(['wrapper'], 'mergely current');
      }
    }

    const bgChangeOp = {
      lhs: {
        d: 'd',
        a: 'd',
        c: 'c'
      },
      rhs: {
        d: 'a',
        a: 'a',
        c: 'c'
      }
    }[ side ][ change.op ];


    if(lf < 0) {
      // If this is the first, line it has start but no end
      wrapClass.push('start');
      wrapClass.push('no-end');
      wrapClass.push(bgChangeOp);
      this._getLine(side, 0).addLineClass(['wrapper'], wrapClass.join(' '));
      this._getLine(side, 0).addLineClass(['background', 'gutter'], bgClass.join(' '));
      this._setRenderedChange(side, changeId);
      // return;
    } else if(side === 'lhs' && change['lhs-y-start'] === change['lhs-y-end']) {
      // if lhs, and start/end are the same, it has end but no-start
      wrapClass.push('no-start');
      wrapClass.push('end');
      wrapClass.push(bgChangeOp);
      this._getLine(side, lf).addLineClass(['wrapper'], wrapClass.join(' '));
      this._getLine(side, lf).addLineClass(['background', 'gutter'], bgClass.join(' '));
      this._setRenderedChange(side, changeId);
      // return;
    } else if(side === 'rhs' && change['rhs-y-start'] === change['rhs-y-end']) {
      // if rhs, and start/end are the same, it has end but no-start
      wrapClass.push('no-start');
      wrapClass.push('end');
      wrapClass.push(bgChangeOp);
      this._getLine(side, lf).addLineClass(['wrapper'], wrapClass.join(' '));
      this._getLine(side, lf).addLineClass(['background', 'gutter'], bgClass.join(' '));
      this._setRenderedChange(side, changeId);
      // return;
    } else {
      this._getLine(side, lf).addLineClass(['wrapper'], 'start');
      this._getLine(side, lt).addLineClass(['wrapper'], 'end');

      for(let j = lf, k = olf; lf !== -1 && lt !== -1 && j <= lt; ++j, ++k) {
        this._getLine(side, j).addLineClass(['wrapper'], bgChangeOp);
        this._getLine(side, j).addLineClass(['wrapper'], wrapClass.join(' '));
        this._getLine(side, j).addLineClass(['background', 'gutter'], bgClass.join(' '));

        if(!lineDiff) {
          // inner line diffs are disabled, skip the rest
          continue;
        }

        if(side === 'lhs' && (change.op === 'd')) {
          // mark entire line text with deleted (strikeout) if the
          // change is a delete, or if it is changed text and the
          // line goes past the end of the other side.
          this._getLine(side, j).markText(0, undefined, `mergely ch d lhs cid-${changeId}`);
        } else if(side === 'rhs' && (change.op === 'a')) {
          // mark entire line text with added if the change is an
          // add, or if it is changed text and the line goes past the
          // end of the other side.
          this._getLine(side, j).markText(0, undefined, `mergely ch a rhs cid-${changeId}`);
        }
      }
      this._setRenderedChange(side, changeId);
    }

    if(mergeButton) {
      mergeButton.className += ` merge-button merge-${oside}-button`;
      const handler = getMergeHandler(change, side, oside);
      this._getLine(side, lf).addMergeButton_('merge', mergeButton, handler);
    }
  }

  addInlineDiff(change: Change, changeId: number, { getText, ignorews, ignoreaccents, ignorecase }) {
    if(this.options._debug) {
      trace('vdoc#addInlineDiff', changeId, change);
    }
    const { lf, lt, olf, olt } = getExtents('lhs', change);
    const vdoc = this;

    for(let j = lf, k = olf;
      ((j >= 0) && (j <= lt)) || ((k >= 0) && (k <= olt));
      ++j, ++k) {

      // if both lhs line and rhs are within the change range with
      // respect to each other, do inline diff.
      if(j <= lt && k <= olt) {
        const lhsText = getText('lhs', j);
        const rhsText = getText('rhs', k);

        const alreadyRendered
          = !!this._getLine('lhs', j).markup.length
          || !!this._getLine('rhs', k).markup.length
        if(alreadyRendered) {
          continue;
        }

        const results = new Diff(lhsText, rhsText, {
          ignoreaccents,
          ignorews,
          ignorecase,
          split: 'chars'
        });
        for(const change of results.changes()) {
          const {
            lhs_start,
            lhs_deleted_count,
            rhs_start,
            rhs_inserted_count
          } = change;
          const lhs_to = lhs_start + lhs_deleted_count;
          const rhs_to = rhs_start + rhs_inserted_count;
          const lhs_line = vdoc._getLine('lhs', j);
          lhs_line.markText(lhs_start, lhs_to, `mergely ch ind lhs cid-${changeId}`);
          const rhs_line = vdoc._getLine('rhs', k);
          rhs_line.markText(rhs_start, rhs_to, `mergely ch ina rhs cid-${changeId}`);
        }
      } else if(k > olt) {
        // lhs has exceeded the max lines in the rhs editor, remainder are deleted
        const line = vdoc._getLine('lhs', j);
        line.markText(0, undefined, `mergely ch ind lhs cid-${changeId}`);
      } else if(j > lt) {
        // rhs has exceeded the max lines in the lhs editor, remainder are added
        const line = vdoc._getLine('rhs', k);
        line.markText(0, undefined, `mergely ch ina rhs cid-${changeId}`);
      }
    }
  }

  _setRenderedChange(side: Side, changeId: number) {
    if(this.options._debug) {
      trace('vdoc#_setRenderedChange', side, changeId);
    }
    return this._rendered[side][changeId] = true;
  }

  _getLine(side: Side, id: number): VLine {
    let line = this._lines[side][id];
    if(line) {
      return line;
    }
    line = new VLine(id);
    this._lines[side][id] = line;
    return line;
  }

  update(side: Side, editor: CodeMirror.EditorFromTextArea, viewport: Viewport) {
    if(this.options._debug) {
      trace('vdoc#update', side, editor, viewport);
    }
    const lines = Object.keys(this._lines[side]);
    for(let i = 0; i < lines.length; ++i) {
      const id = parseInt(lines[i]);
      if(id < viewport.from || id > viewport.to) {
        continue;
      }

      const vline = this._getLine(side, id);
      if(vline.rendered) {
        continue;
      }
      vline.update(editor);
    }
  }

  clear() {
    if(this.options._debug) {
      trace('vdoc#clear');
    }
    for(const lineId in this._lines.lhs) {
      this._lines.lhs[lineId].clear();
    }
    for(const lineId in this._lines.rhs) {
      this._lines.rhs[lineId].clear();
    }
  }
}

class VLine {

  id: number;
  background: Set<string>;
  wrapper: Set<string>;
  gutter: Set<string>;
  marker: [ name: string, item: HTMLElement, handler: (this: HTMLElement, ev: PointerEvent) => any ];
  mergeBtn: [ name: string, item: HTMLElement, handler: (this: HTMLElement, ev: PointerEvent) => any ];
  editor: CodeMirror.EditorFromTextArea;
  markup: [charFrom: number, charTo: number, className: string][];
  _clearMarkup: CodeMirror.TextMarker<CodeMirror.MarkerRange>[];
  rendered: boolean;

  constructor(id: number) {
    this.id = id;
    this.background = new Set<string>();
    this.wrapper = new Set<string>();
    this.gutter = new Set<string>();
    this.marker = null;
    this.mergeBtn = null;
    this.editor = null;
    this.markup = [];
    this._clearMarkup = [];
    this.rendered = false;
  }

  addLineClass(location: string[] // ('background' | 'gutter' | 'wrapper')[]
    , clazz: string
  ) {
    for(let i = 0; i < location.length; i++)
      this[location[i]].add(clazz);

    /* what is better?
    if(location === 'background')
    this.background.add(clazz);
    else if(location === 'gutter')
    this.gutter.add(clazz); */
  }

  addMergeButton(name: string, item: HTMLElement, handler) {
    this.marker = [ name, item, handler ];
  }

  addMergeButton_(name: string, item: HTMLElement, handler) {
    this.mergeBtn = [ name, item, handler ];
  }

  markText(charFrom: number, charTo: number, className: string) {
    this.markup.push([ charFrom, charTo, className ]);
  }

  update(editor: CodeMirror.EditorFromTextArea) {
    if(this.rendered) {
      // FIXME: probably do not need this now
      console.log('already rendered', this.id);
      return;
    }
    this.editor = editor;
    editor.operation(() => {
      if(this.background.size) {
        const clazz = Array.from(this.background).join(' ');
        editor.addLineClass(this.id, 'background', clazz);
      }
      if(this.wrapper.size) {
        const clazz = Array.from(this.wrapper).join(' ');
        editor.addLineClass(this.id, 'wrapper', clazz);
      }
      if(this.gutter.size) {
        const clazz = Array.from(this.gutter).join(' ');
        editor.addLineClass(this.id, 'gutter', clazz);
      }
      if(this.marker) {
        const [ name, item, handler ] = this.marker;
        item.addEventListener('click', handler);
        editor.setGutterMarker(this.id, name, item);
      }
      if(this.mergeBtn) {
        const [ name, item, handler ] = this.mergeBtn;
        item.addEventListener('click', handler);
        editor.setInlineWidget(this.id, name, item);
      }
      if(this.markup.length) {
        // while Mergely diffs unicode chars (letters+mark), CM is by character,
        // so diffs need to be mapped.
        const mapped = mapLettersToChars(editor.getValue());
        for(const markup of this.markup) {
          const [ charFrom, charTo, className ] = markup;
          const fromPos: CodeMirror.Position = { line: this.id, ch: null };
          const toPos: CodeMirror.Position = { line: this.id, ch: null };
          if(charFrom >= 0) {
            fromPos.ch = mapped[charFrom];
          }
          if(charTo >= 0) {
            toPos.ch = mapped[charTo];
          }
          this._clearMarkup.push(
            editor.markText(fromPos, toPos, { className }));
        }
      }
    });
    this.rendered = true;
  }

  clear() {
    const { editor } = this;
    if(!this.rendered) {
      return;
    }

    editor.operation(() => {
      if(this.background) {
        editor.removeLineClass(this.id, 'background');
      }
      if(this.wrapper) {
        editor.removeLineClass(this.id, 'wrapper');
      }
      if(this.gutter) {
        editor.removeLineClass(this.id, 'gutter');
      }
      if(this.marker) {
        const [ name, item, handler ] = this.marker;
        // set with `null` to clear marker
        editor.setGutterMarker(this.id, name, null);
        item.removeEventListener('click', handler);
        item.remove();
      }
      if(this.mergeBtn) {
        const [ name, item, handler ] = this.mergeBtn;
        // set with `null` to clear marker
        editor.setInlineWidget(this.id, name, null);
        item.removeEventListener('click', handler);
        item.remove();
      }
      if(this._clearMarkup.length) {
        for(const markup of this._clearMarkup) {
          markup.clear();
        }
        this._clearMarkup = [];
        this.markup = [];
      }
    });
  }
}

function getExtents(side: Side, change: Change) {
  const oside = (side === 'lhs') ? 'rhs' : 'lhs';
  return {
    lf: change[`${side}-line-from`],
    lt: change[`${side}-line-to`],
    olf: change[`${oside}-line-from`],
    olt: change[`${oside}-line-to`]
  };
}

function mapLettersToChars(text) {
  let match;
  let mapped = {};
  let index = 0;
  expLetters.lastIndex = 0;
  while((match = expLetters.exec(text)) !== null) {
    mapped[index++] = match.index;
  }
  return mapped;
}

// module.exports = VDoc;
