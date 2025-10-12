import { coalesce } from '../util/arrays';
import { isLinux, isWindows } from '../../common/util/platform';
import { Layout } from '../Layout';
import { TitlebarPart } from '../part/TitlebarPart';
// import { BodyPart } from '../part/BodyPart';
import { StatusbarPart } from '../part/StatusbarPart';
import { BodyLayout, BodyLayoutService } from './BodyLayout';
import { SplitView } from '../component/SplitView';
import { $ } from '../util/dom';
import * as dom from '../util/dom';
import { Orientation } from '../component/Sash';
import { bodyLayoutServiceId, getService, Service, setService, mainLayoutServiceId, menubarServiceId as menubarServiceId } from '../Service';
import { CompareFolderData } from '../../common/Types';
import { MenubarService } from '../part/Menubar';

export const TITLEBAR_HEIGHT = 83;
export const STATUSBAR_HEIGHT = 22;

export const enum Parts {
  TITLEBAR_PART = 'part.titlebar',
  BODY_LAYOUT = 'layout.body',
  STATUSBAR_PART = 'part.statusbar'
}

export interface MainLayoutService extends Service {
  layout(): void;
}

export class MainLayout extends Layout implements MainLayoutService {

  layoutContainer(offset: number): void {
    throw new Error('Method not implemented.');
  }

  titlebarPart: TitlebarPart;
  bodyLayout: BodyLayout;
  statusbarPart: StatusbarPart;
  splitView: SplitView<TitlebarPart | BodyLayout | StatusbarPart>;

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
  }

  bodyLayoutService: BodyLayoutService;

  getServices(): void {
    this.bodyLayoutService = getService(bodyLayoutServiceId);
    this.bodyLayoutService.getServices();
  }

  installIpc(): void {
    /* window.ipc.on('menu click', (...args: any[]) => {
      console.log('menu click event is called ..');
      console.log('args[1] =', args[1]);
    }); */
  }

  startup(): void {
    this.create();
    this.getServices();
    this.bodyLayoutService.inflate();
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
}