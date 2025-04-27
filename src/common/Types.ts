export enum CompareType { File, Folder }

// description of compare state
export interface CompareItem {
  type: CompareType,
  uid: string,

  // in renderer
  selected?: boolean; // default: false
  active?: boolean; // default: false
}