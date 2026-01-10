/**
 * Customize cm-show-invisible v3.1.0 - 260110, 김진규
 * - divide showInvisibles to showWhitespace n showEOL
 */

'use strict';

/* global CodeMirror */
/* global define */

((mod) => {
  if(typeof exports === 'object' && typeof module === 'object') // CommonJS
    return mod(require('codemirror/lib/codemirror'));

  if(typeof define === 'function' && define.amd) // AMD
    return define(['codemirror/lib/codemirror'], mod);

  mod(CodeMirror);
})((CodeMirror) => {

  CodeMirror.defineOption('showWhitespace', false, (cm, val, prev) => {
    let count = 0;
    const maximum = cm.getOption('maxInvisibles') || 16;

    if(prev === CodeMirror.Init)
      prev = false;

    if(prev && !val) {
      cm.removeOverlay('invisibles');
      return rm();
    }

    if(!prev && val) {
      add(maximum);

      cm.addOverlay({
        name: 'invisibles',
        token: function nextToken(stream) {
          let spaces = 0;
          let peek = stream.peek() === ' ';

          if(peek) {
            while (peek && spaces < maximum) {
              ++spaces;

              stream.next();
              peek = stream.peek() === ' ';
            }

            let ret = 'whitespace whitespace-' + spaces;

            /*
             * styles should be different
             * could not be two same styles
             * beside because of this check in runmode
             * function in `codemirror.js`:
             *
             * 6624: if(!flattenSpans || curStyle != style) {}
             */
            if(spaces === maximum)
              ret += ' whitespace-rand-' + count++;

            return ret;
          }

          while(!stream.eol() && !peek) {
            stream.next();

            peek = stream.peek() === ' ';
          }

          return 'cm-eol';
        },
      });
    }
  });

  function add(max) {
    // console.trace();
    const classBase = '.CodeMirror .cm-whitespace-';
    const spaceChar = '·';
    const style = document.createElement('style');

    style.setAttribute('data-name', 'js-show-invisibles');

    let rules = '';
    let spaceChars = '';

    for (let i = 1; i <= max; ++i) {
      spaceChars += spaceChar;
      rules += classBase + i + `:not([class*="cm-trailing-space-"])::before { content: "${spaceChars}";}\n`;
    }

    const gfmRules = '[class*=cm-trailing-space]::before{content: "·";}';

    const tabRules = `.cm-tab {
  font-family: codicon;
  font-size: inherit;
  color: #404F7D;
}
.cm-tab:before { content: "\\ec3c"; }
  `;

    style.textContent = [
      getStyle(),
      // getEOL(),
      rules,
      gfmRules,
      tabRules,
    ].join('\n');

    document.head.appendChild(style);
  }

  function rm() {
    const style = document.querySelector('[data-name="js-show-invisibles"]');
    document.head.removeChild(style);
  }

  function getStyle() {
    const style = [
      '.cm-whitespace::before {',
      'position: absolute;',
      'pointer-events: none;',
      'color: #404F7D;',
      '}',
    ].join('');

    return style;
  }

  function getEOL() {
    const style = [
      '.CodeMirror-code > div > pre > span::after, .CodeMirror-line > span::after {',
      '   pointer-events: none;',
      '   color: #404F7D;',
      '   content: "¬"',
      '}',
      '.CodeMirror-code > div:last-child > pre > span::after {',
      '   display: none;',
      '}',
    ].join('');

    return style;
  }

  CodeMirror.defineOption('showEOL', false, (cm, val, prev) => {
    let count = 0;
    const maximum = cm.getOption('maxInvisibles') || 16;

    if(prev === CodeMirror.Init)
      prev = false;

    if(prev && !val) {
      return;
    }

    if(!prev && val) {
      // add(maximum);
      const style = document.createElement('style');
      style.textContent = [
        getEOL(),
      ].join('\n');
      document.head.appendChild(style);
    }
  });

});
