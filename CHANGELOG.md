# Changelog

All notable changes to this project are documented in this file, based on the
[GitHub releases](https://github.com/node-alarm-dot-com/node-alarm-dot-com/releases).

## [2.5.0] - 2026-07-25

- Add camera primitives
- Fixed various typing issues
- Added some additional guarding

## [2.4.0] - 2026-06-17

- Added an `ExtendedArmingOptions` enum ([#46](https://github.com/node-alarm-dot-com/node-alarm-dot-com/pull/46)).
- Upgraded dependencies.

## [2.3.0-1] - 2026-05-31

- Big refactor:
  - Conforms to TypeScript strict mode.
  - Broke most device logic out of `index.ts` into separate files.
- Fixed GitHub Actions NPM publishing.
- Added support for Alarm.com WebSockets.
- Improved Alarm.com API error reporting ([#44](https://github.com/node-alarm-dot-com/node-alarm-dot-com/pull/44), thanks @metalcated).

## [2.2.0-1] - 2026-04-11

- Attempted update to NPM publishing to use provenance.

## [2.2.0] - 2026-04-11

- Updated the CI pipeline and NPM packages to their latest versions.

## [2.1.1] - 2024-09-21

- Updated documentation for lock methods ([#37](https://github.com/node-alarm-dot-com/node-alarm-dot-com/pull/37), thanks @chase9).
- Housekeeping: updated package versions and began work on access control gates.

## [2.1.0] - 2023-10-09

- Exported utility functions `authenticatedGet` and `authenticatedPost` ([#30](https://github.com/node-alarm-dot-com/node-alarm-dot-com/pull/30), thanks @nfreeze).
- Added support for thermostats ([#31](https://github.com/node-alarm-dot-com/node-alarm-dot-com/pull/31), thanks @pb30).
- Updated README for thermostats ([#32](https://github.com/node-alarm-dot-com/node-alarm-dot-com/pull/32)).
- General refactoring.

## [2.0.0] - 2023-01-29

- Fixed non-dimmable lights ([#23](https://github.com/node-alarm-dot-com/node-alarm-dot-com/pull/23), thanks @kwallac).
- **Breaking:** Dropped support for Node <14.
- Added more sensor types and thermostat states.
- Fixed requests failing with large amounts (>50) of sensors.
- Improved typings.

## [1.11.0] - 2021-08-22

- Added support for passing an MFA token.
- Fixed inconsistent device ordering in `getCurrentState`.
- Fixed `ECONNECT` error when authentication tokens have expired (thanks @DMBlakeley).

## [1.10.0] - 2021-02-06

- Converted the project to TypeScript.
- Fixed night arming.

## [1.9.4] - 2020-08-01

- No user-facing changes.

## [1.9.3] - 2020-08-01

- Updated dependencies.

## [1.9.2] - 2020-08-01

- Fixed a mistake with a ternary assignment.

## [1.9.1] - 2020-08-01

- Fixed an error on systems without garage doors producing an undefined error.

## [1.9.0] - 2020-08-01

- Added garage door support ([#9](https://github.com/node-alarm-dot-com/node-alarm-dot-com/pull/9)).
- Adjusted repository URL in `package.json`.

## [1.8.3] - 2020-07-15

- Expanded return responses into a variable for portability and troubleshooting.
- Cleaned up code comments.

## [1.8.2] - 2020-03-20

- Updated dependencies.

## [1.8.1] - 2020-03-20

- Updated `node-fetch` to version 2 ([#6](https://github.com/node-alarm-dot-com/node-alarm-dot-com/pull/6)).

## [1.8.0] - 2020-03-20

- Fixed login issues.

## [1.7.5] - 2020-01-15

- Refactored the code, reduced the number of methods called, and made variable names more semantic and structurally consistent.

## [1.7.1] - 2020-01-13

- Fixed handling of non-existent accessories (issue #5).

## [1.7.0] - 2019-11-19

- Added support for lights and locks.

## [1.6.2] - 2018-12-24

- README cleanup.

## [1.6.1] - 2018-09-16

- Updated README with details about the removal of FrontPoint from the code.

## [1.6.0] - 2018-09-15

- Stripped out FrontPoint authentication and references, completing the rename from FrontPoint to Alarm.com.
- Initial public releases under the Alarm.com naming (0.3.0 through 1.5.2), including the original login, arm/disarm, and panel/sensor state querying implementation.
