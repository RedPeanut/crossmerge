interface Item { what: HTMLElement, cb: (...args: any[]) => void }

/**
 * 브라우저 포커스 처리와 좀 다르게 처리하기위해
 * = 등록되지 않은 엘리먼트로의 포커스 이동 무시를 위해
 * = Input 컴포넌트의 관련 리스트 항목 클릭이 가능하게 하기 위해
 */
export class FocusManager {

  list: Item[] = [];

  register(what: HTMLElement, cb: (...args: any[]) => void = null) {
    this.list.push({what, cb});
    what.addEventListener('focus', (e: FocusEvent) => {
      // (e.currentTarget as HTMLElement)
      for(let i = 0; i < this.list.length; i++) {
        const item: Item = this.list[i];
        if(item.what === e.currentTarget) {
          (e.currentTarget as HTMLElement).classList.add('focus');
          if(item.cb) item.cb('focus');
        } else {
          item.what.classList.remove('focus');
          if(item.cb) item.cb('focusout');
        }
      }
    });
  }
}