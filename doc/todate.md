@property {can-type.typeobject} can-type.ToDate ToDate
@parent can-type/types
@description A loosely typed Date object.

@signature `type.ToDate`

  Provides a type that can be used with [can-observable-object] and other APIs that accept a [can-type.typeobject]. Resolves to a coercible Date type, equivalent to `type.convert(Date)`.

  ```js
  import { Reflect, type } from "can";

  let val = Reflect.convert(new Date(), type.ToDate);
  console.log(val); // -> "Tue Oct 08 2019 11:40:24 GMT-0400 (Eastern Daylight Time)"

  val = Reflect.convert(1570549224000, type.ToDate);
  console.log(val); // -> Date()
  ```
  @codepen
