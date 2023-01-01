import {
  classMap,
  css,
  customElement,
  html,
  LitElement,
  property,
  queryAll,
  queryAssignedElements,
  ref,
  repeat,
  state,
  unsafeCSS,
  when,
} from '@game-companion/lit';
import '@game-companion/mdc/icons-link';
import { MDCList } from '@material/list';
import listStyles from '@material/list/dist/mdc.list.min.css?inline';
import { MDCRipple } from '@material/ripple';

declare global {
  interface HTMLElementTagNameMap {
    [MdcListElement.selector]: MdcListElement;
  }
}

@customElement(MdcListElement.selector)
export class MdcListElement extends LitElement {
  static readonly selector = 'mdc-list';
  static override styles = [
    unsafeCSS(listStyles),
    css`
      .mdc-list-item {
        padding: 8px 16px;
      }

      .mdc-list-item__graphic {
        margin-right: 24px;
      }
    `,
  ];

  @property({ type: Boolean }) declare twoLine: boolean;
  @property({ type: String }) declare icon?: string;

  @queryAll('li.mdc-list-item')
  protected declare listItemsElements: NodeListOf<HTMLLIElement>;

  @queryAssignedElements()
  protected declare slottedItems: HTMLElement[];

  @state()
  protected declare items: Element[];

  protected list?: MDCList;
  protected listItems?: MDCRipple[];

  constructor() {
    super();

    this.twoLine = false;
    this.items = [];
  }

  override disconnectedCallback() {
    this.list?.destroy();
    this.listItems?.forEach((item) => item.destroy());
    this.list = undefined;
    this.listItems = undefined;
  }

  protected override render(): unknown {
    return html`<ul
        class="mdc-list ${classMap(this.getClassMap())}"
        ${ref(this.initList)}
      >
        ${repeat(this.items, (item) =>
          when(
            item.tagName.toLowerCase() === 'mdc-list-item-divider',
            () => html`<li role="separator" class="mdc-list-divider"></li>`,
            () =>
              when(
                item.tagName.toLowerCase() === 'mdc-list-item-subheader',
                () => html`<h3 class="mdc-list-group__subheader">${item}</h3>`,
                () => html`<li class="mdc-list-item" tabindex="0">
                  <span class="mdc-list-item__ripple"></span>
                  ${when(
                    this.icon,
                    () => html`<span
                      class="mdc-list-item__graphic material-icons"
                      aria-hidden="true"
                      >${this.icon}</span
                    >`
                  )}
                  <span class="mdc-list-item__text">${item}</span>
                </li>`
              )
          )
        )}
      </ul>
      <slot></slot>
      <mdc-icons-link></mdc-icons-link>`;
  }

  protected override updated() {
    this.initListItems(Array.from(this.listItemsElements));
  }

  protected override firstUpdated() {
    this.items = this.slottedItems;
  }

  private initList(list?: Element) {
    if (list) {
      this.list?.destroy();
      this.list = MDCList.attachTo(list);
    }
  }

  private initListItems(items?: Element[]) {
    if (items) {
      this.listItems?.forEach((item) => item.destroy());
      this.listItems = items.map((item) => MDCRipple.attachTo(item));
    }
  }

  protected getClassMap() {
    return {
      'mdc-list--two-line': this.twoLine,
    };
  }
}
