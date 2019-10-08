@property {can-type.typeobject} can-type.ToInteger ToInteger
@parent can-type/types
@description A loosely typed Integer object.

@signature `type.ToInteger`

  Provides a type that can be used with [can-observable-object] and other APIs that accept a [can-type.typeobject]. Resolves to a coercible Integer. JavaScript does not have a native Integer type, so this provides one.

  An integer is a whole, non-fractional, number. This type does the equivalent of `parseInt(val)`.

  ```js
  import { Reflect, type } from "can";

  let val = Reflect.convert(42, type.ToInteger);
  console.log(val); // -> 42

  val = Reflect.convert(42.2, type.ToInteger);
  console.log(val); // -> 42
  ```
  @codepen
