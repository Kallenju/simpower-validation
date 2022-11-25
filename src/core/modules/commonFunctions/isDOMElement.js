function isDOMElement(obj) {
  try {
    return obj instanceof HTMLElement;
  } catch (err) {
    throw new TypeError('The object is not part of W3 DOM2');
  }
}

export { isDOMElement };
