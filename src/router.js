import Vue from 'vue';
import Router from 'vue-router';
import GpxSmoother from '@/views/GpxSmoother';
import RouteMap from '@/views/RouteMap';
import History from '@/views/History';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'gpx-smoother',
      component: GpxSmoother
    },
    {
      path: '/route-map',
      name: 'route-map',
      component: RouteMap
    },
    {
      path: '/history',
      name: 'history',
      component: History
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import(/* webpackChunkName: "contact" */ './views/Contact.vue')
    }
  ],
  scrollBehavior () {
    return {x: 0, y: 0};
  }
});
