@property {can-type.typeobject} can-type.Number Number
@parent can-type/types
@description A strictly typed Number object.

@signature `type.Number`

  Provides a type that can be used with [can-observable-object] and other APIs that accept a [can-type.typeobject]. Resolves to a strict Number, equivalent to `type.check(Number)`.

  ```js
  import { Reflect, type } from "can";

  let val = Reflect.convert(42, type.Number);
  console.log(val); // -> 42

  val = Reflect.convert("42", type.Number); // throws!
  ```
  @codepen
