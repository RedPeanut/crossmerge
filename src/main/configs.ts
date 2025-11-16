/* export interface ConfigsType {
  // text: display, encoding
  wrap_lines?: boolean,
  // try_auto_detect?: boolean,
  encoding?: string,

  // file

  // folder: filters
  filters?: []

  // application

} */

const configs = {
  // text: display, encoding
  wrap_lines: false,
  try_to_auto_detect: true,
  encoding: 'utf8',

  // file

  // folder: filters
  filters: []

  // application
};

export type ConfigsType = typeof configs;

export default configs;