function isEmpty(value) {
  let newVal = value;
  if (typeof value === 'string') {
    newVal = value.trim();
  }
  return !newVal;
}

export { isEmpty };
