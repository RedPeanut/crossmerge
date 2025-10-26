/* export interface ConfigsType {
  // text: display, encoding
  wrap_lines?: boolean,
  // try_auto_detect?: boolean,
  charset?: string,

  // file

  // folder: filters
  filters?: []

  // application

} */

const configs = {
  // text: display, encoding
  wrap_lines: false,
  charset: 'utf8_w/o_bom',

  // file

  // folder: filters
  filters: []

  // application
};

export type ConfigsType = typeof configs;

export default configs;