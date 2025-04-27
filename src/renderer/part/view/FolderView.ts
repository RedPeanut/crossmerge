import { $ } from "../../util/dom";

export interface FolderViewOptions {}

export class FolderView {

  parent: HTMLElement;
  element: HTMLElement;

  constructor(parent: HTMLElement) {
    this.parent = parent;
  }

  create(): HTMLElement {
    const el = this.element = $('.folder-compare-view');

    // tree area, changes area, customized scrollbar, etc.

    /*
      <div class="inputs">
        <div class="input-column lhs">
          <input type="text" placeholder="First folder">
        </div>
        <div class="input-margin"></div>
        <div class="input-column rhs">
          <input type="text" placeholder="Second folder">
        </div>
      </div>

      <div class="lists">
        <div class="header">
          <div class="list-column lhs">
          </div>
          <div class="list-changes">
          </div>
          <div class="list-column rhs">
          </div>
        </div>
        <div class="body">
          <div class="list-column lhs">
          </div>
          <div class="list-changes">
          </div>
          <div class="list-column rhs">
          </div>
        </div>
      </div>
    */

    const input_lhs = $('input.lhs');
    const input_rhs = $('input.rhs');



    return el;
  }

}