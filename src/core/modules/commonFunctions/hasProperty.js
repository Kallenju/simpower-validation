import { getAllOwnProperties } from './getAllOwnProperties.js';

function hasProperty(obj, property, allProperties = false) {
  if (allProperties) {
    const properties = getAllOwnProperties(obj);
    return properties.includes(property);
  }

  return Object.prototype.hasOwnProperty.call(obj, property);
}

export { hasProperty };
