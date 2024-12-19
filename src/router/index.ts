import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/count-ppt-word',
      name: 'countPptWord',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/count-ppt-word/CountPptWord.vue'),
    },
    {
      path: '/flip-clock',
      name: 'flipClock',
      component: () => import('../views/flip-clock/FlipClock.vue'),
    },
  ],
})

export default router
