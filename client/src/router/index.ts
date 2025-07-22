import { createRouter, createMemoryHistory, RouteRecordRaw } from 'vue-router';
import MainView from '../views/MainView.vue';
import RoomSelectionView from '../views/RoomSelectionView.vue';
const routes: Array<RouteRecordRaw> = [
    {
        component: MainView,
        name: 'Home',
        path: '/',
    },
    {
        component: RoomSelectionView,
        name: 'RoomSelection',
        path: '/room-selection',
    },
];

const router = createRouter({
    history: createMemoryHistory(),
    routes,
});

export default router;