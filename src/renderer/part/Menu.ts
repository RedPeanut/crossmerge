import { renderer } from "..";
import { SerializableMenuItem } from "../../common/Types";
import { $ } from "../util/dom";

export interface MenuOptions {}

export class Menu {

  container: HTMLElement;
  // container: HTMLElement;
  // element: HTMLElement;
  focusedItem;

  constructor(container: HTMLElement) {
    this.container = container;

    this.container.tabIndex = -1;
    container.addEventListener('keydown', (e: KeyboardEvent) => {
      console.log('e.key =', e.key);

    });
    container.addEventListener('focusin', (e: KeyboardEvent) => {
      console.log('focusin is called ..');
    });
    container.addEventListener('focusout', (e: KeyboardEvent) => {
      console.log('focusout is called ..');
    });

    window.addEventListener('mousedown', (e) => {
      console.log('mousedown is called ..');
    });
  }

  install(): void {
    this.createHamburgurMenu(this.container);
    this.createMenu(this.container);
    // this.parent.appendChild(this.container);
  }

  createMenu_r(container: HTMLElement, menuItem: SerializableMenuItem, level: number): void {
    const menubox = $('ul.menubox');
    if(level > 0) menubox.classList.add('sub');

    for(let i = 0; i < menuItem.submenu.length; i++) {
      const submenuItem = menuItem.submenu[i];
      const li = $('li.item');
      if(submenuItem.type === 'separator')
        li.classList.add('separator');
      else {
        li.addEventListener('mouseover', (e) => {});
        li.addEventListener('mouseleave', (e) => {});
        li.addEventListener('focusout', (e) => {});

        const a = $('a');
        li.appendChild(a);

        const label = $('span.label');
        label.innerHTML = submenuItem.label.replace(/&/g, '');
        a.appendChild(label);

        const padding = $('span.padding');
        a.appendChild(padding);

        if(submenuItem.accelerator) {
          const keybiding = $('span.keybinding');
          keybiding.innerHTML = submenuItem.accelerator;
          a.appendChild(keybiding);
        }

        if(submenuItem.submenu && submenuItem.submenu.length > 0) {
          const indicator = $('span.indicator.codicon.codicon-chevron-right');
          a.appendChild(indicator);
          this.createMenu_r(li, submenuItem, level+1);
        }
      }
      menubox.appendChild(li);
    }
    container.appendChild(menubox);
  }

  createHamburgurMenu(container: HTMLElement) {
    const button = $('.button.hamburger');
    button.addEventListener('click', (e) => {
      // console.log('e.target =', e.target);
      (e.currentTarget as HTMLElement).classList.toggle('on');
    });

    const title = $('.title.codicon.codicon-menu');
    button.appendChild(title);
    // container.appendChild(button);

    const menubox = $('ul.menubox');
    for(let i = 0; i < renderer.menu.length; i++) {
      const menuItem = renderer.menu[i];
      const li = $('li.item');

      if(menuItem.type === 'separator')
        li.classList.add('separator');
      else {
        li.addEventListener('mouseover', (e) => { (e.currentTarget as HTMLElement).classList.add('on');  });
        li.addEventListener('mouseleave', (e) => { (e.currentTarget as HTMLElement).classList.remove('on'); });
        li.addEventListener('focusout', (e) => { (e.currentTarget as HTMLElement).classList.remove('on'); });

        const a = $('a');
        li.appendChild(a);

        const label = $('span.label');
        label.innerHTML = menuItem.label.replace(/&/g, '');
        a.appendChild(label);

        const padding = $('span.padding');
        a.appendChild(padding);

        if(menuItem.submenu && menuItem.submenu.length > 0) {
          const indicator = $('span.indicator.codicon.codicon-chevron-right');
          a.appendChild(indicator);
          this.createMenu_r(li, menuItem, 1);
        }
      }
      menubox.appendChild(li);
    }
    button.appendChild(menubox);
    container.appendChild(button);
  }

  createMenu(container: HTMLElement) {

    for(let i = 0; i < renderer.menu.length; i++) {
      const menuItem = renderer.menu[i];
      // console.log('['+index+']', menuItem);
      const button = $('.button');
      // button.innerHTML = item.label.replace(/&/g, '');
      button.addEventListener('click', (e) => {
        // console.log('e.target =', e.target);
        (e.currentTarget as HTMLElement).classList.toggle('on');
      });

      button.addEventListener('mouseover', (e) => {
        // any menu on-ed (clicked) n over on not on-ed → change on
      });
      button.addEventListener('mouseout', (e) => {});
      button.addEventListener('keydown', (e) => {});

      const title = $('.title');
      title.innerHTML = menuItem.label.replace(/&/g, '');
      button.appendChild(title);

      this.createMenu_r(button, menuItem, 0);
      container.appendChild(button);
    }
  }

}