import { renderer } from "../..";
import { CompareItem } from "../../../common/Types";
import { Group } from "../../Types";
import { $ } from "../../util/dom";
import * as dom from "../../util/dom";
import { Tab } from "./Tab";
import { DebouncedFunc } from "lodash";
import _ from "lodash";

export interface TabsOptions {}

export class Tabs {

  parent: HTMLElement;
  element: HTMLElement;
  scrollable: HTMLElement;
  scrollbar_h: HTMLElement;
  slider: HTMLElement;
  arrow_left: HTMLElement;
  arrow_right: HTMLElement;
  arrow_scrollInterval: NodeJS.Timeout;
  arrow_pressTimer: NodeJS.Timeout;
  arrow_isLongPress: boolean = false;

  // clientWidth: number;
  // scrollWidth: number;

  tabs: Tab[] = [];

  // throttle_scrolling: DebouncedFunc<(...args: any[]) => any>;

  constructor(parent: HTMLElement) {
    this.parent = parent;
    // this.throttle_scrolling = _.throttle(this.scrolling.bind(this), 50);
  }

  create(): HTMLElement {
    const el = this.element = $('.tabs');
    const scrollable = this.scrollable = $('.scrollable');

    /* scrollable.addEventListener('scroll', (e: Event) => {
      this.throttle_scrolling(e);
    }); */

    // delegate scroll to mouse wheel event for window support (throttling is better?)
    scrollable.addEventListener('wheel', (e: WheelEvent) => {
      // console.log('wheel event is called .., e =', e);

      let deltaX: number, deltaY: number;
      if(renderer.process.platform === 'win32') {
        deltaX = e.deltaY;
      } else {
        deltaX = e.deltaX;
      }

      // consume all event n write
      const el = e.currentTarget as HTMLElement;
      const {
        scrollLeft, scrollTop, scrollWidth, scrollHeight,
        clientLeft, clientTop, clientWidth, clientHeight,
      } = el;

      // console.log(`scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth} `);

      let _scrollLeft, MAX_SCROLL_LEFT = scrollWidth - clientWidth;
      if(scrollLeft + deltaX + clientWidth > scrollWidth) {
        _scrollLeft = MAX_SCROLL_LEFT;
      } else if(scrollLeft + deltaX < 0)
        _scrollLeft = 0;
      else
        _scrollLeft = scrollLeft + deltaX;

      this.scrollable.scrollLeft = _scrollLeft;
      // this.slider.style.left = (scrollLeft * clientWidth / scrollWidth).toFixed(2) + 'px';
      this.slider.style.left = Math.ceil(_scrollLeft * clientWidth / scrollWidth) + 'px';

      if(_scrollLeft === 0) {
        this.arrow_left.classList.add('disabled');
        this.arrow_right.classList.remove('disabled');
      } else if(_scrollLeft === MAX_SCROLL_LEFT) {
        this.arrow_left.classList.remove('disabled');
        this.arrow_right.classList.add('disabled');
      } else {
        this.arrow_left.classList.remove('disabled');
        this.arrow_right.classList.remove('disabled');
      }
    });

    scrollable.addEventListener('mouseover', (e: MouseEvent) => {});
    scrollable.addEventListener('mouseleave', (e: MouseEvent) => {});

    const arrow_left = this.arrow_left = $('.arrow.left.codicon.codicon-triangle-left');
    arrow_left.addEventListener('mousedown', (e: MouseEvent) => {
      // console.log('mousedown is called ..');
      this.arrow_isLongPress = false;

      this.arrow_pressTimer = setTimeout(() => {
        this.arrow_isLongPress = true;
        this.startScrolling('left');
      }, 200);
    });
    arrow_left.addEventListener('mouseup', (e: MouseEvent) => {
      // console.log('mouseup is called ..');
      clearTimeout(this.arrow_pressTimer);

      if(!this.arrow_isLongPress) {
        this.handleSingleClick('left');
      } else {
        this.stopScrolling();
      }
    });
    arrow_left.addEventListener('mouseleave', (e: MouseEvent) => {
      // console.log('mouseleave is called ..');
      clearTimeout(this.arrow_pressTimer);
      if(this.arrow_isLongPress) {
        this.stopScrolling();
      }
    });

    const arrow_right = this.arrow_right = $('.arrow.right.codicon.codicon-triangle-right');
    arrow_right.addEventListener('mousedown', (e: MouseEvent) => {
      // console.log('mousedown is called ..');
      this.arrow_isLongPress = false;

      this.arrow_pressTimer = setTimeout(() => {
        this.arrow_isLongPress = true;
        this.startScrolling('right');
      }, 200);
    });
    arrow_right.addEventListener('mouseup', (e: MouseEvent) => {
      // console.log('mouseup is called ..');
      clearTimeout(this.arrow_pressTimer);

      if(!this.arrow_isLongPress) {
        this.handleSingleClick('right');
      } else {
        this.stopScrolling();
      }
    });
    arrow_right.addEventListener('mouseleave', (e: MouseEvent) => {
      // console.log('mouseleave is called ..');
      clearTimeout(this.arrow_pressTimer);
      if(this.arrow_isLongPress) {
        this.stopScrolling();
      }
    });

    const scrollbar_h = this.scrollbar_h = $('.scrollbar.horizontal.invisible');
    const slider = this.slider = $('.slider');
    scrollbar_h.appendChild(slider);
    // scrollable.appendChild(scrollbar_h);
    // console.log(arrow_left.style.right);
    // console.log(arrow_left.clientWidth);
    scrollbar_h.style.left = `${16+1}px`;

    el.appendChild(arrow_left);
    el.appendChild(scrollable);
    el.appendChild(scrollbar_h);
    el.appendChild(arrow_right);
    return el;
  }

  handleSingleClick(direction: string) {
    const wheelEvent = new WheelEvent('wheel', { deltaX: direction === 'left' ? -50 : 50 });
    this.scrollable.dispatchEvent(wheelEvent);
  }

  startScrolling(direction: string) {
    this.stopScrolling();

    this.arrow_scrollInterval = setInterval(() => {
      const wheelEvent = new WheelEvent('wheel', { deltaX: direction === 'left' ? -10 : 10 });
      this.scrollable.dispatchEvent(wheelEvent);
    }, 10);
  }

  stopScrolling() {
    clearInterval(this.arrow_scrollInterval);
  }

  scrolling(e: Event): void {
    const {
      scrollLeft, scrollTop, scrollWidth, scrollHeight,
      clientLeft, clientTop, clientWidth, clientHeight,
      offsetLeft, offsetTop, offsetWidth, offsetHeight
    } = this.scrollable;

    // console.log(`clientLeft = ${clientLeft}, clientWidth = ${clientWidth}`);
    // console.log(`scrollLeft = ${scrollLeft}, scrollWidth = ${scrollWidth}`);

    if(scrollWidth <= clientWidth) return;
    if(scrollLeft+clientWidth > scrollWidth) return;

    // console.log((scrollLeft * clientWidth / scrollWidth).toFixed(2) + 'px');
    this.slider.style.left = (scrollLeft * clientWidth / scrollWidth).toFixed(2) + 'px';
  }

  setScrollVisibilyty() {
    const {
      clientLeft, clientTop, clientWidth, clientHeight,
      scrollLeft, scrollTop, scrollWidth, scrollHeight,
      offsetLeft, offsetTop, offsetWidth, offsetHeight
    } = this.scrollable;

    // console.log('this.scrollable.clientWidth = ', this.scrollable.clientWidth);
    // console.log('this.scrollable.scrollWidth = ', this.scrollable.scrollWidth);

    if(scrollWidth > clientWidth) {
      this.arrow_left.style.display = 'flex';
      this.arrow_right.style.display = 'flex';
      this.scrollbar_h.classList.remove('invisible');
      this.scrollbar_h.classList.add('visible');

      setTimeout(() => {
        const {
          clientLeft, clientTop, clientWidth, clientHeight,
          scrollLeft, scrollTop, scrollWidth, scrollHeight,
          offsetLeft, offsetTop, offsetWidth, offsetHeight
        } = this.scrollable;
        console.log(`clientWidth = ${clientWidth}, scrollWidth = ${scrollWidth}`);
        console.log((clientWidth / scrollWidth * 100).toFixed(2) + '%');
        this.slider.style.width = (clientWidth / scrollWidth * 100).toFixed(2) + '%';
      }, 10);
    } else {
      this.arrow_left.style.display = 'none';
      this.arrow_right.style.display = 'none';
      this.scrollbar_h.classList.remove('visible');
      this.scrollbar_h.classList.add('invisible');
    }
  }

  addItem(item: CompareItem): Tab {
    this.tabs.map((tab) => { tab.setClass({ active: false }); });

    const scrollable = this.scrollable;
    const tab: Tab = new Tab(scrollable, item);
    scrollable.insertBefore(tab.create(), scrollable.firstChild);
    this.tabs.splice(0, 0, tab);
    tab.setClass({ active: true });
    this.setScrollVisibilyty();
    return tab;
  }

  layout(): void {
    // console.log('layout() is called ..');
    // const dimension = dom.getClientArea(this.element);
    // console.log('dimension =', dimension);
    this.setScrollVisibilyty();
  }

  updateTabLabel(id: string, lhs: string, rhs: string): void {
    for(let i = 0; i < this.tabs.length; i++) {
      if(this.tabs[i].item.uid === id) {
        this.tabs[i].updateLabel(lhs, rhs);
        break;
      }
    }
  }

  callTabFn(id: string, fn: string): void {
    for(let i = 0; i < this.tabs.length; i++) {
      if(this.tabs[i].item.uid === id) {
        this.tabs[i][fn]();
        break;
      }
    }
  }

  active(id: string) {
    for(let i = 0; i < this.tabs.length; i++) {
      if(this.tabs[i].item.uid === id) this.tabs[i].setClass({ active: true });
      else this.tabs[i].setClass({ active: false });
    }
  }

  removeChild(idx: number) {
    this.scrollable.removeChild(this.tabs[idx].element);
    this.tabs.splice(idx, 1);
    // delete this.tabs[idx];
    this.setScrollVisibilyty();
  }
}