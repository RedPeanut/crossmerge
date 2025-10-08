import { EventEmitter } from "events";
import Diff from "./Diff";
import DiffParser from "./DiffParser";
import { Change } from "./Types";

export default class DiffWorker extends EventEmitter {

  _listeners: [ event: string, listener: (...args: any[]) => void ][] = [];

  onerror(ev) {}

  terminate() {
    for(const [ event, listener ] of this._listeners) {
      this.off(event, listener);
    }
  }

  on(event: string, listener: (...args: any[]) => void): this{
    this._listeners.push([ event, listener ]);
    return super.on(event, listener);
  }

  postMessage({lhs, rhs, options}) {
    setTimeout(() => {
      const {
        ignorews = false,
        ignoreaccents = false,
        ignorecase = false,
        split = 'lines'
      } = options;
      const diff = new Diff(lhs, rhs, { ignorews, ignoreaccents, ignorecase, split });
      // console.log('diff.changes() =', diff.changes());
      // console.log('diff.normal_form() =', diff.normal_form());
      const changes: Change[] = new DiffParser().parse(diff.normal_form());
      // console.log('changes =', changes);
      // postMessage(changes);
      this.emit('changes', changes);
    }, 0);
  }
}