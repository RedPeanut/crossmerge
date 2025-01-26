import { Part } from './Part';

export abstract class Layout {

  parent: HTMLElement;
  mainContainer = document.createElement('div');
  parts = new Map<string, Part>();

  constructor(parent: HTMLElement) {
    this.parent = parent;
  }

  registerPart(part: Part): void {
    const id = part.getId();
    this.parts.set(id, part);
  }

  getPart(id: string): Part {
    const part = this.parts.get(id);
    if(!part) {
      throw new Error(`Unknown part ${id}`);
    }
    return part;
  }
}