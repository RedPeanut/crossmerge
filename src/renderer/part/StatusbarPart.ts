import { CompareItem } from '../../common/Types';
import { MainLayoutService, STATUSBAR_HEIGHT } from '../layout/MainLayout';
import { Part } from '../Part';
import { getService, mainLayoutServiceId, setService, statusbarPartServiceId } from '../Service';
import { $ } from '../util/dom';
import { EncodingItem } from '../Types';

export interface StatusbarPartService {
  update(item: CompareItem): void;
  clear(): void;
}

export class StatusbarPart extends Part implements StatusbarPartService {

  // span: HTMLElement;
  uid: string;
  status: HTMLElement;
  position: HTMLElement;
  charset: HTMLElement;

  constructor(parent: HTMLElement, id: string, role: string, classes: string[], options: object) {
    super(parent, id, role, classes, options);
    this.size = STATUSBAR_HEIGHT;
    this.sashEnablement = false;
    setService(statusbarPartServiceId, this);
  }

  override createContentArea(): HTMLElement {
    const container: HTMLElement = super.createContentArea();
    // const span = this.span = $('span');
    // container.appendChild(span);

    /*
    <div class='status'></div>
    <div class='position'></div>
    <div class='charset'></div>
    */

    const status = this.status = $('div.status');
    status.title = '';
    const position = this.position = $('div.position');
    position.title = 'Go to Line/Column';
    position.innerHTML = 'Ln NN, Col NN';
    // position.style.display = 'none';
    const charset = this.charset = $('div.charset');
    charset.title = 'Reopen with Encoding';
    charset.innerHTML = 'UTF-8';
    // charset.style.display = 'none';
    charset.addEventListener('click', async (e) => {
      const list: EncodingItem[] = [
        { label: 'blarblarblar', description: 'description1' },
        { label: 'blarblarblar', description: 'description2' },
        { label: 'blarblarblar', description: 'description3' },
      ];
      const mainLayoutService = getService(mainLayoutServiceId) as MainLayoutService;
      mainLayoutService.showStatusbarWidget(list);
    });
    container.appendChild(status);
    container.appendChild(position);
    container.appendChild(charset);
    return container;
  }

  update(item: CompareItem): void {
    this.uid = item.uid;
    if(item.type === 'file') {
      this.status.innerHTML = `${item.status.removal} removalㆍ${item.status.insertion} insertionㆍ${item.status.change} change`;
      this.position.style.display = 'block';
      this.charset.style.display = 'block';
    } else if(item.type === 'folder') {
      this.status.innerHTML = `${item.status.removed} removedㆍ${item.status.inserted} insertedㆍ${item.status.changed} changedㆍ${item.status.unchanged} unchanged`;
      this.position.style.display = 'none';
      this.charset.style.display = 'none';
    }
  }

  clear(): void {
    this.status.innerHTML = ``;
  }

  /* layoutContainer(offset: number): void {
    this._splitViewContainer.style.top = `${offset}px`;
    this._splitViewContainer.style.height = `${this._size}px`;
  } */
}