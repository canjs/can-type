@function can-type/maybe maybe
@parent can-type
@description Create a strictly typed TypeObject that also accepts `null` and `undefined` values.

@signature `type.maybe(Type)`

Given a type, provide a [can-type.typeobject] to check values against. Throws if the value is not of the provided type or `null` or `undefined`.

```js
import { Reflect, type } from "can/everything";

let val = Reflect.convert(42, type.maybe(Number));
// -> 42

val = Reflect.convert(null), type.maybe(Number));
// -> null

val = Reflect.convert(undefined), type.maybe(Number));
// -> undefined

val = Reflect.convert("42", type.maybe(Number));
// throws for providing an invalid type.
```

@param {Function} Type A constructor function that values will be checked against.

@return {can-type.typeobject} A [can-type.typeobject] which will enforce conversion to the given type.
