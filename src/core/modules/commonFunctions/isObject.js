function isObject(element) {
  return (
    typeof element === 'object' && !Array.isArray(element) && element !== null
  );
}

export { isObject };
