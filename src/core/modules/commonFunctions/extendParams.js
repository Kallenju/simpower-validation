import { hasProperty } from './hasProperty.js';
import { isObject } from './isObject.js';

function extendParams(defaults, params) {
  const extendedParams = {};

  Object.keys(defaults).forEach((param) => {
    if (hasProperty(params, param)) {
      if (isObject(defaults[param])) {
        if (isObject(params[param])) {
          extendedParams[param] = extendParams(defaults[param], params[param]);
        } else {
          extendedParams[param] = {
            ...defaults[param],
            ...params[param],
          };
        }
      } else {
        extendedParams[param] = params[param];
      }
    } else {
      extendedParams[param] = defaults[param];
    }
  });

  Object.keys(params).forEach((param) => {
    if (!hasProperty(defaults, param)) {
      extendedParams[param] = params[param];
    }
  });

  return extendedParams;
}

export { extendParams };
