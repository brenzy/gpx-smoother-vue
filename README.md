# gpx-smoother-vue

The GPX smoother is being ported to Vue.js.  This will make it easier to import some more complicated smoothing algorithms.

## ToDo List

This is a work in progress...

- [x] set up the project
- [x] initialize the vuex store and the load the GPX file into the store
- [x] initialize the d3 library
- [x] elevation graph
- [x] slope graph
- [x] elevation profile graph
- [x] box smoothing
- [x] set slope range
- [x] flatten values
- [x] elevate values
- [x] working on part of the data only
- [x] saving the gpx file
- [ ] Savitzky–Golay filter
- [ ] input validation
- [ ] browser compatibility
- [ ] map the route
- [ ] accept more than one file type

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
