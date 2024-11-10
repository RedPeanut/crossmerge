export abstract class Layout {

  readonly mainContainer = document.createElement('div');

  constructor(
    protected readonly parent: HTMLElement
  ) {
    
  }
  
}