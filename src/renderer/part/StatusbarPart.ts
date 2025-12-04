import { AUTO_ENCODING_GUESS_MAX_BYTES, detectEncodingFromBuffer, guessEncodingByBuffer, SUPPORTED_ENCODINGS } from '../util/encoding';
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
  encoding: HTMLElement;

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
    <div class='encoding'></div>
    */

    const status = this.status = $('div.status');
    status.title = '';
    const position = this.position = $('div.position');
    position.title = 'Go to Line/Column';
    position.innerHTML = 'Ln NN, Col NN';
    position.style.display = 'none';
    const encoding = this.encoding = $('div.encoding');
    encoding.title = 'Reopen with Encoding';
    encoding.innerHTML = 'UTF-8';
    encoding.style.display = 'none';
    encoding.addEventListener('click', async (e) => {

      const path = (document.querySelectorAll('.input input')[0] as HTMLInputElement).value;

      const buffer: Buffer = await window.ipc.invoke('read file',
        // '/Users/kimjk/workspace/electron/fixture/mixed case/left/b/ba/baa.txt' // ascii
        // '/Users/kimjk/workspace/electron/fixture/mixed case/left/b/ba.txt' // euckr
        path
      );

      const limitedBuffer = buffer.slice(0, AUTO_ENCODING_GUESS_MAX_BYTES);
      const configuredEncoding = await window.ipc.invoke('config get', 'encoding');
      const detectedEncodingResult = await detectEncodingFromBuffer({buffer: limitedBuffer, bytesRead: limitedBuffer.byteLength}, true);
      // console.log(detectedEncoding);
      const guessedEncoding = detectedEncodingResult.encoding;

      const list: EncodingItem[] = Object.keys(SUPPORTED_ENCODINGS)
        .sort((k1, k2) => {
          // position configured encoding to top
          if(k1 === configuredEncoding) {
            return -1;
          } else if(k2 === configuredEncoding) {
            return 1;
          }
          return SUPPORTED_ENCODINGS[k1].order - SUPPORTED_ENCODINGS[k2].order;
        })
        .filter(k => {
          // do not show guessed encoding that does not match the configured
          if(k === guessedEncoding && guessedEncoding !== configuredEncoding)
            return false;
          return true;
        })
        .map((key, index) => {
          return { id: key, label: SUPPORTED_ENCODINGS[key].labelLong, description: key };
        });

      // insert guessed to top
      if(guessedEncoding && configuredEncoding !== guessedEncoding) {
        list.unshift({ id: guessedEncoding, label: SUPPORTED_ENCODINGS[guessedEncoding].labelLong, description: 'Guessed from content' });
      }

      // console.log(list);

      // lists in statusbar-widget & show
      const mainLayoutService = getService(mainLayoutServiceId) as MainLayoutService;
      mainLayoutService.showStatusbarWidget(list);
    });
    container.appendChild(status);
    container.appendChild(position);
    container.appendChild(encoding);
    return container;
  }

  update(item: CompareItem): void {
    this.uid = item.uid;
    if(item.type === 'file') {
      this.status.innerHTML = `${item.status.removal} removalㆍ${item.status.insertion} insertionㆍ${item.status.change} change`;
      this.position.style.display = 'block';
      this.encoding.innerHTML = `${SUPPORTED_ENCODINGS[item.status.encoding].labelShort}`;
      this.encoding.style.display = 'block';
    } else if(item.type === 'folder') {
      this.status.innerHTML = `${item.status.removed} removedㆍ${item.status.inserted} insertedㆍ${item.status.changed} changedㆍ${item.status.unchanged} unchanged`;
      this.position.style.display = 'none';
      this.encoding.style.display = 'none';
    }
    (getService(mainLayoutServiceId) as MainLayoutService).position();
  }

  clear(): void {
    this.status.innerHTML = '';
    this.position.innerHTML = '';
    this.encoding.innerHTML = '';
    this.position.style.display = 'none';
    this.encoding.style.display = 'none';
  }

  /* layoutContainer(offset: number): void {
    this._splitViewContainer.style.top = `${offset}px`;
    this._splitViewContainer.style.height = `${this._size}px`;
  } */
}