import { webContextConsumer } from '@game-companion/context';
import { SettingsService } from '@game-companion/core';
import {
  customElement,
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
@webContextConsumer()
export class GcHapticFeedbackElement extends LitElement {
  static readonly selector = 'gc-haptic-feedback';

  @property() declare event: string;
  @property() declare durationMs: number;

  @webContextConsumer(SettingsService)
  declare settingsService: SettingsService;

  private isEnabled?: Promise<boolean>;

  private provideFeedback = async () => {
    const isEnabled = await this.isEnabled;

    if (typeof window.navigator.vibrate !== 'function' || !isEnabled) {
      return;
    }

    window.navigator.vibrate(this.durationMs);
  };

  constructor() {
    super();

    this.event = 'click';
    this.durationMs = 100;
  }

  override connectedCallback() {
    super.connectedCallback();

    this.isEnabled = this.settingsService
      .getById('haptic-enabled')
      .then((s) => !!s?.value);

    this.addEventListener(this.event, this.provideFeedback);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(this.event, this.provideFeedback);
  }

  protected override createRenderRoot() {
    return this;
  }

  protected override willUpdate(
    changedProps: PropertyValueMap<GcHapticFeedbackElement>,
  ) {
    if (changedProps.has('event')) {
      this.removeEventListener(changedProps.get('event'), this.provideFeedback);
      this.addEventListener(this.event, this.provideFeedback);
    }
  }
}
