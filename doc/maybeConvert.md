@function can-type/maybeConvert maybeConvert
@parent can-type
@description Create a converting [can-type.typeobject] that also accepts `null` and `undefined`.

@signature `type.maybe(Type)`

Given a type, provide a [can-type.typeobject] to check values against. Coerces if the value is not of the provided type or `null` or `undefined`.

```js
import { Reflect, type } from "can/everything";

let val = Reflect.convert(42, type.maybeConvert(Number));
// -> 42

val = Reflect.convert(null), type.maybeConvert(Number));
// -> null

val = Reflect.convert(undefined), type.maybeConvert(Number));
// -> undefined

val = Reflect.convert("42", type.maybeConvert(Number));
// -> 42
```

@param {Function} Type A constructor function that values will be checked against.

@return {can-type.typeobject} A [can-type.typeobject] which will enforce conversion to the given type.
