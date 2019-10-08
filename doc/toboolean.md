@property {can-type.typeobject} can-type.ToBoolean ToBoolean
@parent can-type/types
@description A loosely typed Boolean object.

@signature `type.ToBoolean`

  Provides a type that can be used with [can-observable-object] and other APIs that accept a [can-type.typeobject]. Resolves to a coercible Boolean type, equivalent to `type.convert(Boolean)`.

  ```js
  import { Reflect, type } from "can";

  let val = Reflect.convert(false, type.ToBoolean);
  console.log(val); // -> false

  val = Reflect.convert("true", type.ToBoolean);
  console.log(val); // -> true
  ```
  @codepen
