// import { MenuEvent, MenuItem, PopupOptions, SerializableMenuItem } from "../Types";
import { MenuEvent, MenuItem, PopupOptions, SerializableMenuItem } from "../../common/Types";

let contextMenuIdPool = 0;

///*
export function popup(items: MenuItem[], options?: PopupOptions, onHide?: () => void): void {
  const processedItems: MenuItem[] = [];

  const contextMenuId = contextMenuIdPool++;
  const onClickChannel = `contextmenu on ${contextMenuId}`;
  const onClickChannelHandler = (event: unknown, itemId: number, context: MenuEvent) => {
    console.log('once channelHandler is called ..');
    // console.log('itemId =', itemId);
    // console.log('context =', context);

    const item = processedItems[itemId];
    item.click?.(context);
  };
  window.ipc.once(onClickChannel, onClickChannelHandler);

  window.ipc.once('contextmenu close', (event: unknown, closedContextMenuId: number) => {
    console.log('once contextmenu close is called ..');
    // console.log('closedContextMenuId =', closedContextMenuId);

    if(closedContextMenuId !== contextMenuId)
      return;

    // TODO: check off is working properly
    window.ipc.off(onClickChannel, onClickChannelHandler);
    onHide?.();
  });

  // const serializableItems: SerializableContextMenuItem[] = items.map(item => createItem(item, processedItems));
  window.ipc.send('contextmenu', contextMenuId, items.map(item => createItem(item, processedItems)), onClickChannel, options);
}
//*/

function createItem(item: MenuItem, processedItems: MenuItem[]): SerializableMenuItem {
  const serializableItem: SerializableMenuItem = {
    id: processedItems.length,
    label: item.label,
    type: item.type,
    accelerator: item.accelerator,
    checked: item.checked,
    enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
    visible: typeof item.visible === 'boolean' ? item.visible : true
  };

  processedItems.push(item);

  // Submenu
  if(Array.isArray(item.submenu)) {
    serializableItem.submenu = item.submenu.map(submenuItem => createItem(submenuItem, processedItems));
  }

  return serializableItem;
}