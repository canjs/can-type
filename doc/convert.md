@function can-type/convert convert
@parent can-type/methods 2
@description Create a coercing [can-type.typeobject].

@signature `type.convert(Type)`

  Given a type, returns a [can-type.typeobject] that will coerce values to that type.

  ```js
  import { Reflect, type } from "can/everything";

  let date = new Date();
  let val = Reflect.convert(date, type.convert(Date));
  console.log(val); // date

  val = Reflect.convert("12/14/1933", type.convert(Date));
  console.log(val); // Date{12/14/1933}
  ```
  @codepen

  @param {Function} Type A constructor function that values will be checked against.

  @return {can-type.typeobject} A [can-type.typeobject] which will *coerce* values to the provided type.
