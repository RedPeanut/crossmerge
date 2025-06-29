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
  layout(): void;
  css(style: { active?: boolean }): void;
}

/* Context Menu */
export interface CommonContextMenuItem {
  label?: string;

  type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';

  accelerator?: string;

  enabled?: boolean;
  visible?: boolean;
  checked?: boolean;
}

export interface SerializableContextMenuItem extends CommonContextMenuItem {
  id: number;
  submenu?: SerializableContextMenuItem[];
}

export interface ContextMenuItem extends CommonContextMenuItem {
  click?: (event: ContextMenuEvent) => void;
  submenu?: ContextMenuItem[];
}

export interface ContextMenuEvent {
  shiftKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

export interface PopupOptions {
  x?: number;
  y?: number;
  // positioningItem?: number;
}