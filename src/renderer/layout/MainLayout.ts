import { coalesce } from '../util/arrays';
import { isLinux, isWindows } from '../../common/util/platform';
import { Layout } from '../Layout';
import { TitlebarPart } from '../part/TitlebarPart';
// import { BodyPart } from '../part/BodyPart';
import { StatusbarPart, StatusbarPartService } from '../part/StatusbarPart';
import { BodyLayout, BodyLayoutService } from './BodyLayout';
import { SplitView } from '../component/SplitView';
import { $ } from '../util/dom';
import * as dom from '../util/dom';
import { Orientation } from '../component/Sash';
import { bodyLayoutServiceId, getService, Service, setService, mainLayoutServiceId, menubarServiceId as menubarServiceId, statusbarPartServiceId } from '../Service';
import { CompareFolderData, CompareItem } from '../../common/Types';
import { MenubarService } from '../part/Menubar';
import { EncodingItem as EncodingItem } from '../Types';

export const TITLEBAR_HEIGHT = 83;
export const STATUSBAR_HEIGHT = 22;

export const enum Parts {
  TITLEBAR_PART = 'part.titlebar',
  BODY_LAYOUT = 'layout.body',
  STATUSBAR_PART = 'part.statusbar'
}

export interface MainLayoutService extends Service {
  layout(): void;
  showStatusbarWidget(list: any[]): void;
  position(): void;
  updateStatusbar(item: CompareItem): void;
  clearStatusbar(): void;
}

export class MainLayout extends Layout implements MainLayoutService {

  layoutContainer(offset: number): void {
    throw new Error('Method not implemented.');
  }

  titlebarPart: TitlebarPart;
  bodyLayout: BodyLayout;
  statusbarPart: StatusbarPart;
  splitView: SplitView<TitlebarPart | BodyLayout | StatusbarPart>;
  statusbarWidget: HTMLElement;
  current: CompareItem = null;

  constructor(parent: HTMLElement) {
    super(parent);
    setService(mainLayoutServiceId, this);
  }

  create(): void {
    // console.log('render() is called ..');

    //
    const platformClass = isWindows ? 'windows' : isLinux ? 'linux' : 'mac';
    const classes = coalesce(['main', 'layout', platformClass]);
    this.container.classList.add(...classes);

    const titlebarPart = this.titlebarPart = new TitlebarPart(null, Parts.TITLEBAR_PART, 'none', ['titlebar'], null);
    titlebarPart.create();

    const bodyLayout = this.bodyLayout = new BodyLayout(null, { sizeType: 'fill_parent' });
    bodyLayout.create();

    const statusbarPart = this.statusbarPart = new StatusbarPart(null, Parts.STATUSBAR_PART, 'none', ['statusbar'], null);
    statusbarPart.create();

    const splitView = this.splitView = new SplitView(this.container, { orientation: Orientation.VERTICAL });
    splitView.addView(titlebarPart);
    splitView.addView(bodyLayout);
    splitView.addView(statusbarPart);

    const statusbarWidget = this.statusbarWidget = $('.statusbar-widget');
    statusbarWidget.tabIndex = -1;
    statusbarWidget.style.display = 'none';
    statusbarWidget.addEventListener('focusout', (e: FocusEvent) => {
      // console.log('focusout is called ..');
      statusbarWidget.style.display = 'none';
    });
    statusbarWidget.addEventListener('keydown', (e: KeyboardEvent) => {
      // console.log('e.key =', e.key);
      if(e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const ul = statusbarWidget.children[0];
        let currIndex = 0;
        for(; currIndex < ul.children.length; currIndex++) {
          if(ul.children[currIndex].classList.contains('on'))
            break;
        }

        if(e.key === 'ArrowDown') {
          let next: HTMLElement, nextIndex = -1;

          if(currIndex === ul.children.length-1)
            nextIndex = 0;
          else
            nextIndex = currIndex+1;

          ul.children[currIndex].classList.remove('on');
          next = ul.children[nextIndex] as HTMLElement;
          next.classList.add('on');

          if(currIndex === ul.children.length-1) {
            ul.scrollTop = 0;
          } else {
            if(ul.scrollTop + ul.clientHeight < next.offsetTop + next.clientHeight)
              ul.scrollTop = next.offsetTop + next.clientHeight - ul.clientHeight;
          }
        } else if(e.key === 'ArrowUp') {
          let next: HTMLElement, nextIndex = -1;

          if(currIndex === 0)
            nextIndex = ul.children.length-1;
          else
            nextIndex = currIndex-1;

          ul.children[currIndex].classList.remove('on');
          next = ul.children[nextIndex] as HTMLElement;
          next.classList.add('on');

          if(currIndex === 0) {
            ul.scrollTop = next.offsetTop + next.clientHeight - ul.clientHeight;
          } else {
            if(ul.scrollTop > next.offsetTop)
              ul.scrollTop = next.offsetTop;
          }
        }
        e.preventDefault();
      } else if(e.key === 'Enter') {
        // compare again with this encoding
        const ul = statusbarWidget.children[0];
        let currIndex = 0;
        for(; currIndex < ul.children.length; currIndex++) {
          if(ul.children[currIndex].classList.contains('on'))
            break;
        }

        const desc = ul.children[currIndex].querySelector('span.desc');
        if(this.current.status.encoding !== desc.innerHTML) {
          this.current.status.encoding = desc.innerHTML;
          (getService(bodyLayoutServiceId) as BodyLayoutService).reCompare(this.current.uid, null);
        } else
          this.statusbarWidget.style.display = 'none';
      }
    });

    const ul = $('ul');
    statusbarWidget.appendChild(ul);
    this.container.appendChild(statusbarWidget);

    this.parent.appendChild(this.container);
  }

  layout(): void {
    let dimension = dom.getClientArea(this.parent);
    // console.log('dimension =', dimension);
    dom.position(this.container, 0, 0, 0, 0, 'relative');
    dom.size(this.container, dimension.width, dimension.height);
    if(this.splitView.orientation === Orientation.HORIZONTAL)
      this.splitView.layout(dimension.width);
    else
      this.splitView.layout(dimension.height);

    (getService(menubarServiceId) as MenubarService).layout(dimension);

    this.position();
  }

  position(): void {
    // position status bar widget left in here
    const encoding: HTMLElement = document.querySelector('.part.statusbar div:nth-of-type(3)');
    // console.log(encoding.offsetLeft);
    this.statusbarWidget.style.left = encoding.offsetLeft + 'px';
  }

  installIpc(): void {
    /* window.ipc.on('menu click', (...args: any[]) => {
      console.log('menu click event is called ..');
      console.log('args[1] =', args[1]);
    }); */
  }

  startup(): void {
    this.create();
    (getService(bodyLayoutServiceId) as BodyLayoutService).inflate();
    this.layout();
    this.installIpc();

    const resize = () => {
      this.layout();
    };

    let resizeTimeout;
    let _handleResize = () => {
      if(resizeTimeout)
        clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 100);
    };

    window.addEventListener('resize', () => {
      // console.log('resize event is called ..');
      _handleResize();
    });

    /* window.ipc.send('menu enable', [
      { menu: 'merging:current change:push to left', enable: false },
      { menu: 'actions:expand all folders', enable: false },
      { menu: 'actions:collapse all folders', enable: false },
    ]); */
  }

  showStatusbarWidget(list: EncodingItem[]): void {
    const ul = this.statusbarWidget.querySelector('ul');
    dom.clearContainer(ul);

    let li: HTMLLIElement, label: HTMLSpanElement, desc: HTMLSpanElement;
    for(let i = 0; i < list.length; i++) {
      li = $('li');
      label = $('span.name');
      desc = $('span.desc');
      label.innerHTML = list[i].label;
      desc.innerHTML = list[i].description;
      li.appendChild(label);
      li.appendChild(desc);
      li.addEventListener('click', (e: MouseEvent) => {
        // do reopen with this encoding
        console.log(e.currentTarget);
        const desc = (e.currentTarget as HTMLElement).querySelector('span.desc');
        if(this.current.status.encoding !== desc.innerHTML) {
          this.current.status.encoding = desc.innerHTML;
          (getService(bodyLayoutServiceId) as BodyLayoutService).reCompare(this.current.uid, null);
        } else
          this.statusbarWidget.style.display = 'none';
      });
      ul.appendChild(li);
    }

    // add on to first item but guess
    let firstIndex = 0;
    if(list[firstIndex].description.toLowerCase().indexOf('guessed') > -1)
      firstIndex = 1;
    ul.children[firstIndex].classList.add('on');

    this.statusbarWidget.style.display = 'block';
    this.statusbarWidget.focus();
  }

  updateStatusbar(item: CompareItem): void {
    this.current = item; // { ...item };
    console.log('this.current =', this.current);
    (getService(statusbarPartServiceId) as StatusbarPartService).update(item);
  }

  clearStatusbar(): void {
    this.current = null;
    (getService(statusbarPartServiceId) as StatusbarPartService).clear();
  }

}