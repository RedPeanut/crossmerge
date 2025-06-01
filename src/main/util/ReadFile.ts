import { CompareItem } from "../../common/Types";
import fs from 'fs';
import { mainWindow } from "../main";
import { StringDecoder } from "string_decoder";

export class ReadFile {

  uid: string
  decoder: StringDecoder;

  constructor(uid: string) {
    this.uid = uid;
    this.decoder = new StringDecoder('utf8');
  }

  run(arg: CompareItem): {} {
    // TODO: try to auto-detect encoding from file content n use option value if fails
    const buf_lhs: Buffer = fs.readFileSync(arg.path_lhs);
    const buf_rhs: Buffer = fs.readFileSync(arg.path_rhs);

    const data_lhs = this.decoder.write(buf_lhs);
    const data_rhs = this.decoder.write(buf_rhs);

    mainWindow.send('read file data', {
      uid: this.uid,
      // buf_lhs, buf_rhs,
      data_lhs, data_rhs,
    });
    return { resultCode: '0000', resultData: {} };
  }
}