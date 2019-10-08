@property {can-type.typeobject} can-type.Boolean Boolean
@parent can-type/types
@description A strictly typed Boolean object.

@signature `type.Boolean`

  Provides a type that can be used with [can-observable-object] and other APIs that accept a [can-type.typeobject]. Resolves to a strict Boolean, equivalent to `type.check(Boolean)`.

  ```js
  import { Reflect, type } from "can";

  let val = Reflect.convert(false, type.Boolean);
  console.log(val); // -> false

  val = Reflect.convert("true", type.Boolean); // throws!
  ```
  @codepen
