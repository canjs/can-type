@property {can-type.typeobject} can-type.Integer Integer
@parent can-type/types
@description A strictly typed Integer object.

@signature `type.Integer`

  Provides a type that can be used with [can-observable-object] and other APIs that accept a [can-type.typeobject]. Resolves to a strict Integer. JavaScript does not have a native Integer type, so this provides one.

  An integer is a whole, non-fractional, number.

  ```js
  import { Reflect, type } from "can";

  let val = Reflect.convert(42, type.Integer);
  console.log(val); // -> 42

  val = Reflect.convert(42.2, type.Integer); // throws!
  ```
  @codepen
