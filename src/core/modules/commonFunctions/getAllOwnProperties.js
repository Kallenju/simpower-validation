function getAllOwnProperties(obj) {
  let lastPrototype = Object.getPrototypeOf(obj);
  let allPropertiesAndGetters = [];

  while (lastPrototype) {
    const getters = Object.getOwnPropertyNames(lastPrototype);
    getters.splice(getters.indexOf('constructor'), 1);
    allPropertiesAndGetters = [...allPropertiesAndGetters, ...getters];
    lastPrototype = Object.getPrototypeOf(lastPrototype);
  }

  return [...Object.getOwnPropertyNames(obj), ...allPropertiesAndGetters];
}

export { getAllOwnProperties };
