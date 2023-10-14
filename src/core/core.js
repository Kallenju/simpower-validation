import { defaults } from './defaults.js';
import {
  extendParams,
  isElementInDOM,
  normalizeEventName,
  hasProperty,
  isObject,
  insert,
  isDOMElement,
  createId,
  isEmpty,
} from './modules/commonFunctions/index.js';
import { ValidationError } from './modules/errors/validationError/index.js';

class SimpowerValidation {
  constructor(parentElement, globalConfig = {}) {
    const simpowerValidation = this;

    simpowerValidation.globalConfig = extendParams(defaults, globalConfig);

    simpowerValidation.eventHandlers = new Map();

    simpowerValidation.form = {};
    simpowerValidation.form.elem = isDOMElement(parentElement)
      ? parentElement
      : document.querySelector(parentElement);
    simpowerValidation.form.formElements =
      simpowerValidation.form.elem.elements;
    simpowerValidation.form.submitting = false;
    simpowerValidation.form.isSubmitted = false;

    simpowerValidation.fields = {};
    simpowerValidation.validationPromises = {};
    simpowerValidation.callbacks = {};

    simpowerValidation.form.elem.setAttribute('novalidate', 'novalidate');
    simpowerValidation.addListener(
      'submit',
      simpowerValidation.form.elem,
      (event) => event.preventDefault(),
      'preventDefault'
    );
    simpowerValidation.addListener(
      'submit',
      simpowerValidation.form.elem,
      simpowerValidation.validateOnSubmit.bind(simpowerValidation),
      'validationOnSubmit'
    );
  }

  addListener(type, elem, handler, handlerName) {
    const simpowerValidation = this;

    let fieldToBeValidate = null;

    Object.values(simpowerValidation.fields).forEach((field) => {
      if (field.elem === elem) {
        fieldToBeValidate = field;
      }
    });

    const handlersContainer = fieldToBeValidate
      ? fieldToBeValidate.eventHandlers
      : simpowerValidation.eventHandlers;

    handlersContainer.set(
      {
        handlerName,
        type,
      },
      handler
    );

    elem.addEventListener(type, handler);

    return simpowerValidation;
  }

  removeListener(type, elem, handlerName) {
    const simpowerValidation = this;

    let fieldToBeValidate = null;

    simpowerValidation.fields.forEach((field) => {
      if (field.elem === elem) {
        fieldToBeValidate = field;
      }
    });

    const handlersContainer = fieldToBeValidate
      ? fieldToBeValidate.eventHandlers
      : simpowerValidation.eventHandlers;

    handlersContainer.keys().forEach((key) => {
      if (key.type === type && key.handlerName === handlerName) {
        elem.removeEventListener(key.type, handlersContainer.get(key));

        handlersContainer.delete(key);
      }
    });

    return simpowerValidation;
  }

  addField(field, rules, config = {}) {
    const simpowerValidation = this;

    if (!Array.isArray(rules)) {
      return simpowerValidation;
    }

    if (rules.length === 0) {
      return simpowerValidation;
    }

    let elem = null;

    if (isDOMElement(field)) {
      elem = field;
    } else {
      elem = hasProperty(simpowerValidation.form.formElements, field)
        ? simpowerValidation.form.formElements[field]
        : document.querySelector(field);
    }

    if (!elem) {
      return simpowerValidation;
    }

    const fieldName =
      elem.getAttribute('name') ||
      `simpowerValidationField${Object.keys(simpowerValidation.fields).length}`;

    config = extendParams(
      simpowerValidation.globalConfig.validateFieldOnEvent,
      config
    );

    simpowerValidation.fields[fieldName] = {
      elem,
      defaultValue: elem.defaultValue,
      rules,
      eventHandlers: new Map(),
      isValid: false,
      isPotentiallyValid: false,
      wasValidated: false,
      successMessage: null,
      errorMessage: null,
      errorMessageIsShown: false,
      successMessageIsShown: false,
      config,
    };

    simpowerValidation.setValidationRules(field);

    simpowerValidation.fields[
      fieldName
    ].config.propertiesToBeRestoreAfterRefresh = {
      isValid: simpowerValidation.fields[fieldName].isValid,
      isPotentiallyValid:
        simpowerValidation.fields[fieldName].isPotentiallyValid,
      wasValidated: simpowerValidation.fields[fieldName].wasValidated,
    };

    return simpowerValidation;
  }

  setValidationRules(field) {
    const simpowerValidation = this;

    field = simpowerValidation.getFieldObject(field);

    const rulesByEvent = {
      submit: [],
    };

    field.rules.forEach((rule) => {
      let event = null;
      if (
        hasProperty(rule, 'event') &&
        rule.event &&
        typeof rule.event === 'string'
      ) {
        event = rule.event;
      } else if (
        hasProperty(field.config, 'event') &&
        field.config.event &&
        typeof field.config.event === 'string'
      ) {
        event = field.config.event;
      }

      if (event) {
        if (!hasProperty(rulesByEvent, event)) {
          rulesByEvent[event] = [rule];
        } else {
          rulesByEvent[event].push(rule);
        }
      } else {
        rulesByEvent.submit.push(rule);
      }
    });

    field.rulesByEvent = rulesByEvent;

    Object.keys(field.rulesByEvent).forEach((event) => {
      if (event !== 'submit') {
        simpowerValidation.addListener(
          event,
          field.elem,
          simpowerValidation.validateOnFieldEvent.bind(simpowerValidation),
          `validateOnField${normalizeEventName(event)}`
        );
      }
    });
  }

  removeField(field) {
    const simpowerValidation = this;

    field = simpowerValidation.getFieldObject(field);

    field.eventHandlers.keys().forEach((key) => {
      simpowerValidation.removeListener(key.type, field.elem, key.handlerName);
    });

    simpowerValidation.deleteSuccesses(field);
    simpowerValidation.deleteErrors(field);

    Object.keys(simpowerValidation.fields).forEach((fieldName) => {
      if (simpowerValidation.fields[fieldName] === field) {
        delete simpowerValidation.fields[fieldName];
      }
    });

    return simpowerValidation;
  }

  getFieldValue(field) {
    const simpowerValidation = this;

    let fieldValue = null;

    const fieldObject = simpowerValidation.getFieldObject(field);
    const { elem } = fieldObject;

    switch (elem.type) {
      case 'checkbox': {
        fieldValue = elem.checked;

        break;
      }
      case 'file': {
        fieldValue = elem.files;

        break;
      }
      default: {
        fieldValue = elem.value;
      }
    }

    if (hasProperty(field.config, 'fieldValueHandler') && fieldValueHandler) {
      fieldValue = field.config.fieldValueHandler(fieldValue);
    }

    return fieldValue;
  }

  getFieldObject(field) {
    const simpowerValidation = this;

    return typeof field === 'object' ? field : simpowerValidation.fields[field];
  }

  clearFields(singleField = null) {
    const simpowerValidation = this;

    if (singleField) {
      const field = simpowerValidation.getFieldObject(singleField);

      switch (field.elem.type) {
        case 'checkbox': {
          field.elem.checked = field.defaultValue;
          break;
        }
        case 'file': {
          field.elem.files = field.defaultValue;
          break;
        }
        default: {
          field.elem.value = field.defaultValue;
        }
      }
      return;
    }

    simpowerValidation.form.elem.reset();
  }

  restoreFieldsProperties(
    singleField = null,
    properties = ['isValid', 'isPotentiallyValid', 'wasValidated']
  ) {
    const simpowerValidation = this;

    const fields = singleField
      ? [simpowerValidation.getFieldObject(singleField)]
      : Object.values(simpowerValidation.fields);

    fields.forEach((field) => {
      properties.forEach((property) => {
        field[property] =
          field.config.propertiesToBeRestoreAfterRefresh[property];
      });
    });
  }

  refresh(singleField = null) {
    const simpowerValidation = this;

    simpowerValidation.clearFields(singleField);
    simpowerValidation.deleteMessages(singleField, true);
    simpowerValidation.restoreFieldsProperties(singleField);
  }

  isFieldValid(field) {
    const simpowerValidation = this;

    field = simpowerValidation.getFieldObject(field);

    let isValid = true;

    if (!field.isPotentiallyValid) {
      isValid = false;
      return isValid;
    }

    if (!field.isValid) {
      isValid = false;
      return isValid;
    }

    return isValid;
  }

  isFormValid() {
    const simpowerValidation = this;

    let isValid = true;

    Object.values(simpowerValidation.fields).forEach((field) => {
      if (!simpowerValidation.isFieldValid(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  async validateOnSubmit(event) {
    const simpowerValidation = this;

    if (simpowerValidation.form.submitting) {
      return;
    }

    const config = simpowerValidation.globalConfig.validateOnSubmit;

    if (config.lockFormOnValidation) {
      simpowerValidation.lockForm();
    }

    if (hasProperty(simpowerValidation.callbacks, 'onStartValidationSubmit')) {
      await simpowerValidation.callbacks.onStartValidationSubmit(
        event,
        simpowerValidation.form
      );
    }

    simpowerValidation.form.submitting = true;
    simpowerValidation.form.isSubmitted = true;

    await Promise.all(Object.values(simpowerValidation.validationPromises));

    const jobs = [];

    Object.keys(simpowerValidation.fields).forEach((fieldName) => {
      const field = simpowerValidation.getFieldObject(fieldName);

      if (!field.wasValidated || config.revalidateAllFieldsBeforeSubmition) {
        const promiseId = createId(fieldName);
        simpowerValidation.validationPromises[promiseId] = simpowerValidation
          .validateField(field)
          .then((successMessage) => {
            field.successMessage = successMessage.toString();
          })
          .catch((error) => {
            if (error.name !== 'ValidationError') {
              throw error;
            }

            field.errorMessage = error.message.toString();
          })
          .finally(() => {
            simpowerValidation.setViewOnFields(field);
            simpowerValidation.deleteMessages(field);
            simpowerValidation.createMessages(field);
            simpowerValidation.renderMessages(field);

            delete simpowerValidation.validationPromises[promiseId];
          });

        jobs.push(simpowerValidation.validationPromises[promiseId]);
      }
    });

    await Promise.all(jobs);

    if (simpowerValidation.isFormValid()) {
      if (hasProperty(simpowerValidation.callbacks, 'onSuccessSubmit')) {
        await simpowerValidation.callbacks.onSuccessSubmit(
          event,
          simpowerValidation.form
        );
      }
      simpowerValidation.form.isSubmitted = false;

      simpowerValidation.refresh();
    } else {
      // eslint-disable-next-line no-lonely-if
      if (hasProperty(simpowerValidation.callbacks, 'onFailSubmit')) {
        await simpowerValidation.callbacks.onFailSubmit(
          event,
          simpowerValidation.form
        );
      }

      simpowerValidation.restoreFieldsProperties(null, ['wasValidated']);
    }

    if (hasProperty(simpowerValidation.callbacks, 'onEndValidationSubmit')) {
      await simpowerValidation.callbacks.onEndValidationSubmit(
        event,
        simpowerValidation.form
      );
    }

    simpowerValidation.form.submitting = false;

    if (config.lockFormOnValidation) {
      simpowerValidation.unlockForm();
    }
  }

  async validateOnFieldEvent(event) {
    const simpowerValidation = this;

    const { target, type } = event;

    const fieldName = Object.keys(simpowerValidation.fields).find(
      // eslint-disable-next-line no-shadow
      (fieldName) => {
        const field = simpowerValidation.fields[fieldName];
        if (field.elem === target) {
          return true;
        }

        return false;
      }
    );
    const field = simpowerValidation.getFieldObject(fieldName);

    if (
      field.config.afterFirstSubmition &&
      !simpowerValidation.form.isSubmitted
    ) {
      return;
    }

    const normalizedEventName = normalizeEventName(type);

    if (field.config.lockInputOnValidation) {
      field.elem.setAttribute('disabled', '');
    }

    if (
      hasProperty(
        simpowerValidation.callbacks,
        `onStartValidation${normalizedEventName}`
      )
    ) {
      await simpowerValidation.callbacks[
        `onStartValidation${normalizedEventName}`
      ](event, field);
    }

    const promiseId = createId(fieldName);

    simpowerValidation.validationPromises[promiseId] = simpowerValidation
      .validateField(field)
      .then(async (successMessage) => {
        field.successMessage = successMessage.toString();

        if (
          hasProperty(
            simpowerValidation.callbacks,
            `onSuccess${normalizedEventName}`
          )
        ) {
          await simpowerValidation.callbacks[`onSuccess${normalizedEventName}`](
            event,
            field
          );
        }
      })
      .catch(async (error) => {
        if (error.name !== 'ValidationError') {
          throw error;
        }

        field.errorMessage = error.message.toString();

        if (
          hasProperty(
            simpowerValidation.callbacks,
            `onFail${normalizedEventName}`
          )
        ) {
          await simpowerValidation.callbacks[`onFail${normalizedEventName}`](
            event,
            field
          );
        }
      })
      .finally(async () => {
        if (field.config.lockInputOnValidation) {
          field.elem.removeAttribute('disabled');
        }

        simpowerValidation.setViewOnFields(field);
        simpowerValidation.deleteMessages(field);
        simpowerValidation.createMessages(field);
        simpowerValidation.renderMessages(field);

        delete simpowerValidation.validationPromises[promiseId];

        if (
          hasProperty(
            simpowerValidation.callbacks,
            `onEndValidation${normalizedEventName}`
          )
        ) {
          await simpowerValidation.callbacks[
            `onEndValidation${normalizedEventName}`
          ](event, field);
        }
      });
  }

  async validateField(field) {
    const simpowerValidation = this;

    field = simpowerValidation.getFieldObject(field);
    field.wasValidated = true;

    // eslint-disable-next-line no-restricted-syntax
    for (const rule of field.rules) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await simpowerValidation.validateRule(field, rule);
      } catch (error) {
        field.isValid = false;
        throw error;
      }
    }

    field.isValid = true;

    return hasProperty(field.config, 'successMessage')
      ? field.config.successMessage
      : 'Validation succeeded';
  }

  async validateRule(field, rule) {
    const simpowerValidation = this;

    let result;

    field = simpowerValidation.getFieldObject(field);
    const fieldValue = simpowerValidation.getFieldValue(field);

    if (hasProperty(rule, 'validator')) {
      result = await rule.validator(fieldValue);
    } else {
      result = true;
    }

    if (!isObject(result)) {
      result = {
        result,
      };
    }

    if (!result.result) {
      if (!hasProperty(result, 'errorMessage')) {
        result.errorMessage = 'Rule validation failed';

        if (hasProperty(rule, 'errorMessage')) {
          result.errorMessage = rule.errorMessage;
        }
      }

      rule.isValid = false;
      field.isPotentiallyValid = false;
      throw new ValidationError(result.errorMessage);
    }

    rule.isValid = true;
    field.isPotentiallyValid = true;
    // eslint-disable-next-line no-shadow
    field.rules.forEach((rule) => {
      if (hasProperty(rule, 'isValid')) {
        if (!rule.isValid) {
          field.isPotentiallyValid = false;
        }
      }
    });
  }

  onStartValidation(callback, eventName) {
    const simpowerValidation = this;

    simpowerValidation.callbacks[
      `onStartValidation${normalizeEventName(eventName)}`
    ] = callback;

    return simpowerValidation;
  }

  onEndValidation(callback, eventName) {
    const simpowerValidation = this;

    simpowerValidation.callbacks[
      `onEndValidation${normalizeEventName(eventName)}`
    ] = callback;

    return simpowerValidation;
  }

  onSuccess(callback, eventName) {
    const simpowerValidation = this;

    simpowerValidation.callbacks[`onSuccess${normalizeEventName(eventName)}`] =
      callback;

    return simpowerValidation;
  }

  onFail(callback, eventName) {
    const simpowerValidation = this;

    simpowerValidation.callbacks[`onFail${normalizeEventName(eventName)}`] =
      callback;

    return simpowerValidation;
  }

  createMessages(singleField = null) {
    const simpowerValidation = this;

    const fields = singleField
      ? [simpowerValidation.getFieldObject(singleField)]
      : Object.values(simpowerValidation.fields);

    fields.forEach((field) => {
      if (
        !simpowerValidation.isFieldValid(field) &&
        field.config.ruleErrorMessages.on
      ) {
        const errorContainer =
          simpowerValidation.getContainerForMessageText(field);
        errorContainer.textContent = field.errorMessage;
      } else if (
        simpowerValidation.isFieldValid(field) &&
        field.config.successfulValidationMessage.on
      ) {
        const successContainer =
          simpowerValidation.getContainerForMessageText(field);
        successContainer.textContent = field.successMessage;
      }
    });
  }

  deleteMessages(singleField = null, force = false) {
    const simpowerValidation = this;

    const fields = singleField
      ? [simpowerValidation.getFieldObject(singleField)]
      : Object.values(simpowerValidation.fields);

    fields.forEach((field) => {
      const { config } = field;

      if (!simpowerValidation.isFieldValid(field)) {
        field.successMessage = null;
        field.successMessageIsShown = false;

        if (isElementInDOM(field.successContainer)) {
          field.successContainer.textContent = '';
          if (
            config.successfulValidationMessage.removeContainerFromDOMAfterFail
          ) {
            field.successContainer.remove();
          }
        }
      } else {
        field.errorMessage = null;
        field.errorMessageIsShown = false;

        if (isElementInDOM(field.errorContainer)) {
          field.errorContainer.textContent = '';
          if (
            config.successfulValidationMessage.removeContainerFromDOMAfterFail
          ) {
            field.errorContainer.remove();
          }
        }
      }

      if (force) {
        field.errorMessage = null;
        field.errorMessageIsShown = false;
        field.successMessage = null;
        field.successMessageIsShown = false;

        if (isElementInDOM(field.successContainer)) {
          field.successContainer.textContent = '';
          if (
            config.successfulValidationMessage.removeContainerFromDOMAfterFail
          ) {
            field.successContainer.remove();
          }
        }

        if (isElementInDOM(field.errorContainer)) {
          field.errorContainer.textContent = '';
          if (
            config.successfulValidationMessage.removeContainerFromDOMAfterFail
          ) {
            field.errorContainer.remove();
          }
        }
      }
    });
  }

  getContainerForMessageText(field) {
    const simpowerValidation = this;

    let messageContainer = null;

    field = simpowerValidation.getFieldObject(field);

    if (
      !hasProperty(field, 'errorContainer') &&
      !simpowerValidation.isFieldValid(field)
    ) {
      const config = field.config.ruleErrorMessages;

      if (config.container) {
        field.errorContainer = isDOMElement(config.container)
          ? config.container
          : document.querySelector(field);
      } else {
        field.errorContainer = document.createElement('div');

        if (config.classes) {
          field.errorContainer.classList.add(...config.classes);
        }
      }
    } else if (
      !hasProperty(field, 'successContainer') &&
      simpowerValidation.isFieldValid(field)
    ) {
      const config = field.config.successfulValidationMessage;

      if (config.container) {
        field.successContainer = isDOMElement(config.container)
          ? config.container
          : document.querySelector(field);
      } else {
        field.successContainer = document.createElement('div');

        if (config.classes) {
          field.successContainer.classList.add(...config.classes);
        }
      }
    }

    if (!simpowerValidation.isFieldValid(field)) {
      messageContainer = field.errorContainer;
    } else {
      messageContainer = field.successContainer;
    }

    return messageContainer;
  }

  renderMessages(singleField = null) {
    const simpowerValidation = this;

    const fields = singleField
      ? [simpowerValidation.getFieldObject(singleField)]
      : Object.values(simpowerValidation.fields);

    fields.forEach((field) => {
      let messageContainer = null;
      let messageContainerPossition = null;

      if (
        simpowerValidation.isFieldValid(field) &&
        isEmpty(simpowerValidation.getFieldValue(field))
      ) {
        return;
      }

      if (!simpowerValidation.isFieldValid(field)) {
        const config = field.config.ruleErrorMessages;

        if (config.on) {
          if (!isElementInDOM(field.errorContainer)) {
            messageContainer = field.errorContainer;
            messageContainerPossition = config.position;
          }
        }
      } else {
        const config = field.config.successfulValidationMessage;

        if (config.on) {
          if (!isElementInDOM(field.successContainer)) {
            messageContainer = field.successContainer;
            messageContainerPossition = config.position;
          }
        }
      }

      try {
        insert(messageContainer, messageContainerPossition);

        if (!simpowerValidation.isFieldValid(field)) {
          field.errorMessageIsShown = true;
        } else {
          field.successMessageIsShown = true;
        }
      } catch (err) {
        if (
          err.name === 'TypeError' &&
          err.message === 'Position parameter is invalid.'
        ) {
          field.elem.after(messageContainer);
        } else if (
          err.name !== 'TypeError' &&
          (err.message !== 'ElementToBeInserted parameter is invalid.' ||
            err.message === 'Position parameter is invalid.')
        ) {
          throw err;
        }
      }
    });
  }

  setViewOnFields(singleField = null) {
    const simpowerValidation = this;

    const fields = singleField
      ? [simpowerValidation.getFieldObject(singleField)]
      : Object.values(simpowerValidation.fields);

    fields.forEach((field) => {
      const { elem, config } = field;

      if (simpowerValidation.isFieldValid(field)) {
        if (config.invalidViewOfField.classes) {
          elem.classList.remove(...config.invalidViewOfField.classes);
        }

        if (config.invalidViewOfField.on && config.validViewOfField.classes) {
          elem.classList.add(...config.validViewOfField.classes);
        }
      } else {
        if (config.validViewOfField.classes) {
          elem.classList.remove(...config.validViewOfField.classes);
        }

        if (config.validViewOfField.on && config.invalidViewOfField.classes) {
          elem.classList.add(...config.invalidViewOfField.classes);
        }
      }
    });
  }

  lockForm() {
    const simpowerValidation = this;

    const allFormElements = simpowerValidation.form.elem.querySelectorAll(
      'input, textarea, button, select'
    );

    Array.from(allFormElements).forEach((field) => {
      field.setAttribute('disabled', '');
      field.style.pointerEvents = 'none';
      field.style.webkitFilter = 'grayscale(100%)';
      field.style.filter = 'grayscale(100%)';
    });
  }

  unlockForm() {
    const simpowerValidation = this;

    const allFormElements = simpowerValidation.form.elem.querySelectorAll(
      'input, textarea, button, select'
    );

    Array.from(allFormElements).forEach((field) => {
      field.removeAttribute('disabled');
      field.style.pointerEvents = '';
      field.style.webkitFilter = '';
      field.style.filter = '';
    });
  }
}

export { SimpowerValidation };
