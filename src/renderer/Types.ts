import { CompareItem } from "../common/Types";
export type Mode = 'horizontal' | 'vertical';
export type Group = CompareItem[];

export interface SplitItem {
  // id: string;
  mode?: Mode; //'horizontal' | 'vertical';
  list: (SplitItem | Group)[];
}

export function isSplitItem(o: any) {
  return 'mode' in o && 'list' in o && o.list.length > 0;
}
export interface CompareView {
  doCompare(): void;
}