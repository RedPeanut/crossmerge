import { ElectronHandler } from '../main/preload';
declare global {
  interface Window {
    ipc: ElectronHandler;
  }
}

export type CodeWindow = Window & typeof globalThis;
export const mainWindow = window as CodeWindow;

import { CompareFileData, CompareFolderData, CompareItem } from "../common/Types";

export type Group = CompareItem[];
export type Mode = 'horizontal' | 'vertical';

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
  sendRowData(data: CompareFileData|CompareFolderData): void;
  sendReadData(data: any): void;
}