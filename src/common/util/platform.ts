let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;

export interface ProcessEnvironment {
  [key: string]: string | undefined;
}

export interface NodeProcess {
  platform: string;
  arch: string;
  env: ProcessEnvironment;
  versions?: {
    node?: string;
    electron?: string;
    chrome?: string;
  };
  type?: string;
  cwd: () => string;
}

declare const process: NodeProcess;
const $globalThis: any = globalThis;
let nodeProcess: NodeProcess | undefined = undefined;
if(typeof process !== 'undefined' && typeof process?.versions?.node === 'string') {
  // Native environment (non-sandboxed)
  nodeProcess = process;
}

interface Navigator {
  userAgent: string;
  maxTouchPoints?: number;
  language: string;
}
declare const navigator: Navigator;

// Native environment
if(typeof nodeProcess === 'object') {
  _isWindows = (nodeProcess.platform === 'win32');
  _isMacintosh = (nodeProcess.platform === 'darwin');
  _isLinux = (nodeProcess.platform === 'linux');
}

export const enum Platform {
  Web,
  Mac,
  Linux,
  Windows
}
export type PlatformName = 'Web' | 'Windows' | 'Mac' | 'Linux';

let _platform: Platform = Platform.Web;
if(_isMacintosh) {
  _platform = Platform.Mac;
} else if(_isWindows) {
  _platform = Platform.Windows;
} else if(_isLinux) {
  _platform = Platform.Linux;
}

export const isWindows = _isWindows;
export const isMacintosh = _isMacintosh;
export const isLinux = _isLinux;