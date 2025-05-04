import { EventEmitter } from "events";
import Diff from "./Diff";
import DiffParser from "./DiffParser";

export default class DiffWorker extends EventEmitter {
  onerror(ev) {}
  terminate() {}

  postMessage({lhs, rhs, options}) {
    setTimeout(() => {
      const {
        ignorews = false,
        ignoreaccents = false,
        ignorecase = false,
        split = 'lines'
      } = options;
      const compare = new Diff(lhs, rhs, { ignorews, ignoreaccents, ignorecase, split });
      console.log('compare.normal_form() =', compare.normal_form());
      const changes = new DiffParser(compare.normal_form());
      console.log('changes =', changes);
      // postMessage(changes);
      this.emit('changes', changes);
    }, 0);
  }
}