import { AbstractConstructor, Constructor } from './constructor.js';

export interface FormAssociated {
  form: HTMLFormElement | null;
  validity: ValidityState;
  validationMessage: string;
  willValidate: boolean;
  checkValidity(): boolean;
  reportValidity(): boolean;
}

export interface FormAssociatedInternal {
  getInternals(): ElementInternals;
}

export interface FormAssociatedCtor extends Constructor<FormAssociated> {
  formAssociated: boolean;
}

export function formAssociatedMixin<
  TBase extends AbstractConstructor<HTMLElement>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
>(base: TBase = HTMLElement as any): FormAssociatedCtor & TBase {
  return class FormAssociatedMixin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extends (base as any as Constructor<HTMLElement>)
    implements FormAssociated, FormAssociatedInternal
  {
    static formAssociated = true;

    #internals = this.attachInternals();

    get form() {
      return this.#internals.form;
    }

    get validity() {
      return this.#internals.validity;
    }

    get validationMessage() {
      return this.#internals.validationMessage;
    }

    get willValidate() {
      return this.#internals.willValidate;
    }

    checkValidity() {
      return this.#internals.checkValidity();
    }

    reportValidity() {
      return this.#internals.reportValidity();
    }

    getInternals() {
      return this.#internals;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

export function asFormAssociatedInternal<T>(
  obj: T
): T & FormAssociatedInternal {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return obj as any;
}
