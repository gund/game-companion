import {
  classMap,
  createRef,
  css,
  customElement,
  html,
  LitElement,
  property,
  queryAssignedElements,
  ref,
  state,
  unsafeCSS,
} from '@game-companion/lit';
import { hiddenStyles } from '@game-companion/mdc';
import cardStyles from '@material/card/dist/mdc.card.min.css?inline';

declare global {
  interface HTMLElementTagNameMap {
    [MdcCardElement.selector]: MdcCardElement;
  }
}

@customElement(MdcCardElement.selector)
export class MdcCardElement extends LitElement {
  static readonly selector = 'mdc-card';
  static override styles = [
    unsafeCSS(cardStyles),
    hiddenStyles,
    css`
      .mdc-card__content {
        padding: var(--mdc-card-content-padding, 0 16px);
      }
    `,
  ];

  @property() declare outlined: boolean;

  @queryAssignedElements({ slot: 'actions' })
  protected declare actionsSlotted: HTMLElement[];

  @state() declare actionsCount: number;

  protected actionsSlotRef = createRef<HTMLSlotElement>();

  protected updateActions = () => {
    this.actionsCount = this.actionsSlotted.length;
  };

  constructor() {
    super();

    this.outlined = false;
    this.actionsCount = 0;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    this.actionsSlotRef.value?.removeEventListener(
      'slotchange',
      this.updateActions
    );
  }

  protected override render() {
    return html`<div class="mdc-card ${classMap(this.getCardClassMap())}">
      <div class="mdc-card__content">
        <slot></slot>
      </div>
      <div class="mdc-card__actions ${classMap(this.getActionsClassMap())}">
        <slot name="actions" ${ref(this.actionsSlotRef)}></slot>
      </div>
    </div>`;
  }

  protected override firstUpdated() {
    this.actionsSlotRef.value?.addEventListener(
      'slotchange',
      this.updateActions
    );

    this.updateActions();
  }

  protected getCardClassMap() {
    return {
      'mdc-card--outlined': this.outlined,
    };
  }

  protected getActionsClassMap() {
    return { hidden: this.actionsCount === 0 };
  }
}
