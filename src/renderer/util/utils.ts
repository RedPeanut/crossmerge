// down-ward
export function recur_select(tree: HTMLElement, fn: (node) => void): void {
  for(let i = 0; i < tree.childNodes.length; i++) {
    const child = tree.childNodes[i] as HTMLElement;

    if(child.classList.contains('content')) continue;
      if(child.classList.contains('node')) {
        fn(child);
        recur_select(child, fn);
      }
  }
}

// top-ward
export function recur_expand(node: HTMLElement): void {
  if(node.classList.contains('tree')) {
    // stop condition
  } else {
    if(node.classList.contains('collapsed'))
      node.classList.remove('collapsed');
    if(node.parentElement)
      recur_expand(node.parentElement);
  }
}