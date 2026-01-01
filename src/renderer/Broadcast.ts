import EventEmitter from "events";

export class Broadcast extends EventEmitter {}

export const broadcast = new Broadcast();
broadcast.setMaxListeners(0); // infinity