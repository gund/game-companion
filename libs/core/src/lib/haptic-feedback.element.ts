import {
  customElement,
  html,
  LitElement,
  property,
  PropertyValueMap,
} from '@game-companion/lit';

declare global {
  interface HTMLElementTagNameMap {
    [GcHapticFeedbackElement.selector]: GcHapticFeedbackElement;
  }
}

@customElement(GcHapticFeedbackElement.selector)
export class GcHapticFeedbackElement extends LitElement {
  static readonly selector = 'gc-haptic-feedback';

  @property() declare event: string;
  @property() declare durationMs: number;

  private provideFeedback = () => {
    if (typeof window.navigator.vibrate !== 'function') {
      return;
    }

    window.navigator.vibrate(this.durationMs);
  };

  constructor() {
    super();

    this.event = 'click';
    this.durationMs = 100;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener(this.event, this.provideFeedback);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener(this.event, this.provideFeedback);
  }

  protected override willUpdate(
    changedProps: PropertyValueMap<GcHapticFeedbackElement>
  ) {
    if (changedProps.has('event')) {
      this.removeEventListener(changedProps.get('event'), this.provideFeedback);
      this.addEventListener(this.event, this.provideFeedback);
    }
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}
