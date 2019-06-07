@page can-type
@parent can-data-validation
@collection can-ecosystem
@group can-type/methods 0 methods
@group can-type/types 1 types
@outline 2

@body

## Overview

Use can-type to define type checking rules around types. Works well with [can-define], [can-define-object], and [can-stache-define-element].

can-type specifies the following type functions:

### type.check

Use [can-type/check] to specify a strongly typed TypeObject that verifies the value passed is of the same type.

```js
import { Reflect, type } from "can/everything";

const stringType = type.check(String);

let val = Reflect.convert("hello world", stringType);
console.log(val);
// -> hello world

Reflect.convert(stringType, 42);
// throws!
```


### type.maybe

Use [can-type/maybe] to specify a [can-type.typeobject] which will accept a value that is a memory of the provided type, or is `undefined` or `null`.

```js
import { Reflect, type } from "can/everything";

const numberType = type.maybe(Number);

Reflect.convert(42, numberType);
// -> 42

Reflect.convert(null, numberType);
// -> null

Reflect.convert(undefined, numberType);
// -> undefined

Reflect.convert("hello world", numberType);
// throws!
```

### type.convert

Use [can-type/convert] to define a [can-type.typeobject] which will *coerce* the value to the provided type.

```js
import { Reflect, type } from "can/everything";

const numberType = type.convert(Number);

Reflect.convert("42", numberType);
// -> 42
```

### type.maybeConvert

Use [can-type/maybeConvert] to define a [can-type.typeobject] which will *coerce* the value to the type, but also accept values of `null` and `undefined`.

```js
import { Reflect, type } from "can/everything";

const dateType = type.maybeConvert(Date);

Reflect.convert("12/04/1433", dateType);
// -> Date(1433, 12, 04)
```

## Creating Models and ViewModels

can-type is useful for creating typed properties in [can-define-object]. Some DefineObjects you might want to have stricter type checking, others might need to be loose.

```js
import { DefineObject, type } from "can/everything";

class Person extends DefineObject {
  static define = {
    first: type.check(String),
    last: type.maybe(String),

    age: type.convert(Number),
    birthday: type.maybeConvert(Date)
  };
}

let fib = new Person({
  first: "Fibonacci",
  last: null,
  age: "80",
  birthday: undefined
});

console.log( fib ); // -> { ... }
```
@codepen

When creating models with [can-rest-model] you might want to be loose in the typing of properties, especially when working with external services you do not have control over.

On the other hand, when creating ViewModels for components, such as with [can-stache-define-element] you might want to be stricter about how properties are passed, to prevent mistakes.

```js
import { StacheDefineElement, type } from "can/everything";

class Progress extends StacheDefineElement {
  static define = {
    value: {
      type: type.check(Number),
      default: 0
    },
    max: {
      type: type.check(Number),
      default: 100
    },
    get width() {
      let w = (this.value / this.max) * 100;
      return w + '%';
    }
  };

  static view = `
    <div style="background: black;">
      <span style="background: salmon; display: inline-block; width: {{width}}">&nbsp;</span>
    </div>
  `;
}

customElements.define("custom-progress-bar", Progress);

let progress = new Progress();
progress.value = 34;

document.body.append(progress);

function increment() {
  setTimeout(() => {
    if(progress.value < 100) {
      progress.value++;
      increment();
    }
  }, 500);
}

increment();
```
@codepen

See [can-stache-define-element] and [can-define-object] for more on its API.
