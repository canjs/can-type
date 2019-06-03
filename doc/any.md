@property {can-type.typeobject} can-type.any Any
@parent can-type
@description The `Any` type represents any type.

@signature `type.Any`

Like an [identity function](https://en.wikipedia.org/wiki/Identity_function), `type.Any` is a [can-type.typeobject] that allows any type of a value to be allowed without checking or coercion.

```js
import { Reflect, type } from "can/ecosystem";

Reflect.convert(42, type.Any);
// -> 42

Reflect.convert(null, type.Any);
// -> null

Reflect.convert([], type.Any);
// -> []

Reflect.convert(new Date(), type.Any);
// Date()
```

`type.Any` returns the same instance as passed into [can-reflect.convert] so they are referentially identical.

```js
import { Reflect, type } from "can/ecosystem";

let today = new Date();

let val = Reflect.convert(today, type.Any);
```
