# Changelog

## [Unreleased]
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

## [0.1.0] - 2017-11-01
### Added
- First release.
