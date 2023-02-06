import {
  customElement,
  html,
  LitElement,
  property,
  PropertyValueMap,
  ref,
  unsafeCSS,
} from '@game-companion/lit';
import { MDCSwitch } from '@material/switch';
import switchStyles from '@material/switch/dist/mdc.switch.min.css?inline';

declare global {
  interface HTMLElementTagNameMap {
    [MdcSwitchElement.selector]: MdcSwitchElement;
  }
}

@customElement(MdcSwitchElement.selector)
export class MdcSwitchElement extends LitElement {
  static readonly selector = 'mdc-switch';
  static override styles = [unsafeCSS(switchStyles)];

  @property({ type: Boolean, reflect: true }) declare selected: boolean;
  @property({ type: Boolean }) declare disabled: boolean;

  protected switch?: MDCSwitch;

  constructor() {
    super();

    this.selected = false;
    this.disabled = false;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.switch?.destroy();
    this.switch = undefined;
  }

  protected override render() {
    return html`
      <button
        id="switch"
        class="mdc-switch mdc-switch--unselected"
        type="button"
        role="switch"
        aria-checked="false"
        @click=${this.updateSyncState}
        ${ref(this.initSwitch)}
      >
        <div class="mdc-switch__track"></div>
        <div class="mdc-switch__handle-track">
          <div class="mdc-switch__handle">
            <div class="mdc-switch__shadow">
              <div class="mdc-elevation-overlay"></div>
            </div>
            <div class="mdc-switch__ripple"></div>
            <div class="mdc-switch__icons">
              <svg
                class="mdc-switch__icon mdc-switch__icon--on"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19.69,5.23L8.96,15.96l-4.23-4.23L2.96,13.5l6,6L21.46,7L19.69,5.23z"
                />
              </svg>
              <svg
                class="mdc-switch__icon mdc-switch__icon--off"
                viewBox="0 0 24 24"
              >
                <path d="M20 13H4v-2h16v2z" />
              </svg>
            </div>
          </div>
        </div>
      </button>
      <label for="switch">
        <slot></slot>
      </label>
    `;
  }

  protected override willUpdate(
    changedProps: PropertyValueMap<MdcSwitchElement>,
  ) {
    if (changedProps.has('selected')) {
      this.syncSelected(this.selected);
    }

    if (changedProps.has('disabled')) {
      this.syncDisabled();
    }
  }

  protected initSwitch(element?: Element) {
    if (element) {
      this.switch?.destroy();
      this.switch = MDCSwitch.attachTo(element as HTMLButtonElement);
      this.syncSelected(this.selected);
      this.syncDisabled();
    }
  }

  protected syncSelected(selected?: boolean) {
    if (selected !== undefined && selected !== this.selected) {
      this.selected = selected;
      this.dispatchEvent(
        new Event('change', { bubbles: true, composed: true }),
      );
    }

    if (this.switch) {
      this.switch.selected = this.selected;
    }
  }

  protected syncDisabled() {
    if (this.switch) {
      this.switch.disabled = this.disabled;
    }
  }

  protected updateSyncState() {
    setTimeout(() => this.syncSelected(this.switch?.selected));
  }
}
