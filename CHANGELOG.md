# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

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
- Renamed `getHostmask` with `getWildcard` along with all the internal names and comments.
### Fixed
- Fixed network address calculation.

## [0.1.0] - 2017-11-01
### Added
- First release.
