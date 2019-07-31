@function can-type/late late
@parent can-type/methods 4
@description Define a function that returns a type.
@signature `type.late(fn)`

  Given a function, returns a [can-type.typeobject] that will unwrap to the underlying type by calling `fn`.

  ```js
  import { ObservableObject, type } from "can/everything";

  class Faves extends ObservableObject {
    static props = {
      faves: type.late(() => type.convert(Faves))
    }
  }

  let faves = new Faves({
    faves: {}
  });

  console.log("faves.faves is a Faves?", faves.faves instanceof Faves);
  ```
  @codepen

  @param {Function} fn A function that when called returns a [can-type.typeobject].

  @return {can-type.typeobject} A [can-type.typeobject] that also includes a `can.unwrapType` symbol that returns the underlying [can-type.typeobject].
