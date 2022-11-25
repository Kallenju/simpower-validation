const defaults = {
  validateFieldOnEvent: {
    event: null,

    afterFirstSubmition: true,

    lockInputOnValidation: true,

    fieldValueHandler: null,

    ruleErrorMessages: {
      on: true,
      position: null,
      container: null,
      removeContainerFromDOMAfterSuccess: true,
      classes: null,
    },

    successfulValidationMessage: {
      on: false,
      successMessage: null,
      position: null,
      container: null,
      removeContainerFromDOMAfterFail: true,
      classes: null,
    },

    invalidViewOfField: {
      on: false,
      classes: null,
    },

    validViewOfField: {
      on: false,
      classes: null,
    },
  },

  validateOnSubmit: {
    lockFormOnValidation: true,
    revalidateAllFieldsBeforeSubmition: false,
  },
};

export { defaults };
