@function can-type/maybe maybe
@parent can-type/methods 1
@description Create a strictly typed TypeObject that also accepts `null` and `undefined` values.

@signature `type.maybe(Type)`

  Given a type, returns a [can-type.typeobject] that will check values against against that type. Throws if the value is not of the provided type or `null` or `undefined`.

  ```js
  import { Reflect, type } from "can/everything";

  let val = Reflect.convert(42, type.maybe(Number));
  console.log(val); // -> 42

  val = Reflect.convert(null, type.maybe(Number));
  console.log(val); // -> null

  val = Reflect.convert(undefined, type.maybe(Number));
  console.log(val); // -> undefined

  Reflect.convert("42", type.maybe(Number));
  // throws for providing an invalid type.
  ```
  @codepen

  @param {Function} Type A constructor function that values will be checked against.

  @return {can-type.typeobject} A [can-type.typeobject] which will enforce conversion to the given type.
