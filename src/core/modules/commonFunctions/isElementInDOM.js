function isElementInDOM(element) {
  if (typeof element === 'undefined') {
    return false;
  }
  return element.parentNode;
}

export { isElementInDOM };
