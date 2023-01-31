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
          ${options.content}
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
  getElement(): MdcDialogElement;
  close(action?: string): Promise<void>;
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

  getElement(): MdcDialogElement {
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
