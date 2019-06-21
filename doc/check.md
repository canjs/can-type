@function can-type/check check
@parent can-type/methods 0
@description Create a strictly typed TypeObject.

@signature `type.check(Type)`

  Given a type, returns a [can-type.typeobject] that will check values against that type. Throws if another type is provided as a value.

  ```js
  import { Reflect, type } from "can/everything";

  let val = Reflect.convert(new Date(), type.check(Date));
  console.log(val); // Date()

  Reflect.convert("12/14/1933", type.check(Date));
  // throws for providing an invalid type.
  ```
  @codepen

  @param {Function} Type A constructor function that values will be checked against.

  @return {can-type.typeobject} A [can-type.typeobject] which will strictly enforce values of the provided type.
