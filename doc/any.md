@property {can-type.typeobject} can-type.any Any
@parent can-type/types
@description The `Any` type represents any type.

@signature `type.Any`

  Like an [identity function](https://en.wikipedia.org/wiki/Identity_function), `type.Any` is a [can-type.typeobject] that allows any type of a value to be allowed without checking or coercion.

  ```js
  import { Reflect, type } from "can/everything";

  let val = Reflect.convert(42, type.Any);
  console.log(val); // -> 42

  val = Reflect.convert(null, type.Any);
  console.log(val); // -> null

  val = Reflect.convert([], type.Any);
  console.log(val); // -> []

  val = Reflect.convert(new Date(), type.Any);
  console.log(val); // Date()
  ```
  @codepen

  `type.Any` returns the same instance as passed into [can-reflect.convert] so they are referentially identical.

  ```js
  import { Reflect, type } from "can/everything";

  let today = new Date();

  let val = Reflect.convert(today, type.Any);
  console.log(val); // today
  ```
  @codepen
