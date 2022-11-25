# simpower-validation

Modern, simple but powerful form validation library written in pure JavaScript, with no dependencies.

This is the right choice for you if you have a website or landing page without frameworks.

The library is very simple. There are no complicated predefined rules here because there are many npm packages that provide these rules. It only can checks the rules and inserts the error or success message into the container, which can be found in the current HTML using the querySelector method, or dynamically created and inserted into the HTML. The library also has many callbacks, such as on successful validation of the entire form or on failure of a field validation.

## Features

- small size and zero dependencies
- custom rules
- custom messages
- custom styles and css classes for valid/invalid fields and success/error messages
- custom places for the messages

## Installation

### npm

```shell
npm i simpower-validation
```

Then it can be used as an imported module with module bundlers:

```js
import SimpowerValidation from 'simpower-validation';

const validate = new SimpowerValidation('#form');
```

If you don't use module bundlers, you can import SimpowerValidation via a browser:

```js
import SimpowerValidation from '[relative or absolute path to node_modules folder]/simpower-validation/simpower-validation.esm.js';

const validate = new SimpowerValidation('#form');
```

Or you can just include SimpowerValidation script on your page from CDN and call it as `window.SimpowerValidation`:

```html
<script src="https://cdn.jsdelivr.net/npm/simpower-validation/simpower-validation.production.min.js"></script>

<script>
  window.addEventListener('DOMContentLoaded', () => {
    const validate = new window.SimpowerValidation('#form');
  });
</script>
```

## Quick start

Let's say we have a basic HTML layout:

```html
<form id="form">
  <label for="name">Enter your name</label>
  <input id="name" name="name" type="text" placeholder="Enter your name" />
  <label for="email">Enter your email</label>
  <input id="email" name="email" type="email" placeholder="Enter your email" />
  <button type="submit">Submit</button>
</form>
```

Next, let's add SimpowerValidation to the layout and define some rules.

First, we must create an instance `new SimpowerValidation('#form')` by passing a form selector, or the element as an argument.

Second, we must call `.addField()` with the field selector, or DOM element, or field name attribute as the first argument and the rules array as the second argument.

```js
const validation = new SimpowerValidation('#form');

validation
  .addField('name', [
    {
      validator(inputValue) {
        return !inputValue.trim();
      },
      errorMessage: 'Name is required',
    },
    {
      validator(inputValue) {
        const nameRegEx = /^[a-zA-Z]{1,40}$/;
        return inputValue.match(nameRegEx);
      }
      errorMessage: 'Name is invalid',
    },
  ])
  .addField('email', [
    {
      validator(inputValue) {
        if (!inputValue.trim()) {
          return true
        }

        const emailRegEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        return inputValue.match(emailRegEx);
      }
      errorMessage: 'Email is invalid'
    },
  ]);
```

That's all! The form is now validated!

Let's consider API.

## API

### Instance setting

`const validation = new SimpowerValidation(parentElement: string | Element[, globalConfig: object]);`

#### Example of the full setting:

Let's change the HTML layout mentioned above:

```html
<form id="form">
  <label for="name">Enter your name</label>
  <input id="name" name="name" type="text" placeholder="Enter your name" />
  <label for="email">Enter your email</label>
  <input id="email" name="email" type="email" placeholder="Enter your email" />
  <button type="submit">Submit</button>
</form>

<div id="#messagesContainerForAllInputs"></div>

<div id="#messageContainerForEmailInput"></div>
```

```js
const validation = new SimpowerValidation(
  '#form',
  {
    validateFieldOnEvent: {
      event: 'blur',

      afterFirstSubmition: true,

      lockInputOnValidation: true,

      fieldValueHandler(fieldValue) {
        return `${fieldValue.toString()} - changed value`
      }

      ruleErrorMessages: {
        on: true,
        position: {
          append: '#messagesContainerForAllInputs',
        },
        removeContainerFromDOMAfterSuccess: true,
        classes: ['message-css-class', 'error-message-css-class'],
      },

     successfulValidationMessage: {
        on: true,
        successMessage: 'Validation succeeded',
        position: {
          append: '#messagesContainerForAllInputs',
        },
        removeContainerFromDOMAfterFail: true,
        classes: ['message', 'message_success'],
      },

      invalidViewOfField: {
        on: true,
        classes: ['input_view_invalid'],
      },

      validViewOfField: {
        on: true,
        classes: ['input_view_valid'],
      },
    },

    validateOnSubmit: {
      lockFormOnValidation: true,
      revalidateAllFieldsBeforeSubmition: false,
    },
  },
)
```

<table>
  <thead>
    <tr>
      <th colspan="3" align="center">validateFieldOnEvent</th>
    </tr>
    <tr>
      <th align="center">Field</th>
      <th align="center">Description</th>
      <th align="center">Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>event</td>
      <td>JavaScript Event. tdis event is added to form elements tdat have been added for validation. When tde event fires, validation starts. If tde event name is invalid, unvalidated elements will be validated when attempting to submit.</td>
      <td>string</td>
    </tr>
    <tr>
      <td>afterFirstSubmition</td>
      <td>If true, validation after the event specified in the 'event' parameter will work only after the first submission attempt.</td>
      <td>boolean</td>
    </tr>
    <tr>
      <td>lockInputOnValidation</td>
      <td>This option is useful if an asynchronous validator is specified. It sets the disabled attribute on the fields for the duration of the validation.</td>
      <td>boolean</td>
    </tr>
        <tr>
      <td>fieldValueHandler</td>
      <td>If exists, this function change value which take validator functin. It is very useful feature if you, for example, use masks for inputs (you can use `fieldValueHandler`for unmasking of input value before validation.</td>
      <td>function</td>
    </tr>
    <tr>
      <td>ruleErrorMessages.on</td>
      <td>Enable error message</td>
      <td>boolean</td>
    </tr>
    <tr>
      <td>ruleErrorMessages.position</td>
      <td>Define where error message will be inserted. It has four optional properties: 'append', 'prepand', 'after' and 'before'. Possible value type is string | Element.</td>
      <td>object</td>
    </tr>
    <tr>
      <td>ruleErrorMessages.   <br>&nbsp;&nbsp;removeContainerFromDOMAfterSuccess</td>
      <td>If true, a error message will be deleted after a successful validation.</td>
      <td>boolean</td>
    </tr>
    <tr>
      <td>ruleErrorMessages.classes</td>
      <td>ССS classes to be added to containers with error messages.</td>
      <td>Array with css classes</td>
    </tr>
    <tr>
      <td>successedValidationMessage.on</td>
      <td>Enable success messages</td>
      <td>boolean</td>
    </tr>
    <tr>
      <td>successedValidationMessage.on</td>
      <td>Text of success messages</td>
      <td>string</td>
    </tr>
    <tr>
      <td>successedValidationMessage.position</td>
      <td>Define where success message will be inserted. It has four optional properties: 'append', 'prepand', 'after' and 'before'. Possible value type is string | Element.</td>
      <td>object</td>
    </tr>
    <tr>
      <td>successedValidationMessage.<br>&nbsp;&nbsp;removeContainerFromDOMAfterFail</td>
      <td>If true, a success message will be deleted after a failed validation.</td>
      <td>boolean</td>
    </tr>
    <tr>
      <td>successedValidationMessage.classes</td>
      <td>ССS classes to be added to containers with success messages.</td>
      <td>Array witd css classes</td>
    </tr>
    <tr>
      <td>invalidViewOfField.on</td>
      <td>Enable invalid views of fields</td>
      <td>boolean</td>
    </tr>
    <tr>
      <td>invalidViewOfField.classes</td>
      <td>ССS classes to be added to invalid fields.</td>
      <td>Array witd css classes</td>
    </tr>
    <tr>
      <td>validViewOfField.on</td>
      <td>Enable valid views of fields/td>
      <td>boolean</td>
    </tr>
    <tr>
      <td>validViewOfField.classes</td>
      <td>ССS classes to be added to valid fields.</td>
      <td>Array witd css classes</td>
    </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="3" align="center">validateOnSubmit</th>
    </tr>
    <tr>
      <th align="center">Field</th>
      <th align="center">Description</th>
      <th align="center">Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>lockFormOnValidation</td>
      <td>This option is useful if an asynchronous validator is specified. It sets the disabled attribute for all form elements.</td>
      <td>boolean</td>
    </tr>
    <tr>
      <td>revalidateAllFieldsBeforeSubmition</td>
      <td>Enables forced validation of all fields before submission, even those that have already been validated.</td>
      <td>boolean</td>
    </tr>
  </tbody>
</table>

### `validation.addField(field: string | Element, rules: Array[, config: object]): validation`

The first argument is the field selector, or DOM element, or field name attribute.
The second argument is the rules array.
The third argument contain local config for field. The argument is structurally identical to `validateFieldOnEvent` object in the global config.

#### rule.

Example of the full setting:

```js
{
  validator(value) {
    return value.toString().trim()
  },

  errorMessage: 'The field is required'
}
```

In this example `validator` method return boolean. In case false, then value of `errorMessage` will be inserted in error message container, if showing of error messages is enabled.

There is the other variant of rule object:

```js
{
  validator(value) {
    if (typeof value !== 'string') {
      return {
        result: false,
        errorMessage: 'The value must be of type "string".'
      }
    } else if (!value.trim()) {
      return {
        result: false,
        errorMessage: 'The value must not be of type "number".'
      }
    }

    return true;
  },
}
```

`validator` method can return an object with an error message, the text content of which depends on various conditions.

#### config.

The argument is structurally identical to `validateFieldOnEvent` object in the global config.

The third argument overrides the corresponding properties in the global configuration for the specific field.

So, for example, if we set the following setting for the email field in the example above, the name field will be validated after the blur event, while the email field will be validated after the input event.

```js
{
  event: 'input',
}
```

### Callbacks

There are four types of callbacks:

1. when field or form validation starts: `validation.onStartValidation(callback: function, eventName: string): validation`
2. when field or form validation ends: `validation.onEndValidation(callback: function, eventName: string): validation`
3. when field or form validation succeeded: `validation.onSuccess(callback: function, eventName: string): validation`
4. when field or form validation failed: `validation.onFail(callback: function, eventName: string): validation`

Callbacks have two arguments. The first argument is built-in event object, the second one is the object in case of validation of all fields during submition attemt or a field in case of validation of a field.

The callbacks take two arguments. The first argument is the built-in event object, the second is the object `validation.form` when submitting, or the object (`validation.fields[someFieldId]`) in case of validation of a field.

#### object with a form

Example of the object (`validation.form`):

```js
{
  elem: <form id="form">...</form>,
  formElements: elem.elements,
  submitting: false,
  isSubmitted:  true,
}
```

#### object with a field

Example of the object (`validation.fields[someFieldId]`):

```js
{
  elem: <input id="email" name="email" type="email" placeholder="Enter your email"/>,
  defaultValue: elem.defaultValue,
  rules: [
    {
      validator(inputValue) {
        if (!inputValue.trim()) {
          return true
        }

        const emailRegEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        return inputValue.match(emailRegEx);
      }
      errorMessage: 'Email is invalid'
    },
  ]
  eventHandlers: Map(1) {{
    handlerName: 'validateOnFieldInput',
    event: 'input'
  } => validation.validateOnFieldEvent.bind(validation)},
  isValid: false,
  isPotentiallyValid: false,
  wasValidated: false,
  successMessage: null,
  errorMessage: null,
  errorMessageIsShown: false,
  successMessageIsShown: false,
  config: {
    event: 'input'
  },
}
```
