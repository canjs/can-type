@property {can-type.typeobject} can-type.ToString ToString
@parent can-type/types
@description A loosely typed String object.

@signature `type.ToString`

  Provides a type that can be used with [can-observable-object] and other APIs that accept a [can-type.typeobject]. Resolves to a coercible String type, equivalent to `type.convert(String)`.

  ```js
  import { Reflect, type } from "can";

  let val = Reflect.convert("Hello", type.ToString);
  console.log(val); // -> "Hello"

  val = Reflect.convert(42, type.ToString);
  console.log(val); // -> "42"
  ```
  @codepen
