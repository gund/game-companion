import { html, ifDefined, render } from '@game-companion/lit';
import type {
  MdcSnackbarElement,
  MdcSnackbarMode,
} from '@game-companion/mdc/snackbar';

export class SnackbarService {
  protected renderRoot;
  protected openedSnackbars = new Set<SnackbarRef>();

  constructor(
    config?: SnackbarServiceConfig,
    protected document = globalThis.document
  ) {
    this.renderRoot = config?.renderRoot ?? this.document.body;
  }

  async open(options: OpenSnackbarOptions): Promise<SnackbarRef> {
    const snackbarContainer = this.document.createElement('div');

    render(
      html`
        <mdc-snackbar
          open
          ?hasDismiss=${options.hasDismiss}
          ?noCloseOnEscape=${options.noCloseOnEscape}
          mode=${ifDefined(options.mode)}
          timeoutMs=${ifDefined(options.timeoutMs)}
        >
          ${options.content}
        </mdc-snackbar>
      `,
      snackbarContainer
    );

    const snackbarElem = snackbarContainer.querySelector('mdc-snackbar');

    if (!snackbarElem) {
      throw new Error(`Unable to locate rendered mdc-snackbar in HTML!`);
    }

    const snackbarRef: SimpleSnackbarRef = new SimpleSnackbarRef(
      snackbarElem,
      () => this.openedSnackbars.delete(snackbarRef)
    );

    this.openedSnackbars.add(snackbarRef);
    this.renderRoot.appendChild(snackbarElem);

    await import('@game-companion/mdc/snackbar');

    return snackbarRef;
  }

  async cloaseAll() {
    await Promise.all(
      Array.from(this.openedSnackbars).map((snackbar) => snackbar.close())
    );
    this.openedSnackbars.clear();
  }
}

export interface SnackbarServiceConfig {
  renderRoot?: HTMLElement;
}

export interface OpenSnackbarOptions {
  content?: unknown;
  hasDismiss?: boolean;
  noCloseOnEscape?: boolean;
  mode?: MdcSnackbarMode;
  timeoutMs?: number;
}

export interface SnackbarRef {
  getElement(): MdcSnackbarElement;
  close(reason?: string): Promise<void>;
}

export class SimpleSnackbarRef implements SnackbarRef {
  constructor(
    protected snackbarElem: MdcSnackbarElement,
    protected onClose: () => void
  ) {
    this.snackbarElem.addEventListener(
      'MDCSnackbar:closed',
      () => this.handleClosed(),
      { once: true }
    );
  }

  getElement() {
    return this.snackbarElem;
  }

  async close(reason?: string) {
    this.snackbarElem.close(reason);
  }

  protected handleClosed() {
    this.snackbarElem.remove();
    this.onClose();
  }
}
