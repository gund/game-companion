import {
  classMap,
  createRef,
  css,
  customElement,
  html,
  ifDefined,
  LitElement,
  live,
  property,
  PropertyValueMap,
  ref,
  unsafeCSS,
  when,
} from '@game-companion/lit';
import {
  asFormAssociatedInternal,
  formAssociatedMixin,
} from '@game-companion/mdc';
import '@game-companion/mdc/icons-link';
import floatingLabelStyles from '@material/floating-label/dist/mdc.floating-label.min.css?inline';
import lineRippleStyles from '@material/line-ripple/dist/mdc.line-ripple.min.css?inline';
import notchedOutlineStyles from '@material/notched-outline/dist/mdc.notched-outline.min.css?inline';
import { MDCTextField } from '@material/textfield';
import { MDCTextFieldIcon } from '@material/textfield/icon';
import textFieldStyles from '@material/textfield/dist/mdc.textfield.min.css?inline';

declare global {
  interface HTMLElementTagNameMap {
    'mdc-text-field': MdcTextFieldElement;
  }
}

export type MdcTextFieldMode = 'filled' | 'outlined';

@customElement(MdcTextFieldElement.selector)
export class MdcTextFieldElement extends formAssociatedMixin(LitElement) {
  static readonly selector = 'mdc-text-field';
  static override styles = [
    unsafeCSS(floatingLabelStyles),
    unsafeCSS(lineRippleStyles),
    unsafeCSS(notchedOutlineStyles),
    unsafeCSS(textFieldStyles),
    css`
      .mdc-text-field {
        width: 100%;
      }
    `,
  ];

  @property({ type: Boolean }) declare disabled: boolean;
  @property({ type: Boolean }) declare required: boolean;
  @property({ type: Boolean }) declare readonly: boolean;
  @property({ type: String }) declare mode: MdcTextFieldMode;
  @property({ type: String }) declare type: string;
  @property({ type: String }) declare name: string;
  @property({ type: String }) declare value: string;
  @property({ type: String }) declare label?: string;
  @property({ type: String }) declare placeholder?: string;
  @property({ type: String }) declare min?: string;
  @property({ type: String }) declare max?: string;
  @property({ type: String }) declare step?: string;
  @property({ type: String }) declare minlength?: string;
  @property({ type: String }) declare maxlength?: string;
  @property({ type: String }) declare pattern?: string;
  @property({ type: String }) declare leadingIcon?: string;
  @property({ type: String }) declare leadingIconLabel?: string;
  @property({ type: String }) declare trailingIcon?: string;
  @property({ type: String }) declare trailingIconLabel?: string;

  protected inputRef = createRef<HTMLInputElement>();
  protected textField?: MDCTextField;
  protected leadingTextIcon?: MDCTextFieldIcon;
  protected trailingTextIcon?: MDCTextFieldIcon;
  protected lastTabIndex = '0';

  protected handleFocus = () => this.focus();
  protected handleBlur = () => this.restoreTabIndex();

  constructor() {
    super();

    this.disabled = false;
    this.required = false;
    this.readonly = false;
    this.mode = 'filled';
    this.type = 'text';
    this.name = '';
    this.value = '';

    asFormAssociatedInternal(this).getInternals().role = 'textbox';
  }

  override focus(options?: FocusOptions) {
    this.updateTabIndex('-1');
    this.inputRef.value?.focus(options);
  }

  override blur() {
    this.inputRef.value?.blur();
  }

  formDisabledCallback(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  formStateRestoreCallback(state: unknown) {
    this.updateValue(String(state));
  }

  formResetCallback() {
    this.updateValue(this.getAttribute('value') ?? '');
  }

  protected override render() {
    return html`<label
        class="mdc-text-field ${classMap(this.getLabelClassMap())}"
        aria-hidden="true"
        ${ref(this.initTextField)}
      >
        ${when(
          this.mode === 'filled',
          () => html`<span class="mdc-text-field__ripple"></span>
            <span class="mdc-floating-label" id="label">${this.label}</span>`,
          () => html`<span class="mdc-notched-outline">
            <span class="mdc-notched-outline__leading"></span>
            <span class="mdc-notched-outline__notch"></span>
            <span class="mdc-floating-label" id="label">${this.label}</span>
            <span class="mdc-notched-outline__trailing"></span>
          </span>`
        )}
        ${when(
          this.leadingIcon,
          () =>
            html`<i
              class="material-icons mdc-text-field__icon mdc-text-field__icon--leading"
              tabindex="0"
              role="button"
              aria-label=${ifDefined(this.leadingIconLabel)}
              @click=${{
                handleEvent: () =>
                  this.handleIconClick('leading', this.leadingIconLabel),
              }}
              ${ref(this.initLeadingIcon)}
              >${this.leadingIcon}</i
            >`
        )}
        <slot name="control">
          <input
            class="mdc-text-field__input"
            tabindex="-1"
            aria-hidden="true"
            type=${this.type}
            name=${ifDefined(this.name)}
            .value=${live(this.value)}
            ?disabled=${this.disabled}
            ?required=${this.required}
            placeholder=${ifDefined(this.placeholder)}
            min=${ifDefined(this.min)}
            max=${ifDefined(this.max)}
            step=${ifDefined(this.step)}
            minlength=${ifDefined(this.minlength)}
            maxlength=${ifDefined(this.maxlength)}
            pattern=${ifDefined(this.pattern)}
            @input=${this.syncValue}
            @change=${this.replayEvent}
            ${ref(this.inputRef)}
          />
        </slot>
        ${when(
          this.trailingIcon,
          () =>
            html`<i
              class="material-icons mdc-text-field__icon mdc-text-field__icon--trailing"
              tabindex="0"
              role="button"
              aria-label=${ifDefined(this.trailingIconLabel)}
              @click=${{
                handleEvent: () =>
                  this.handleIconClick('trailing', this.trailingIconLabel),
              }}
              ${ref(this.initTrailingIcon)}
              >${this.trailingIcon}</i
            >`
        )}
        ${when(
          this.mode === 'filled',
          () => html`<span class="mdc-line-ripple"></span>`
        )}
      </label>
      <div
        style="font-size: 0; position: absolute; pointer-events: none; opacity: 0;"
      >
        <slot></slot>
      </div>
      <mdc-icons-link></mdc-icons-link>`;
  }

  protected override firstUpdated() {
    this.syncValue();
    this.addEventListener('focus', this.handleFocus);
    this.addEventListener('blur', this.handleBlur);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('focus', this.handleFocus);
    this.removeEventListener('blur', this.handleBlur);
    this.textField?.destroy();
    this.leadingTextIcon?.destroy();
    this.trailingTextIcon?.destroy();
    this.textField = undefined;
    this.leadingTextIcon = undefined;
    this.trailingTextIcon = undefined;
  }

  protected override willUpdate(
    changedProps: PropertyValueMap<MdcTextFieldElement>
  ) {
    if (changedProps.has('required')) {
      asFormAssociatedInternal(this).getInternals().ariaRequired = String(
        this.required
      );
    }

    if (changedProps.has('disabled')) {
      asFormAssociatedInternal(this).getInternals().ariaDisabled = String(
        this.disabled
      );

      if (this.disabled) {
        this.updateTabIndex();
      } else {
        this.restoreTabIndex();
      }
    }

    if (changedProps.has('readonly')) {
      asFormAssociatedInternal(this).getInternals().ariaReadOnly = String(
        this.readonly
      );
    }

    if (changedProps.has('label')) {
      asFormAssociatedInternal(this).getInternals().ariaLabel =
        this.label ?? null;
    }
  }

  protected initTextField(element?: Element) {
    if (element) {
      this.textField?.destroy();
      setTimeout(() => (this.textField = MDCTextField.attachTo(element)));
    }
  }

  protected initLeadingIcon(element?: Element) {
    if (element) {
      this.leadingTextIcon?.destroy();
      this.leadingTextIcon = MDCTextFieldIcon.attachTo(element);
    }
  }

  protected initTrailingIcon(element?: Element) {
    if (element) {
      this.trailingTextIcon?.destroy();
      this.trailingTextIcon = MDCTextFieldIcon.attachTo(element);
    }
  }

  protected getLabelClassMap() {
    return {
      'mdc-text-field--disabled': this.disabled,
      'mdc-text-field--filled': this.mode === 'filled',
      'mdc-text-field--outlined': this.mode === 'outlined',
      'mdc-text-field--with-leading-icon': !!this.leadingIcon,
      'mdc-text-field--with-trailing-icon': !!this.trailingIcon,
    };
  }

  protected async updateValue(value: string) {
    const needRevalidate = value !== this.inputRef.value?.value;

    this.value = value;
    this.innerText = this.value;
    asFormAssociatedInternal(this).getInternals().setFormValue(this.value);

    if (!needRevalidate) {
      this.updateValidity();
      return;
    }

    asFormAssociatedInternal(this).getInternals().ariaBusy = 'true';

    await this.updateComplete;

    this.updateValidity();
    asFormAssociatedInternal(this).getInternals().ariaBusy = null;
  }

  protected updateValidity() {
    asFormAssociatedInternal(this)
      .getInternals()
      .setValidity(
        this.inputRef.value?.validity,
        this.inputRef.value?.validationMessage,
        this.inputRef.value
      );
  }

  protected syncValue(event?: Event) {
    this.updateValue(this.inputRef.value?.value ?? '');

    if (event) {
      this.replayEvent(event);
    }
  }

  protected replayEvent(event: Event) {
    const newEvent = new Event(event.type, {
      bubbles: event.bubbles,
      cancelable: event.cancelable,
      composed: true,
    });

    this.dispatchEvent(newEvent);

    if (newEvent.defaultPrevented) {
      event.preventDefault();
    }
  }

  protected updateTabIndex(tabIndex?: string) {
    this.lastTabIndex = this.getAttribute('tabindex') ?? '0';

    if (tabIndex) {
      this.setAttribute('tabindex', tabIndex);
    } else {
      this.removeAttribute('tabindex');
    }
  }

  protected restoreTabIndex() {
    this.setAttribute('tabindex', this.lastTabIndex);
  }

  protected handleIconClick(type: string, label?: string) {
    if (!label) {
      return;
    }

    this.dispatchEvent(
      new MdcTextFieldIconClickEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
      })
    );
  }
}

export class MdcTextFieldIconClickEvent extends Event {
  constructor(type: string, eventInitDict?: EventInit) {
    super(`mdcTextFieldIconClick:${type}`, eventInitDict);
  }
}
