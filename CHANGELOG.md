# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.3]
### Changed
* Renamed the package from `tsipaddr` to `typed-ip`.

## [0.3.2]
### Changed
* Change README from reStructuredText to Markdown for compatibility with npmjs.com

## [0.3.1]
### Added
* Add `chai` assert library.
* Add Travis CI integration.
### Changed
* Make tests single-assert - it's easier for quickly debugging errors.
* Upgrade dependencies.
### Removed
* Remove unnecessary `Network6` tests.
### Fixed
* Fix TS2564 for Typescript >=2.7
* Mark as hidden some forgotten private functions.

## [0.3.0] - 2018-04-21
### Added
- Add `getDecimal` function to `Address4`.
- Add `Address6` and `Network6` classes, initial IPv6 support.
- Add `getFullString` and `getRfc5952` to `Address6`.
### Changed
- Small optimization in broadcast address calculation.

## [0.2.0] - 2017-11-16
### Added
- This changelog :)
- ES3 compatibility.
- Add public documentation; generate it with `npm run doc`.
- Add tests for exceptions.
- Add the internal library `ByteContainer`.
### Changed
- Replaced properties accessors with `get` functions, as Typescript cannot
  generate ES3 code with them.
- All public methods are now explicitly typed.
- Completely remove `ByteArray`, now `ReadonlyArray<number>` is used instead for public interfaces.
- Renamed `getHostmask` with `getWildcard` along with all the internal names and comments.
### Fixed
- Fixed network address calculation.

## [0.1.0] - 2017-11-01
### Added
- First release.
