import {
  classMap,
  createRef,
  css,
  customElement,
  html,
  LitElement,
  property,
  PropertyValueMap,
  queryAssignedElements,
  ref,
  state,
  unsafeCSS,
  when,
} from '@game-companion/lit';
import { hiddenStyles, replayEvent } from '@game-companion/mdc';
import { MDCDialog } from '@material/dialog';
import dialogStyles from '@material/dialog/dist/mdc.dialog.min.css?inline';

declare global {
  interface HTMLElementTagNameMap {
    [MdcDialogElement.selector]: MdcDialogElement;
  }
}

@customElement(MdcDialogElement.selector)
export class MdcDialogElement extends LitElement {
  static readonly selector = 'mdc-dialog';
  static override styles = [
    unsafeCSS(dialogStyles),
    hiddenStyles,
    css`
      .mdc-dialog__title:not(.no-fix) ::slotted([slot='title']) {
        vertical-align: text-bottom;
      }
    `,
  ];

  @property({ type: Boolean, attribute: 'open', reflect: true })
  declare isOpen: boolean;
  @property({ type: Boolean }) declare fullscreen: boolean;
  @property({ type: Boolean }) declare noTitleFix: boolean;

  @queryAssignedElements({ slot: 'title' })
  protected declare titleSlotted: HTMLElement[];

  @queryAssignedElements({ slot: 'actions' })
  protected declare actionsSlotted: HTMLElement[];

  @state() declare titleExists: boolean;
  @state() declare actionsExist: boolean;

  protected titleSlotRef = createRef<HTMLSlotElement>();
  protected actionsSlotRef = createRef<HTMLSlotElement>();
  protected dialog?: MDCDialog;

  protected handleSlotChanges = () => {
    this.titleExists = this.titleSlotted.length > 0;
    this.actionsExist = this.actionsSlotted.length > 0;

    this.actionsSlotted.forEach((action) =>
      action.classList.add('mdc-dialog__button'),
    );
  };

  constructor() {
    super();

    this.isOpen = false;
    this.fullscreen = false;
    this.titleExists = false;
    this.actionsExist = false;
    this.noTitleFix = false;
  }

  open() {
    this.dialog?.open();
  }

  close(action?: string) {
    this.dialog?.close(action);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    this.titleSlotRef.value?.removeEventListener(
      'slotchange',
      this.handleSlotChanges,
    );
    this.actionsSlotRef.value?.removeEventListener(
      'slotchange',
      this.handleSlotChanges,
    );
    this.dialog?.destroy();
    this.dialog = undefined;
  }

  protected override render() {
    return html`<div
      class="mdc-dialog ${classMap(this.getDialogClassMap())}"
      @MDCDialog:opening=${this.syncOpen}
      @MDCDialog:closing=${this.syncOpen}
      @MDCDialog:opened=${replayEvent}
      @MDCDialog:closed=${replayEvent}
      ${ref(this.initDialog)}
    >
      <div class="mdc-dialog__container">
        <div
          class="mdc-dialog__surface"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-content"
        >
          <div class="mdc-dialog__header">
            <!-- prettier-ignore -->
            <h2
            class="mdc-dialog__title ${classMap(this.getTitleClassMap())}"
            id="dialog-title"
          ><slot name="title" ${ref(this.titleSlotRef)}></slot></h2>
            ${when(
              this.fullscreen,
              () => html`<mdc-icon-button
                class="mdc-dialog__close"
                icon="close"
                aria-label="Close"
                data-mdc-dialog-action="close"
              ></mdc-icon-button>`,
            )}
          </div>
          <div class="mdc-dialog__content" id="dialog-content">
            <slot></slot>
          </div>
          <div
            class="mdc-dialog__actions ${classMap(this.getActionsClassMap())}"
          >
            <slot name="actions" ${ref(this.actionsSlotRef)}></slot>
          </div>
        </div>
      </div>
      <div class="mdc-dialog__scrim"></div>
    </div>`;
  }

  protected override firstUpdated() {
    this.titleSlotRef.value?.addEventListener(
      'slotchange',
      this.handleSlotChanges,
    );
    this.actionsSlotRef.value?.addEventListener(
      'slotchange',
      this.handleSlotChanges,
    );

    this.handleSlotChanges();
  }

  protected override willUpdate(
    changedProps: PropertyValueMap<MdcDialogElement>,
  ) {
    if (changedProps.has('isOpen')) {
      if (this.isOpen) {
        this.open();
      } else {
        this.close('close');
      }
    }
  }

  protected initDialog(element?: Element) {
    if (element) {
      this.dialog?.destroy();

      setTimeout(() => {
        this.dialog = MDCDialog.attachTo(element);

        if (this.isOpen) {
          this.open();
        }
      });
    }
  }

  protected getDialogClassMap() {
    return {
      'mdc-dialog--fullscreen': this.fullscreen,
    };
  }

  protected getTitleClassMap() {
    return {
      hidden: !this.titleExists,
      'no-fix': this.noTitleFix,
    };
  }

  protected getActionsClassMap() {
    return {
      hidden: !this.actionsExist,
    };
  }

  protected syncOpen(event: CustomEvent) {
    this.isOpen = this.dialog?.isOpen ?? false;

    replayEvent.call(this, event);
  }
}
