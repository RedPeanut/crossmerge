import { TerminalItem } from "../../../common/Types";
import { $ } from "../../util/dom";
import _, { DebouncedFunc } from 'lodash';
import { DropTarget } from "./DropTarget";
import { bodyLayoutServiceId, getService, sessionPartServiceId } from "../../Service";
import { BodyLayoutService } from "../../layout/BodyLayout";
import { SessionPartService } from "../SessionPart";
import { tree } from "../../../globals";
import { findActiveItem, findItemById } from "../../utils";
import { Mode } from "../../Types";

export const enum GroupDirection {
  UP, DOWN, LEFT, RIGHT
}

export interface DropOverlayOptions {}

export class DropOverlay {

  parent: HTMLElement;
  element: HTMLElement;
  group: TerminalItem[];
  target: DropTarget;

  //
  throttle_doPositionOverlay: DebouncedFunc<(...args: any[]) => any>;
  splitDirection: GroupDirection | undefined;

  sessionPartService: SessionPartService;
  bodyLayoutService: BodyLayoutService;

  constructor(parent: HTMLElement, group: TerminalItem[], target: DropTarget) {
    this.parent = parent;
    this.group = group;
    this.target = target;
    this.throttle_doPositionOverlay = _.throttle(this.doPositionOverlay.bind(this), 300, {trailing:false});
  }

  doPositionOverlay(e: any): void {
    // console.log('doPositionOverlay() is called..');
    let style: { top: string; left: string; width: string; height: string };

    const clientWidth = this.element.clientWidth;
    const clientHeight = this.element.clientHeight;

    let mousePosX = e.offsetX;
    let mousePosY = e.offsetY;

    // console.log('{clientWidth, clientHeight} =', {clientWidth, clientHeight});

    let edgeWidthThresholdFactor: number = 0.2; // 20% threshold to split
    let edgeHeightThresholdFactor: number = 0.2; // 20% threshold to split

    const edgeWidthThreshold = clientWidth * edgeWidthThresholdFactor;
    const edgeHeightThreshold = clientHeight * edgeHeightThresholdFactor;

    const splitWidthThreshold = clientWidth / 3; // offer to split left/right at 33%
    const splitHeightThreshold = clientHeight / 3; // offer to split up/down at 33%

    // No split if mouse is above certain threshold in the center of the view
    // this.splitDirection = undefined;
    if(
      mousePosX > edgeWidthThreshold && mousePosX < clientWidth - edgeWidthThreshold &&
      mousePosY > edgeHeightThreshold && mousePosY < clientHeight - edgeHeightThreshold
    ) {
      this.splitDirection = undefined;
    }

    // Offer to split otherwise
    else {

      // prefers to split vertically: offer a larger hitzone
      // for this direction like so:
      // ------------------------------------
      // |         |  SPLIT UP    |         |
      // |  SPLIT  |--------------|  SPLIT  |
      // |         |    MERGE     |         |
      // |  LEFT   |--------------|  RIGHT  |
      // |         |  SPLIT DOWN  |         |
      // ------------------------------------
      if(mousePosX < splitWidthThreshold) {
        this.splitDirection = GroupDirection.LEFT;
      } else if(mousePosX > splitWidthThreshold * 2) {
        this.splitDirection = GroupDirection.RIGHT;
      } else if(mousePosY < clientHeight / 2) {
        this.splitDirection = GroupDirection.UP;
      } else {
        this.splitDirection = GroupDirection.DOWN;
      }
    }

    // Draw overlay based on split direction
    switch(this.splitDirection) {
      case GroupDirection.UP:
        style = { top: '0', left: '0', width: '100%', height: '50%' };
        break;
      case GroupDirection.DOWN:
        style = { top: '50%', left: '0', width: '100%', height: '50%' };
        break;
      case GroupDirection.LEFT:
        style = { top: '0', left: '0', width: '50%', height: '100%' };
        break;
      case GroupDirection.RIGHT:
        style = { top: '0', left: '50%', width: '50%', height: '100%' };
        break;
      default:
        style = { top: '0', left: '0', width: '100%', height: '100%' };
    }

    this.target.element.style.top = style.top;
    this.target.element.style.left = style.left;
    this.target.element.style.width = style.width;
    this.target.element.style.height = style.height;

    // Make sure the overlay is visible now
    this.target.element.style.opacity = '1';
  }

  onDragStart(e: any): void {}
  onDragEnter(e: any): void {}
  onDragLeave(e: any): void {
    this.target.element.style.opacity = '0';
  }
  onDragEnd(e: any): void {}
  onDragOver(e: any): void {
    // console.log('onDragOver event is called...');
    e.preventDefault();
    this.throttle_doPositionOverlay(e);
  }

  onDrop(e: any): void {
    // console.log('onDrop event is called...');
    e.preventDefault();
    this.target.element.style.opacity = '0';

    // console.log(e.dataTransfer.getData('text/plain'));
    const drag_id = e.dataTransfer.getData('text/plain');

    // // find active item index
    // const find_active = findActiveItem(tree, 0, []);

    // find drag item
    const find_drag = findItemById(tree, 0, [], drag_id);
    console.log('find_drag =', find_drag);
    const { index: drag_index, pos: drag_pos, item: drag_item, group: drag_group, splitItem: drag_splitItem } = find_drag;

    // (tree.list[1] as TerminalItem[]).push(tree.list[0][1]);
    // (tree.list[0] as TerminalItem[]).pop();

    /*
    ex1) some simple case
    {
      mode: 'vertical',
      list: [
        [{a1},{a2}],
        [{b1}]
      ]
    }
    -> drop a2 left side of group1 : make split item
    {
      mode: 'vertical',
      list: [
        {
          mode: 'horizontal', list: [ [{moved}], [{a1}] ]
        },
        [{b1}]
      ]
    }

    -> drop a2 up side of group1
    {
      list: [
        [{moved}],
        [{a1}],
        [{b1}]
      ]
    }

    ex2) more complex case
    {
      mode: 'horizontal',
      list: [
        [{b1}],
        {
          mode:'vertical',
          list:[
            [{a1}],
            [{a2}]
          ]
        },
      ]
    }

    -> drop a2 to right of b1
    {
      mode: 'horizontal',
      list: [
        [{b1}],
        [{a2}]
        {
          mode:'vertical',
          list:[
            [{a1}],
          ]
        },
      ]
    }
    -> {
      mode: 'horizontal',
      list: [
        [{b1}],
        [{a2}]
        [{a1}],
      ]
    }

    -> drop a2 to right of a1
    {
      mode: 'horizontal',
      list: [
        [{b1}],
        {
          mode:'horizontal',
          list:[
            [{a1}],
            [{a2}]
          ]
        },
      ]
    }
    -> i think merge is more good
    {
      mode: 'horizontal',
      list: [
        [{b1}],
        [{a1}],
        [{a2}]
      ]
    }

    */
    switch(this.splitDirection) {
      // insert before
      case GroupDirection.UP:
      case GroupDirection.LEFT: {

        let mode: Mode = this.splitDirection === GroupDirection.UP ? 'vertical' : 'horizontal';

        /*
        if dropped split-item direction is different of the parent (split) item is to make split of current group
        equal is to make group
        */
        if(drag_splitItem.mode !== mode) {

        } else {

        }
        break;
      }
      // insert after
      case GroupDirection.DOWN:
      case GroupDirection.RIGHT: {
        break;
      }
      default: {
        break;
      }
    }

    // this.bodyLayoutService.recreate();
    // this.bodyLayoutService.layout(0, 0); // not use param
  }

  create(): HTMLElement {
    const el = this.element = $('.drop-overlay');
    el.ondragstart = this.onDragStart.bind(this);
    el.ondragenter = this.onDragEnter.bind(this);
    el.ondragleave = this.onDragLeave.bind(this);
    el.ondragend = this.onDragEnd.bind(this);
    el.ondragover = this.onDragOver.bind(this);
    el.ondrop = this.onDrop.bind(this);
    return el;
  }

  getServices(): void {
    this.sessionPartService = getService(sessionPartServiceId);
    this.bodyLayoutService = getService(bodyLayoutServiceId);
  }
}