@page can-type
@parent can-data-validation
@collection can-ecosystem
@group can-type/methods 0 methods
@group can-type/types 1 types
@outline 2

@body

## Overview

Use can-type to define rules around types to handle type checking and type conversion. Works well with [can-define], [can-define-object], and [can-stache-define-element].

can-type specifies the following type functions:

### type.check

Use [can-type/check] to specify a strongly typed [can-type.typeobject] that verifies the value passed is of the same type.

```js
import { Reflect, type } from "can/everything";

const StringType = type.check(String);

let val = Reflect.convert("hello world", StringType);
console.log(val);
// -> hello world

Reflect.convert(42, StringType);
// throws!
```
@codepen

### type.maybe

Use [can-type/maybe] to specify a [can-type.typeobject] which will accept a value that is a member of the provided type, or is `undefined` or `null`.

```js
import { Reflect, type } from "can/everything";

const NumberType = type.maybe(Number);

Reflect.convert(42, NumberType);
// -> 42

Reflect.convert(null, NumberType);
// -> null

Reflect.convert(undefined, NumberType);
// -> undefined

Reflect.convert("hello world", NumberType);
// throws!
```
@codepen

### type.convert

Use [can-type/convert] to define a [can-type.typeobject] which will *coerce* the value to the provided type.

```js
import { Reflect, type } from "can/everything";

const NumberType = type.convert(Number);

Reflect.convert("42", NumberType);
// -> 42
```
@codepen

### type.maybeConvert

Use [can-type/maybeConvert] to define a [can-type.typeobject] which will *coerce* the value to the type, but also accept values of `null` and `undefined`.

```js
import { Reflect, type } from "can/everything";

const DateType = type.maybeConvert(Date);

const date = new Date();

Reflect.convert(date, DateType);
// -> date

Reflect.convert(null, DateType);
// -> null

Reflect.convert(undefined, DateType);
// -> undefined

Reflect.convert("12/04/1433", DateType);
// -> Date(1433, 12, 04)
```
@codepen

## Creating Models and ViewModels

can-type is useful for creating typed properties in [can-define-object]. You might want to use stricter type checking for some properties or classes and looser type checking for others. The following creates properties with various properties and type methods:

```js
import { DefineObject, type } from "can/everything";

class Person extends DefineObject {
  static define = {
    first: type.check(String), // type checking is the default behavior
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

console.log( fib ); // ->Person{ ... }
```
@codepen

> Note: as mentioned in the comment above, type checking is the default behavior of [can-define-object], so `first: type.check(String)` could be written as `first: String`.

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

> Note: Having both `type: type.check(Number)` and `default: 0` in the same definition is redundant. Using `default: 0` will automatically set up type checking. It is shown above for clarity.

See [can-stache-define-element] and [can-define-object] for more on its API.
