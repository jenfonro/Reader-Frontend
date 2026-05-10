import { createRouter, createWebHashHistory } from 'vue-router';
import HomePage from '../pages/HomePage.vue';
import ReaderPage from '../pages/ReaderPage.vue';

const routes = [
  {
    path: '/',
    name: 'index',
    component: HomePage,
  },
  {
    path: '/reader',
    name: 'Reader',
    component: ReaderPage,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
