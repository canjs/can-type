@property {can-type.typeobject} can-type.Date Date
@parent can-type/types
@description A strictly typed Date object.

@signature `type.Date`

  Provides a type that can be used with [can-observable-object] and other APIs that accept a [can-type.typeobject]. Resolves to a strict Date, equivalent to `type.check(Date)`.

  ```js
  import { Reflect, type } from "can";

  let val = Reflect.convert(new Date(), type.Date);
  console.log(val); // -> "Tue Oct 08 2019 11:40:24 GMT-0400 (Eastern Daylight Time)"

  val = Reflect.convert(999999, type.Date); // throws!
  ```
  @codepen
