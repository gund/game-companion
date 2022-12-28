import { html, LitElement, PropertyValueMap } from 'lit';
import { customElement, property } from './lit/decorators';

declare global {
  interface HTMLElementTagNameMap {
    [TfmHapticFeedbackElement.selector]: TfmHapticFeedbackElement;
  }
}

@customElement(TfmHapticFeedbackElement.selector)
export class TfmHapticFeedbackElement extends LitElement {
  static readonly selector = 'tfm-haptic-feedback';

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
    changedProps: PropertyValueMap<TfmHapticFeedbackElement>
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
