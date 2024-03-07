# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [10.0.0-rc.0](https://github.com/gemini-testing/looks-same/compare/v9.0.0...v10.0.0-rc.0) (2024-03-07)


### ⚠ BREAKING CHANGES

* node versions less than 18.17.0 are no longer supported

* drop node versions less than 18.17.0 ([402cfe0](https://github.com/gemini-testing/looks-same/commit/402cfe08b11796c86572cf6de454c8583792d461))

## [9.0.0](https://github.com/gemini-testing/looks-same/compare/v8.2.4...v9.0.0) (2023-10-31)


### ⚠ BREAKING CHANGES

* node versions less than 18.0.0 are no longer supported

### Features

* drop node versions less than 18 ([1f0097c](https://github.com/gemini-testing/looks-same/commit/1f0097ca7e29e11ba19b82a821c726171505b446))


### Bug Fixes

* run linters ([9d839dd](https://github.com/gemini-testing/looks-same/commit/9d839dd016ac221e03264b2540150ab317c6c290))
* update sharp to fix CVE-2023-4863 ([9b3a0a1](https://github.com/gemini-testing/looks-same/commit/9b3a0a109f3676a0ea00ba1a0b16e1756a5e6bd1))

### [8.2.4](https://github.com/gemini-testing/looks-same/compare/v8.2.3...v8.2.4) (2023-10-11)


### Bug Fixes

* return diffArea in diffClusters if shouldCluster is false ([0c92966](https://github.com/gemini-testing/looks-same/commit/0c929665092fdc79e5db6bb56d7982eeb01ec4e6))

### [8.2.3](https://github.com/gemini-testing/looks-same/compare/v8.2.2...v8.2.3) (2023-09-27)


### Bug Fixes

* createDiffImage off by one ([cd9744b](https://github.com/gemini-testing/looks-same/commit/cd9744b576e56b957f33c3ff2ec3c41a76457a62))

### [8.2.2](https://github.com/gemini-testing/looks-same/compare/v8.2.1...v8.2.2) (2023-09-25)

### [8.2.1](https://github.com/gemini-testing/looks-same/compare/v8.2.0...v8.2.1) (2023-08-02)

## [8.2.0](https://github.com/gemini-testing/looks-same/compare/v8.1.0...v8.2.0) (2023-08-02)


### Features

* calc equality and build diff simultaneously ([abbe9ed](https://github.com/gemini-testing/looks-same/commit/abbe9ed29f18d656317097053e74afe11bacda44))

## [8.1.0](https://github.com/gemini-testing/looks-same/compare/v8.0.0...v8.1.0) (2022-11-21)


### Features

* add different files format support ([d32441a](https://github.com/gemini-testing/looks-same/commit/d32441a31cfa1d7f5ab0cf21663c01e8bad4e87f))

## [8.0.1](https://github.com/gemini-testing/looks-same/compare/v8.0.0...v8.0.1) (2022-09-22)


### Typings

* Update typings to async/await interface
* Export interfaces

## [8.0.0](https://github.com/gemini-testing/looks-same/compare/v7.3.0...v8.0.0) (2022-09-19)


### ⚠ BREAKING CHANGES

* drop support of node versions less than 12
* dropped old node-style callback interface support

### Features

* async-await interface ([b33a6f9](https://github.com/gemini-testing/looks-same/commit/b33a6f925701a3ed6cfe9479cf3d8ad290320be5))
* increase supported node version up to 12 ([ae1e4b2](https://github.com/gemini-testing/looks-same/commit/ae1e4b265ee3f7af25e526256fdd4970b568ff7a))

## [7.3.0](https://github.com/gemini-testing/looks-same/compare/v7.2.4...v7.3.0) (2021-02-03)


### Features

* add ability to compare screens by buffers ([#75](https://github.com/gemini-testing/looks-same/issues/75)) ([039ab0e](https://github.com/gemini-testing/looks-same/commit/039ab0e5ac2b591a46565677a562d3b6898ba4c5))

### [7.2.4](https://github.com/gemini-testing/looks-same/compare/v7.2.3...v7.2.4) (2020-11-13)

### [7.2.3](https://github.com/gemini-testing/looks-same/compare/v7.2.2...v7.2.3) (2020-05-08)


### Bug Fixes

* **prepareOpts:** TypeError when opts is undefined ([#66](https://github.com/gemini-testing/looks-same/issues/66)) ([c6ea6c2](https://github.com/gemini-testing/looks-same/commit/c6ea6c2de99a82e1cf798264e87c3d057f1ae32f))

### [7.2.2](https://github.com/gemini-testing/looks-same/compare/v7.2.1...v7.2.2) (2019-10-28)


### Bug Fixes

* unknown file path in parse png error ([15898d4](https://github.com/gemini-testing/looks-same/commit/15898d4832d7f7ddbf50eab1704ec9bcd093c394))

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
