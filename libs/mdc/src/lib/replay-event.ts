export function replayEvent(this: EventTarget, event: Event) {
  const newEvent = new (event.constructor as any)(event.type, {
    detail: (event as CustomEvent).detail,
    bubbles: event.bubbles,
    cancelable: event.cancelable,
    composed: true,
  });

  this.dispatchEvent(newEvent);

  if (newEvent.defaultPrevented) {
    event.preventDefault();
  }
}
