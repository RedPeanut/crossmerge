import { coalesce } from '../util/arrays';
import { isLinux, isWindows } from '../util/platform';
import { Layout } from '../Layout';
import { TitlebarPart } from '../part/TitlebarPart';
// import { BodyPart } from '../part/BodyPart';
import { StatusbarPart } from '../part/StatusbarPart';
import { BodyLayout, BodyLayoutService } from './BodyLayout';
import { SplitView } from '../component/SplitView';
import { getClientArea, position, size } from '../util/dom';
import { Orientation } from '../component/Sash';
import { bodyLayoutServiceId, getService, Service, setService, mainLayoutServiceId } from '../Service';
// import Runtime from './Runtime';

export const TITLEBAR_HEIGHT = 42;
export const STATUSBAR_HEIGHT = 22;

export const enum Parts {
  TITLEBAR_PART = 'part.titlebar',
  BODY_LAYOUT = 'layout.body',
  STATUSBAR_PART = 'part.statusbar'
}

export interface MainLayoutService extends Service {
  toggleSidebar(): void;
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
    const platformClass = isWindows ? 'windows' : isLinux ? 'linux' : 'mac'; //Runtime.isWindows ? 'windows' : Runtime.isLinux ? 'linux' : 'mac';
    const mainLayoutClasses = coalesce(['main', 'layout', platformClass]);
    this.mainContainer.classList.add(...mainLayoutClasses);

    const titlebarPart = this.titlebarPart = new TitlebarPart(null, Parts.TITLEBAR_PART, 'none', ['titlebar'], null);
    titlebarPart.create();

    const bodyLayout = this.bodyLayout = new BodyLayout(null, { sizeType: 'fill_parent' });
    bodyLayout.create();

    const statusbarPart = this.statusbarPart = new StatusbarPart(null, Parts.STATUSBAR_PART, 'none', ['statusbar'], null);
    statusbarPart.create();

    const splitView = this.splitView = new SplitView(this.mainContainer, { orientation: Orientation.VERTICAL });
    splitView.addView(titlebarPart);
    splitView.addView(bodyLayout);
    splitView.addView(statusbarPart);

    this.parent.appendChild(this.mainContainer);
  }

  /* createPart<T extends Part>(
      // https://stackoverflow.com/questions/24677592/generic-type-inference-with-class-argument/26696435#26696435
      // According to the language spec, need to refer to the class type by it's ctor fn.
      klass: { new(id: string, role: string, classes: string[], options: object): T; },
      id: string,
      role: string,
      classes: string[],
      options: {}
  ): Part {
    const part = new klass(id, role, classes, options);
    return part;
  } */

  /* createPart(id: string, role: string, classes: string[]): HTMLElement {
    const part = document.createElement('div');
    part.classList.add('part', ...classes);
    part.id = id;
    part.setAttribute('role', role);
    return part;
  } */

  layout(): void {
    let dimension = getClientArea(this.parent);
    // console.log('dimension =', dimension);
    position(this.mainContainer, 0, 0, 0, 0, 'relative');
    size(this.mainContainer, dimension.width, dimension.height);
    if(this.splitView.orientation === Orientation.HORIZONTAL)
      this.splitView.layout(dimension.width);
    else
      this.splitView.layout(dimension.height);
  }

  bodyLayoutService: BodyLayoutService;

  getServices(): void {
    this.bodyLayoutService = getService(bodyLayoutServiceId);
    this.bodyLayoutService.getServices();
  }

  installIpc(): void {
    window.ipc.on('sample data', (...args: any[]) => {
    });
  }

  startup(): void {
    this.create();
    this.getServices();
    this.bodyLayoutService.inflate();
    this.layout();
    this.installIpc();
  }

  toggleSidebar(): void {
    throw new Error('Method not implemented.');
  }

}