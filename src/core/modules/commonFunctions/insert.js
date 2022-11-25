function insert(
  elementToBeInserted,
  position = {
    append: null,
    prepand: null,
    after: null,
    before: null,
  }
) {
  if (!elementToBeInserted) {
    throw new TypeError('ElementToBeInserted parameter is invalid.');
  }

  if (!position) {
    throw new TypeError('Position parameter is invalid.');
  }

  let DOMObject;

  if (typeof position.append !== 'undefined') {
    DOMObject =
      typeof position.append === 'object'
        ? position.append
        : document.querySelector(position.append);
    DOMObject.append(elementToBeInserted);
  } else if (typeof position.prepend !== 'undefined') {
    DOMObject =
      typeof position.prepend === 'object'
        ? position.prepend
        : document.querySelector(position.prepend);
    DOMObject.prepend(elementToBeInserted);
  } else if (typeof position.after !== 'undefined') {
    DOMObject =
      typeof position.after === 'object'
        ? position.after
        : document.querySelector(position.after);
    DOMObject.after(elementToBeInserted);
  } else if (typeof position.before !== 'undefined') {
    DOMObject =
      typeof position.before === 'object'
        ? position.before
        : document.querySelector(position.before);
    DOMObject.before(elementToBeInserted);
  } else {
    throw new TypeError('Position parameter is invalid.');
  }
}

export { insert };
