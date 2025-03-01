import { EventEmitter } from "events";
import Diff from "./Diff";

export default class DiffWorker extends EventEmitter {
  onerror(ev) {}

  postMessage({lhs, rhs, options}) {
    const {
      ignorews = false,
      ignoreaccents = false,
      ignorecase = false,
      split = 'lines'
    } = options;
    const compare = new Diff(lhs, rhs, { ignorews, ignoreaccents, ignorecase, split });
    console.log(compare.normal_form());
    // const changes = DiffParser(compare.normal_form());
    // postMessage(changes);
    this.emit('changes', null); //changes)
  }
}