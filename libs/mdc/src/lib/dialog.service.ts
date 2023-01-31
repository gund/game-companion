import type { MdcDialogElement } from '@game-companion/mdc/dialog';
import { html, render, when } from '@game-companion/lit';

export class DialogService {
  protected renderRoot;
  protected openedDialogs = new Set<DialogRef>();

  constructor(
    config?: DialogServiceConfig,
    protected document = globalThis.document
  ) {
    this.renderRoot = config?.renderRoot ?? this.document.body;
  }

  async open(options: OpenDialogOptions): Promise<DialogRef> {
    const dialogContainer = this.document.createElement('div');

    render(
      html`
        <mdc-dialog
          open
          ?fullscreen=${options.fullscreen}
          ?noTitleFix=${options.noTitleFix}
        >
          ${when(
            options.title,
            () => html`<span slot="title">${options.title}</span>`
          )}
          ${when(options.content, () => html`${options.content}`)}
        </mdc-dialog>
      `,
      dialogContainer
    );

    const dialogElem = dialogContainer.querySelector('mdc-dialog');

    if (!dialogElem) {
      throw new Error(`Unable to locate rendered mdc-dialog in HTML!`);
    }

    const dialogRef: SimpleDialogRef = new SimpleDialogRef(dialogElem, () =>
      this.openedDialogs.delete(dialogRef)
    );

    this.openedDialogs.add(dialogRef);
    this.renderRoot.appendChild(dialogElem);

    await import('@game-companion/mdc/dialog');

    return dialogRef;
  }

  async cloaseAll() {
    await Promise.all(
      Array.from(this.openedDialogs).map((dialog) => dialog.close())
    );
    this.openedDialogs.clear();
  }

  protected setElementContent(
    element: Element,
    content: string | Node | Node[]
  ) {
    if (typeof content === 'string') {
      element.textContent = content;
    } else if (Array.isArray(content)) {
      element.append(...content);
    } else {
      element.appendChild(content);
    }
  }
}

export class SimpleDialogRef implements DialogRef {
  constructor(
    protected dialogElem: MdcDialogElement,
    protected onClose: () => void
  ) {
    this.dialogElem.addEventListener(
      'MDCDialog:closed',
      () => this.handleClosed(),
      { once: true }
    );
  }

  getDialogElement(): MdcDialogElement {
    return this.dialogElem;
  }

  async close(action?: string) {
    this.dialogElem.close(action);
  }

  protected handleClosed() {
    this.dialogElem.remove();
    this.onClose();
  }
}

export interface DialogServiceConfig {
  renderRoot?: HTMLElement;
}

export interface OpenDialogOptions {
  title?: unknown;
  content?: unknown;
  fullscreen?: boolean;
  noTitleFix?: boolean;
}

export interface DialogRef {
  getDialogElement(): MdcDialogElement;
  close(action?: string): Promise<void>;
}
