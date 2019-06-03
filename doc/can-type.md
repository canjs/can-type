@page can-type
@parent can-data-validation
@collection can-ecosystem
@description Define type objects that can coerce and check types.

@body

## Usage

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
