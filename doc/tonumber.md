@property {can-type.typeobject} can-type.ToNumber ToNumber
@parent can-type/types
@description A loosely typed Number object.

@signature `type.ToNumber`

  Provides a type that can be used with [can-observable-object] and other APIs that accept a [can-type.typeobject]. Resolves to a coercible Number type, equivalent to `type.convert(Number)`.

  ```js
  import { Reflect, type } from "can";

  let val = Reflect.convert(42, type.ToNumber);
  console.log(val); // -> 42

  val = Reflect.convert("42", type.ToNumber);
  console.log(val); // -> 42
  ```
  @codepen
