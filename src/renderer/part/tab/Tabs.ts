import { renderer } from "../..";
import { CompareItem } from "../../../common/Types";
import { Group } from "../../Types";
import { $ } from "../../util/dom";
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

      let _scrollLeft;
      if(scrollLeft + deltaX + clientWidth > scrollWidth) {
        // set to max scroll left
        _scrollLeft = scrollWidth - clientWidth;
      } else if(scrollLeft + deltaX < 0)
        _scrollLeft = 0;
      else
        _scrollLeft = scrollLeft + deltaX;

      this.writeScrollPosition({
        scrollLeft: _scrollLeft, scrollTop, scrollWidth, scrollHeight,
        clientLeft, clientTop, clientWidth, clientHeight
      });
    });

    scrollable.addEventListener('mouseover', (e: MouseEvent) => {});
    scrollable.addEventListener('mouseleave', (e: MouseEvent) => {});

    const arrow_left = this.arrow_left = $('.arrow.left.codicon.codicon-triangle-left');
    const arrow_right = this.arrow_right = $('.arrow.right.codicon.codicon-triangle-right');

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

  writeScrollPosition({
    scrollLeft, scrollTop, scrollWidth, scrollHeight,
    clientLeft, clientTop, clientWidth, clientHeight,
  }): void {
    // console.log('scrollLeft =', scrollLeft);
    // if(scrollWidth <= clientWidth) return;
    // if(scrollLeft+clientWidth > scrollWidth) return;
    this.scrollable.scrollLeft = scrollLeft;
    this.slider.style.left = (scrollLeft * clientWidth / scrollWidth).toFixed(2) + 'px';
    // console.log('this.slider.style.left =', this.slider.style.left);
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

  addItem(item: CompareItem): Tab {
    this.tabs.map((tab) => { tab.setClass({ active: false }); });

    const scrollable = this.scrollable;
    const tab: Tab = new Tab(scrollable, item);
    scrollable.insertBefore(tab.create(), scrollable.firstChild);
    this.tabs.splice(0, 0, tab);
    tab.setClass({ active: true });

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
    }

    return tab;
  }

  layout(): void {}

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

    const {
      scrollLeft, scrollTop, scrollWidth, scrollHeight,
      clientLeft, clientTop, clientWidth, clientHeight,
      offsetLeft, offsetTop, offsetWidth, offsetHeight
    } = this.scrollable;
    if(scrollWidth <= clientWidth) {
      this.arrow_left.style.display = 'none';
      this.arrow_right.style.display = 'none';
      this.scrollbar_h.classList.remove('visible');
      this.scrollbar_h.classList.add('invisible');
    } else {
      this.slider.style.width = (clientWidth / scrollWidth * 100).toFixed(2) + '%';
    }
  }
}