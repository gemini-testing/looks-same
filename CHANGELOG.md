# Changelog

## 4.1.0 - 2018-12-05

* add ability to ignore antialiasing and caret in "createDiff" method
* add typescript types

## 4.0.0 - 2018-09-11

* Update nodejs to 6 version
* Add ability to make ignore antialiasing less strict

## 3.3.0 - 2017-12-26

* Add `getDiffArea` method

## 3.2.0 - 2017-01-18

* Add ability to ignore caret when it is crossing with text

## 3.1.0 - 2016-11-11

* Add `ignoreAntialiasing` option to ignore diffs with anti-aliased pixels. Enabled by default.

## 3.0.0 - 2016-07-13

* Remove support for 0.10 and 0.12 NodeJS versions.
* Fix ignore caret on devices with `pixelRatio` > 1.
* Fix bug with the missed 1px diff between images when `ignoreCaret` option is enabled.

## 2.2.2 - 2015-12-19

* Use `pngjs2` instead of `lodepng` (@SevInf).

## 2.2.1 - 2015-09-11

* Use `lodepng` for png encoding/decoding (@LinusU).

## 2.2.0 - 2015-09-11

* Expose color comparsion function `looksSame.colors` (@SevInf).

## 2.1.0 - 2015-08-07

* Allow to receive diff image as a Buffer (@flore77).

## 2.0.0 - 2015-07-14

* Fix critical bug in color comparison algorithm.
Published as 2.0.0 because the result of the comparison
will change for many images and affect the dependencies.

## 1.1.1 - 2015-02-12

* Setting both `tolerance` and `strict` fails
  only if `strict` is set to `true`.

## 1.1.0 - 2015-02-11

* Ability to configure tolerance.

## 1.0.1 - 2014-10-01

* Correctly read RGB values from image.

## 1.0.0 - 2014-09-29

* Initial release
