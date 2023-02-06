import {
  adoptStyles,
  classMap,
  createRef,
  CSSResultOrNative,
  customElement,
  html,
  LitElement,
  property,
  PropertyValueMap,
  queryAssignedElements,
  ref,
  state,
  unsafeCSS,
} from '@game-companion/lit';
import { hiddenStyles, replayEvent } from '@game-companion/mdc';
import { MDCDrawer } from '@material/drawer';
import drawerStyles from '@material/drawer/dist/mdc.drawer.min.css?inline';

declare global {
  interface HTMLElementTagNameMap {
    [MdcDrawerElement.selector]: MdcDrawerElement;
  }
}

@customElement(MdcDrawerElement.selector)
export class MdcDrawerElement extends LitElement {
  static readonly selector = 'mdc-drawer';
  static override styles = [unsafeCSS(drawerStyles), hiddenStyles];

  @property({ type: Boolean, attribute: 'open', reflect: true })
  declare isOpen: boolean;
  @property({ type: Boolean }) declare dismissible: boolean;
  @property() declare drawerClass?: string;
  @property() declare extraStyles?: CSSResultOrNative[];

  @state() protected declare hasHeader: boolean;

  @queryAssignedElements({ slot: 'title' })
  protected declare titleSlotted: HTMLElement[];

  @queryAssignedElements({ slot: 'subtitle' })
  protected declare subtitleSlotted: HTMLElement[];

  protected drawer?: MDCDrawer;

  protected titleSlotRef = createRef<HTMLSlotElement>();
  protected subtitleSlotRef = createRef<HTMLSlotElement>();

  protected updateHasHeader = () => {
    this.hasHeader =
      this.titleSlotted.length > 0 || this.subtitleSlotted.length > 0;
  };

  constructor() {
    super();

    this.dismissible = false;
    this.isOpen = false;
    this.hasHeader = false;
  }

  open() {
    this.isOpen = true;
    this.syncOpen();
  }

  close() {
    this.isOpen = false;
    this.syncOpen();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.drawer?.destroy();
    this.drawer = undefined;

    this.titleSlotRef.value?.removeEventListener(
      'slotchange',
      this.updateHasHeader,
    );
    this.subtitleSlotRef.value?.removeEventListener(
      'slotchange',
      this.updateHasHeader,
    );
  }

  protected override render() {
    return html`
      <aside
        class="mdc-drawer ${classMap(this.getDrawerClassMap())}"
        @MDCDrawer:opened=${this.syncDrawer}
        @MDCDrawer:closed=${this.syncDrawer}
        ${ref(this.initDrawer)}
      >
        <div
          class="mdc-drawer__header ${classMap({ hidden: !this.hasHeader })}"
        >
          <h3 class="mdc-drawer__title">
            <slot name="title" ${ref(this.titleSlotRef)}></slot>
          </h3>
          <h6 class="mdc-drawer__subtitle">
            <slot name="subtitle" ${ref(this.subtitleSlotRef)}></slot>
          </h6>
        </div>
        <div class="mdc-drawer__content">
          <slot></slot>
        </div>
      </aside>
    `;
  }

  protected override willUpdate(
    changedProps: PropertyValueMap<MdcDrawerElement>,
  ) {
    if (changedProps.has('isOpen')) {
      this.syncOpen();
    }
    if (changedProps.has('extraStyles')) {
      adoptStyles(this.renderRoot as ShadowRoot, [
        ...(this.constructor as typeof MdcDrawerElement).styles,
        ...(this.extraStyles ?? []),
      ]);
    }
  }

  protected override firstUpdated() {
    this.titleSlotRef.value?.addEventListener(
      'slotchange',
      this.updateHasHeader,
    );
    this.subtitleSlotRef.value?.addEventListener(
      'slotchange',
      this.updateHasHeader,
    );

    this.updateHasHeader();
  }

  protected initDrawer(element?: Element) {
    if (element) {
      this.drawer = MDCDrawer.attachTo(element);
      this.syncOpen();
    }
  }

  protected getDrawerClassMap() {
    return {
      'mdc-drawer--modal': !this.dismissible,
      'mdc-drawer--dismissible': this.dismissible,
      [this.drawerClass ?? '']: !!this.drawerClass,
    };
  }

  protected syncOpen(isOpen = this.isOpen) {
    if (isOpen !== this.isOpen) {
      this.isOpen = isOpen;
    }

    if (this.drawer) {
      this.drawer.open = this.isOpen;
    }
  }

  protected syncDrawer(event: Event) {
    this.syncOpen(this.drawer?.open);
    replayEvent.call(this, event);
  }
}
