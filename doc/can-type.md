@module {Object} can-type
@parent can-data-validation
@collection can-core
@group can-type/methods 0 methods
@group can-type/types 1 types
@package ../package.json
@outline 2

@body

## Overview

Use can-type to define rules around types to handle type checking and type conversion. Works well with [can-define], [can-observable-object], and [can-stache-element].

can-type specifies the following type functions:

### type.maybe

Use [can-type/maybe] to specify a [can-type.typeobject] which will accept a value that is a member of the provided type, or is `undefined` or `null`.

```js
import { Reflect, type } from "can";

const NumberType = type.maybe(Number);

let val = Reflect.convert(42, NumberType);
console.log(val); // -> 42

val = Reflect.convert(null, NumberType);
console.log(val); // -> null

val = Reflect.convert(undefined, NumberType);
console.log(val); // -> undefined

Reflect.convert("hello world", NumberType); // throws!
```
@codepen

### type.convert

Use [can-type/convert] to define a [can-type.typeobject] which will *coerce* the value to the provided type.

```js
import { Reflect, type } from "can";

const NumberType = type.convert(Number);

let val = Reflect.convert("42", NumberType);
console.log(val); // -> 42
```
@codepen

### type.maybeConvert

Use [can-type/maybeConvert] to define a [can-type.typeobject] which will *coerce* the value to the type, but also accept values of `null` and `undefined`.

```js
import { Reflect, type } from "can";

const DateType = type.maybeConvert(Date);

const date = new Date();

let val = Reflect.convert(date, DateType);
console.log(val); // -> date

val = Reflect.convert(null, DateType);
console.log(val); // -> null

val = Reflect.convert(undefined, DateType);
console.log(val); // -> undefined

val = Reflect.convert("12/04/1433", DateType);
console.log(val); // -> Date{12/04/1433}
```
@codepen

### type.check

Use [can-type/check] to specify a strongly typed [can-type.typeobject] that verifies the value passed is of the same type.

```js
import { Reflect, type } from "can";

const StringType = type.check(String);

let val = Reflect.convert("hello world", StringType);
console.log(val); // -> hello world

Reflect.convert(42, StringType); // throws!
```
@codepen

## Creating Models and ViewModels

can-type is useful for creating typed properties in [can-observable-object]. You might want to use stricter type checking for some properties or classes and looser type checking for others. The following creates properties with various properties and type methods:

```js
import { ObservableObject, type } from "can";

class Person extends ObservableObject {
  static props = {
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

console.log(fib); // ->Person{ ... }
```
@codepen

> Note: as mentioned in the comment above, type checking is the default behavior of [can-observable-object], so `first: type.check(String)` could be written as `first: String`.

When creating models with [can-rest-model] you might want to be loose in the typing of properties, especially when working with external services you do not have control over.

On the other hand, when creating ViewModels for components, such as with [can-stache-element] you might want to be stricter about how properties are passed, to prevent mistakes.

```js
import { StacheElement, type } from "can";

class Progress extends StacheElement {
  static props = {
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

See [can-stache-element] and [can-observable-object] for more on these APIs.

## How it works

The `can-type` methods work by creating functions that are compatible with [can-reflect.convert canReflect.convert].

These functions have a [can-symbol/symbols/new] Symbol that points to a function that is responsible for creating an instance of the type. The following is an overview of how this function works:

__1. Determine if value is already the correct type__

- Maybe types (`type.maybe`, `type.maybeConvert`) will return `true` if the value is `null` or `undefined`.
- Common primitive types (`Number`, `String`, `Boolean`) will return `true` if [typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof) returns the correct result.
- Other types will return `true` if the value is an [instanceof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof) the type.
- [can-type.typeobject TypeObjects] (or anything with a `can.isMember` Symbol) will return `true` if the `can.isMember` function returns `true`.
- Otherwise, the value is not the correct type.

__2. Handle values of another type__

If the value is not the correct type:

- `type.maybe` and `type.check` will throw an error.
- `type.convert` and `type.maybeConvert` will convert the value using [can-reflect.convert].

## Applying multiple type functions

The type functions [can-type/check], [can-type/convert], [can-type/maybe], and [can-type/maybeConvert] all return a [can-type.typeobject]. Since they also can take a TypeObject as an argument, this means you can apply multiple type functions.

For example, using [can-type/convert] and [can-type/maybe] is equivalent to using [can-type/maybeConvert]:

```js
import { Reflect, type } from "can";

const MaybeConvertString = type.convert(type.maybe(String));

console.log(2, Reflect.convert(2, MaybeConvertString)); // "2"
console.log(null, Reflect.convert(2, MaybeConvertString)); // null
```
@codepen

Another example is taking a strict type and making it a converter type by wrapping with [can-type/convert]:

```js
import { Reflect, can } from "can";

const StrictString = type.check(String);
const NonStrictString = type.convert(StrictString);

console.log("Converting: ", Reflect.convert(5, NonStrictString)); // "5"
```
@codepen

This works because the type functions all keep a reference to the underlying type and simply toggle the *strictness* of the newly created TypeObject. When [can-symbol/symbols/new] is called the strictness is checked.
