import type { MDCDialogCloseEvent } from '@material/dialog';
import { html } from '@game-companion/lit';
import type { DialogService, OpenDialogOptions } from './dialog.service.js';

export class ConfirmDialogService {
  constructor(
    protected dialogService: DialogService,
    protected document = globalThis.document
  ) {}

  async confirm(options?: ConfirmDialogOptions): Promise<boolean> {
    await import('@game-companion/mdc/button');

    const dialogRef = await this.dialogService.open({
      ...options,
      title: options?.title ?? 'Are you sure?',
      content: html`
        ${options?.content}
        <mdc-button slot="actions" data-mdc-dialog-action="cancel">
          ${options?.noText ?? 'Cancel'}
        </mdc-button>
        <mdc-button
          slot="actions"
          raised
          data-mdc-dialog-action="confirm"
          data-mdc-dialog-button-default
          data-mdc-dialog-initial-focus
        >
          ${options?.yesText ?? 'Confirm'}
        </mdc-button>
      `,
    });

    return new Promise<boolean>((resolve) =>
      dialogRef
        .getElement()
        .addEventListener(
          'MDCDialog:closing',
          ((event: MDCDialogCloseEvent) =>
            resolve(event.detail.action === 'confirm')) as any,
          { once: true }
        )
    );
  }
}

export interface ConfirmDialogOptions extends OpenDialogOptions {
  yesText?: string;
  noText?: string;
}
