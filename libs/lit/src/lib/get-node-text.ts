export async function getNodeText(node: HTMLElement): Promise<string> {
  await hackDelay();

  return getNodeTextRecursive(node);
}

export async function getNodesText(nodes: HTMLElement[]): Promise<string> {
  await hackDelay();

  return nodes.reduce((txt, hint) => (txt += getNodeTextRecursive(hint)), '');
}

/**
 * HACK: To get latest rendered hint we need to wait 5 macro tasks
 */
async function hackDelay() {
  for (let i = 0; i < 5; i++) {
    await new Promise((res) => setTimeout(res));
  }
}

function getNodeTextRecursive(node: HTMLElement): string {
  if (node instanceof HTMLSlotElement) {
    return node
      .assignedElements()
      .reduce(
        (txt, elem) => txt + getNodeTextRecursive(elem as HTMLElement),
        ''
      );
  }

  return node.textContent ?? '';
}
