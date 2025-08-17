import { Channels, ElectronHandler } from "../../main/preload";
import { Broadcast } from "../Broadcast";
import { Dialog } from "../Dialog";
import { FileView } from "../part/view/FileView";
import { FolderView } from "../part/view/FolderView";

// who: Component (Dialog|FolderView|FileView)
// where: HTMLElement|broadcast|window.ipc
// what: event, listener pair

type Who = Dialog | FolderView | FileView;
type Where = HTMLElement | Broadcast | ElectronHandler;
// type Handler = (() => void) | ((...args: any[]) => void);

/**
 * Can manage HTMLElement, broadcast, window.ipc listener
 */
export class ListenerManager {

  map: Map<Who, Map<Where, any>> = new Map<Who, Map<Where, any>>();

  register(who: Who, where: Where, event: string, handler: any) {

    if(where instanceof HTMLElement)
      where.addEventListener(event, handler);
    else if(where instanceof Broadcast)
      where.addListener(event, handler);
    // else if(where instanceof ElectronHandler) // 'ElectronHandler' only refers to a type, but is being used as a value here.ts(2693)
    // else if(typeof where === typeof window.ipc) {
    else if(where === window.ipc) {
      where.on(event as Channels, handler);
    } else {
      // must do not enter here
      throw new Error();
    }

    if(this.map.get(who)) {
      if(this.map.get(who).get(where)) {
        if(this.map.get(who).get(where).get(event)) {
          this.map.get(who).get(where).get(event).push(handler);
        } else {
          this.map.get(who).get(where).set(event, [ handler ]);
        }
      } else {
        const _what = new Map<string, any>();
        _what.set(event, [ handler ]);
        this.map.get(who).set(where, _what);
      }
    } else {
      const _what = new Map<string, any>();
      _what.set(event, [ handler ]);
      const _where = new Map<Where, any>();
      _where.set(where, _what);
      this.map.set(who, _where);
    }
  }

  clear(who: Who) {
    if(this.map.get(who)) {
      for(const [where, what] of this.map.get(who)) {
        for(const [event, handlers] of this.map.get(who).get(where)) {
          for(const handler of handlers) {
            if(where instanceof HTMLElement)
              where.removeEventListener(event, handler);
            else if(where instanceof Broadcast)
              where.removeListener(event, handler);
            // else if(where instanceof ElectronHandler) // 'ElectronHandler' only refers to a type, but is being used as a value here.ts(2693)
            // else if(typeof where === typeof window.ipc) {
            else if(where === window.ipc) {
              where.off(event as Channels, handler);
            }
          }
        }
      }
    }
  }
}

export const listenerManager = new ListenerManager();