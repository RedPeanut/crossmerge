import { Layout } from '../Layout';
import { coalesce } from '../../../base/common/arrays';
import { isLinux, isWindows } from '../../../base/common/platform';
import { $ } from '../../../base/browser/dom';

export const enum Parts {
  TITLEBAR_PART = 'part.titlebar',
  ACTIVITYBAR_PART = 'part.activitybar',
  BODY_LAYOUT = 'layout.body',
  STATUSBAR_PART = 'part.statusbar'
}

export class MainLayout extends Layout {

  constructor(parent: HTMLElement) { 
    super(parent);
  }

  create(): void {
    const platformClass = isWindows ? 'windows' : isLinux ? 'linux' : 'mac';
    const mainClasses = coalesce(['main', platformClass]);
    this.mainContainer.classList.add(...mainClasses);

    /* const titlebarPart = this.titlebarPart = new TitlebarPart(null, Parts.TITLEBAR_PART, 'none', ['titlebar'], null);
    titlebarPart.create();
    
    const body = this.bodyLayout = new BodyLayout(null, { sizeType: 'fill_parent' });
    body.create();

    const statusbarPart = this.statusbarPart = new StatusbarPart(null, Parts.STATUSBAR_PART, 'none', ['statusbar'], null);
    statusbarPart.create(); */
    const el = $('.main-layout');
    el.innerHTML = 'This is main layout.';
    this.mainContainer.appendChild(el);

    this.parent.appendChild(this.mainContainer);
  }

  startup(): void {
    this.create();
  }
}