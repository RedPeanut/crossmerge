export class Disposable {

  map: Map<HTMLElement, Map<string, () => void>> = new Map<HTMLElement, Map<string, () => void>>();

  dispose(): void {
    for(const [el, v] of this.map) {
      // console.log(`${key}: ${value}`);
      for(const [event, handler] of v) {
        el.removeEventListener(event, handler);
      }
    }
    this.map.clear();
  }

  register(el: HTMLElement, event: string, handler: () => void) {
    if(this.map.get(el)) {
      if(this.map.get(el).get(event)) {
        el.removeEventListener(event, this.map.get(el).get(event));
      }
    }
    el.addEventListener(event, handler);
  }
}