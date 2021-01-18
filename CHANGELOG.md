# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
- input validation
- browser compatibility check
- accept more than one file type (fit, tcx, kml)
- try some different UI alternatives for less scrolling
- editing the route and elevation from the route map
- mini elevation chart on the route map
- draggable points on the elevation charts
- undo/redo stack
- charts code clean-up to get rid of repeated code
- Vue 3 migration
- typescript
- snip the route
- reverse the route
- zoom and pan on the graphs
- zoom to route on the map

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
    
