# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.9.0] - 2022-03-16
### Added
- added code for updating time stamps to one second intervals. 
### Changed
- Updated slope calculation to remove extra rounding for floating point precision.
- Updated slope display to add a decimal place.
### Fixed
- slope display when the value is 0.

## [1.8.0] - 2021-05-04
### Added
- added an undo/redo stack
- added an overlay while loading or processing

## [1.7.1] - 2021-01-17
### Changed
- fix the change log

## [1.7.0] - 2021-01-17
### Added
- open cycle map to the map layers

## [1.6.0] - 2020-08-14
### Added
- mapping of the route

## [1.5.0] - 2020-08-06
### Added
- the ability to display the chart in metric or imperial

## [1.4.0] - 2020-06-06
### Added
- box score smoothing for slope
- Kalman filter for slope
- change log
### Changed
- the default for maximum change in slope between points
    
## [1.3.0] - 2020-05-03
### Added
- a quick implementation of lapping.  This will currently only work on files with one track containing one track segment
    
## [1.2.0] - 2020-04-18
### Changed    
- load the application version from the package.json at build time
### Fixed
- fixed an issue where the slope legend was throwing an error because the height was not initialized correctly
    
## [1.1.0] - 2020-04-17
### Added
- the slope difficulty feature to allow the slope between each set of points to be increased or decreased by a fixed percentage
- the display of average slope for original and smoothed data
    
## [1.0.0] - 2020-03-22
### Added   
- the ability to decrease precision for latitude, longitude, and elevation
    
