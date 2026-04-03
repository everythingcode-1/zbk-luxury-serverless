// Type declarations for EditorJS plugins without official types

declare module '@editorjs/marker' {
  import { BlockTool } from '@editorjs/editorjs';
  export default class Marker implements BlockTool {
    constructor(config: any);
    static get isInline(): boolean;
    render(): HTMLElement;
    surround(range: Range): void;
    checkState(selection: Selection): boolean;
    static get sanitize(): any;
  }
}

declare module '@editorjs/checklist' {
  import { BlockTool } from '@editorjs/editorjs';
  export default class Checklist implements BlockTool {
    constructor(config: any);
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
    validate(savedData: any): boolean;
    static get toolbox(): any;
    static get sanitize(): any;
  }
}

declare module '@editorjs/link' {
  import { BlockTool } from '@editorjs/editorjs';
  export default class LinkTool implements BlockTool {
    constructor(config: any);
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
    validate(savedData: any): boolean;
    static get toolbox(): any;
    static get sanitize(): any;
  }
}

declare module '@editorjs/raw' {
  import { BlockTool } from '@editorjs/editorjs';
  export default class RawTool implements BlockTool {
    constructor(config: any);
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
    static get toolbox(): any;
  }
}

declare module '@editorjs/embed' {
  import { BlockTool } from '@editorjs/editorjs';
  export default class Embed implements BlockTool {
    constructor(config: any);
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
    validate(savedData: any): boolean;
    static get toolbox(): any;
    static get sanitize(): any;
  }
}
