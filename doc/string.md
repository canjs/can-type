@property {can-type.typeobject} can-type.String String
@parent can-type/types
@description A strictly typed String object.

@signature `type.String`

  Provides a type that can be used with [can-observable-object] and other APIs that accept a [can-type.typeobject]. Resolves to a strict String, equivalent to `type.check(String)`.

  ```js
  import { Reflect, type } from "can";

  let val = Reflect.convert("Hello", type.String);
  console.log(val); // -> "Hello"

  val = Reflect.convert(42, type.String); // throws!
  ```
  @codepen
