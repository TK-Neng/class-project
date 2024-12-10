import { createRouter, createWebHistory } from "vue-router";
import Login from "../components/Login.vue";
const history = createWebHistory(import.meta.env.BASE_URL);

const routes = [
    {
        path: "/",
        redirect: "/login", // Redirect ไปที่ path /home
    },
    {
        path: "/login",
        name: "Login",
        component: Login,
    }
]

const router = createRouter({history, routes});

export default router;