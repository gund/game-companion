import {
  classMap,
  createRef,
  css,
  customElement,
  html,
  ifDefined,
  LitElement,
  property,
  PropertyValueMap,
  queryAssignedElements,
  ref,
  repeat,
  state,
  unsafeCSS,
  when,
} from '@game-companion/lit';
import {
  asFormAssociatedInternal,
  formAssociatedMixin,
  hiddenStyles,
} from '@game-companion/mdc';
import '@game-companion/mdc/icons-link';
import listStyles from '@material/list/dist/mdc.list.min.css?inline';
import menuSurfaceStyles from '@material/menu-surface/dist/mdc.menu-surface.min.css?inline';
import menuStyles from '@material/menu/dist/mdc.menu.min.css?inline';
import { MDCSelect } from '@material/select';
import selectStyles from '@material/select/dist/mdc.select.min.css?inline';

declare global {
  interface HTMLElementTagNameMap {
    ['mdc-select']: MdcSelectElement;
  }
}

export type MdcSelectMode = 'filled' | 'outlined';

@customElement(MdcSelectElement.selector)
export class MdcSelectElement extends formAssociatedMixin(LitElement) {
  static readonly selector = 'mdc-select';
  static override styles = [
    unsafeCSS(listStyles),
    unsafeCSS(menuSurfaceStyles),
    unsafeCSS(menuStyles),
    unsafeCSS(selectStyles),
    hiddenStyles,
    css`
      :host {
        display: inline-block;
      }

      .mdc-select {
        width: 100%;
      }

      .mdc-list-item {
        padding: 8px 16px;
      }
    `,
  ];

  @property({ type: Boolean }) declare disabled: boolean;
  @property({ type: Boolean }) declare required: boolean;
  @property({ type: String }) declare mode: MdcSelectMode;
  @property({ type: String }) declare label: string;
  @property({ type: String }) declare name: string;
  @property({ type: String }) declare value: string;

  @queryAssignedElements({ selector: 'mdc-select-option' })
  protected declare optionsSlotted: HTMLElement[];

  @state() protected declare options: HTMLElement[];

  protected anchorRef = createRef<HTMLElement>();
  protected optionsSlotRef = createRef<HTMLSlotElement>();
  protected selectElement?: Element;
  protected select?: MDCSelect;

  protected updateOptions = () => {
    this.options = this.optionsSlotted.map(
      (option) => option.cloneNode(true) as HTMLElement
    );
    this.initSelect(this.selectElement);
  };

  constructor() {
    super();

    this.disabled = false;
    this.required = false;
    this.mode = 'filled';
    this.name = '';
    this.value = '';

    this.options = [];

    asFormAssociatedInternal(this).getInternals().role = 'combobox';
  }

  override focus(options?: FocusOptions) {
    this.anchorRef.value?.focus(options);
  }

  override blur() {
    this.anchorRef.value?.blur();
  }

  override click() {
    this.toggleMenu();
  }

  toggleMenu() {
    this.anchorRef.value?.click();
  }

  formDisabledCallback(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  formStateRestoreCallback(state: unknown) {
    this.setValue(String(state));
  }

  formResetCallback() {
    this.setValue(this.getAttribute('value') ?? '');
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    this.optionsSlotRef.value?.removeEventListener(
      'slotchange',
      this.updateOptions
    );
    this.select?.destroy();
    this.selectElement = undefined;
    this.select = undefined;
  }

  protected override render() {
    return html`<div
        class="mdc-select ${classMap(this.getClassMap())}"
        @MDCSelect:change=${this.handleChange}
        ${ref(this.initSelect)}
      >
        <div
          class="mdc-select__anchor"
          role="button"
          aria-haspopup="listbox"
          aria-expanded="false"
          aria-labelledby="label selected-text"
          ${ref(this.anchorRef)}
        >
          ${when(
            this.mode === 'filled',
            () => html`<span class="mdc-select__ripple"></span>
              <span id="label" class="mdc-floating-label">${this.label}</span>`,
            () => html`<span class="mdc-notched-outline">
              <span class="mdc-notched-outline__leading"></span>
              <span class="mdc-notched-outline__notch">
                <span id="label" class="mdc-floating-label">${this.label}</span>
              </span>
              <span class="mdc-notched-outline__trailing"></span>
            </span>`
          )}
          <span class="mdc-select__selected-text-container">
            <span id="selected-text" class="mdc-select__selected-text"></span>
          </span>
          <span class="mdc-select__dropdown-icon">
            <svg
              class="mdc-select__dropdown-icon-graphic"
              viewBox="7 10 10 5"
              focusable="false"
            >
              <polygon
                class="mdc-select__dropdown-icon-inactive"
                stroke="none"
                fill-rule="evenodd"
                points="7 10 12 15 17 10"
              ></polygon>
              <polygon
                class="mdc-select__dropdown-icon-active"
                stroke="none"
                fill-rule="evenodd"
                points="7 15 12 10 17 15"
              ></polygon>
            </svg>
          </span>
          ${when(
            this.mode === 'filled',
            () => html`<span class="mdc-line-ripple"></span>`
          )}
        </div>

        <div
          class="mdc-select__menu mdc-menu mdc-menu-surface mdc-menu-surface--fullwidth"
        >
          <ul
            class="mdc-list"
            role="listbox"
            aria-label=${ifDefined(this.label)}
          >
            ${repeat(
              this.options,
              (option) => html`<li
                class="mdc-list-item"
                aria-selected="false"
                data-value=${option.getAttribute('data-value')}
                role="option"
              >
                <span class="mdc-list-item__ripple"></span>
                <span class="mdc-list-item__text">${option}</span>
              </li>`
            )}
          </ul>
        </div>
      </div>
      <div class="hidden">
        <slot ${ref(this.optionsSlotRef)}></slot>
      </div>
      <mdc-icons-link></mdc-icons-link>`;
  }

  protected override firstUpdated() {
    this.optionsSlotRef.value?.addEventListener(
      'slotchange',
      this.updateOptions
    );

    this.updateOptions();
    this.updateValue('');
  }

  protected override willUpdate(
    changedProps: PropertyValueMap<MdcSelectElement>
  ) {
    if (changedProps.has('value')) {
      this.setValue(this.value);
    }

    if (changedProps.has('required')) {
      asFormAssociatedInternal(this).getInternals().ariaRequired = String(
        this.required
      );

      if (this.select) {
        this.select.required = this.required;
      }
    }

    if (changedProps.has('disabled')) {
      asFormAssociatedInternal(this).getInternals().ariaDisabled = String(
        this.disabled
      );

      if (this.select) {
        this.select.disabled = this.disabled;
      }
    }

    if (changedProps.has('label')) {
      asFormAssociatedInternal(this).getInternals().ariaLabel =
        this.label ?? null;
    }
  }

  protected getClassMap() {
    return {
      'mdc-select--filled': this.mode === 'filled',
      'mdc-select--outlined': this.mode === 'outlined',
      'mdc-select--disabled': this.disabled,
      'mdc-select--required': this.required,
    };
  }

  protected initSelect(element?: Element) {
    if (element) {
      this.select?.destroy();
      this.selectElement = element;
      setTimeout(() => {
        this.select = MDCSelect.attachTo(element);
        this.select.required = this.required;
        this.select.disabled = this.disabled;
      });
    }
  }

  protected handleChange(event: CustomEvent) {
    this.updateValue(event.detail.value);
  }

  protected updateValue(value: string) {
    this.value = value;
    asFormAssociatedInternal(this).getInternals().setFormValue(this.value);

    this.updateValidity();

    this.dispatchEvent(
      new Event('change', {
        bubbles: true,
        cancelable: true,
        composed: true,
      })
    );
  }

  protected updateValidity() {
    const validityState: ValidityStateFlags = {
      valueMissing: this.required && !this.value,
    };

    const validityMessage = validityState.valueMissing
      ? 'Please pick a value.'
      : '';

    asFormAssociatedInternal(this)
      .getInternals()
      .setValidity(validityState, validityMessage, this.anchorRef.value);
  }

  protected setValue(value: string) {
    if (value === this.value) {
      return;
    }

    if (this.select) {
      this.select.setValue(value, true);
    }
  }
}
