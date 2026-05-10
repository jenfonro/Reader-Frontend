import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "index",
    component: () => import("../views/Index.vue")
  },
  {
    path: "/reader",
    name: "Reader",
    component: () => import("../views/Reader.vue")
  }
];

export default new VueRouter({
  routes
});
