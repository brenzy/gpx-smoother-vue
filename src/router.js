import Vue from 'vue'
import Router from 'vue-router'
import GpxSmoother from "./views/GpxSmoother";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'gpx-smoother',
      component: GpxSmoother
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
  ]
});
