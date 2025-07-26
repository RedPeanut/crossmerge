import { StringUtil } from "../../common/util/StringUtil";
import { Popup } from "../Popup";
import { $ } from "../util/dom";

/** Emit events
 * ok:
 */
export class FilesFoldersProgressPopup extends Popup {

  fromSpan: HTMLElement;
  toSpan: HTMLElement;

  constructor(parent: HTMLElement) {
    super(parent);
    this.title.innerHTML = 'Files and folders progress';

    this.contentArea.classList.add('fnfp'); // abbr. files n folders progress

    const top = $('.top');
    const left = $('.left');
    const right = $('.right');
    const bottom = $('.bottom');

    let line;
    let label, span, id;

    line = $('.line');
    id = 'copy_from';
    label = $('label');
    label.setAttribute('for', id);
    label.textContent = 'Copying from:';
    span = this.fromSpan = $('span');
    span.id = id;
    span.name = 'copy_from';
    span.textContent = '';

    line.appendChild(label);
    line.appendChild(span);
    left.appendChild(line);

    line = $('.line');
    id = 'copy_to';
    label = $('label');
    label.setAttribute('for', id);
    label.textContent = 'Copying to:';
    span = this.toSpan = $('span');
    span.id = id;
    span.name = 'copy_to';
    span.textContent = '';

    line.appendChild(label);
    line.appendChild(span);
    left.appendChild(line);

    top.appendChild(left);
    top.appendChild(right);

    this.contentArea.appendChild(top);
    this.contentArea.appendChild(bottom);
  }

  // show(param: {}): void {}
}