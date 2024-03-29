# gpx-smoother-vue

The GPX Smoother lets you apply a few different "smoothing" algorithms to a GPX file for riding the route on a trainer.

The GPX smoother has been ported to Vue.js to make it easier to import some more complicated smoothing algorithms.
This version of the GPX smoother is also a JAMstack application (uses only JavaScript, APIs and Markup and 
does not depend on a server).

I love riding GPS routes on my Tacx trainer, but I wasn't happy with the built-in functionality for changing the 
elevation profile of a ride. This program was created so that I could ride interesting routes, and set the slope where
 I wanted it, removing steep down-hill and uphill grades.  More features have been added over the years at the request 
 of other riders.

This version of the GPX smoother can be found at: https://www.potter.ca/Biking/smoother-beta/index.html#/

## ToDo List

This is a work in progress...
- [ ] input validation
- [ ] browser compatibility check 
- [ ] accept more than one file type (fit, tcx, kml)
- [ ] try some different UI alternatives for less scrolling 
- [ ] editing the route and elevation from the route map
- [ ] mini elevation chart on the route map
- [ ] draggable points on the elevation charts
- [ ] edit and delete on the undo/redo stack
- [ ] charts code clean-up to get rid of repeated code
- [ ] Vue 3 migration
- [ ] typescript
- [ ] snip the route
- [ ] reverse the route
- [ ] zoom and pan on the graphs
- [ ] zoom to route on the map
- [ ] web worker for long-running processes

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
