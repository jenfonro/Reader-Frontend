import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "index",
    component: () => import("../views/Index.vue")
  },
  {
    path: "/reader",
    name: "reader",
    component: () => import("../views/Reader.vue")
  }
];

export default createRouter({
  history: createWebHashHistory(),
  routes
});
