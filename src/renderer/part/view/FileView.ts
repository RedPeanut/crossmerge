import { CompareFileData, CompareItem } from "../../../common/Types";
import { CompareView } from "../../Types";
import { $ } from "../../util/dom";

export interface FileViewOptions {}

export class FileView implements CompareView {

  parent: HTMLElement;
  element: HTMLElement;
  item: CompareItem;

  constructor(parent: HTMLElement, item: CompareItem) {
    this.parent = parent;
    this.item = item;
  }

  create(): HTMLElement {
    const el = this.element = $('.file-compare-view');
    return el;
  }

  doCompare(): void {
    throw new Error("Method not implemented.");
  }

  sendRowData(data: CompareFileData): void {
    throw new Error("Method not implemented.");
  }
}