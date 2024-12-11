import { createRouter, createWebHistory } from "vue-router";
import Login from "../components/Login.vue";
const history = createWebHistory(import.meta.env.BASE_URL);
import Home from "../components/Home.vue";
import { URL } from "../../composable/getBook";
const routes = [
  {
    path: "/",
    redirect: "/login", // Redirect ไปที่ path /home
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/home",
    name: "Home",
    component: Home,
    meta: {
      requiresAuth: true,
    },
  },
];

const router = createRouter({ history, routes });

const checkSession = async () => {
  try {
    const res = await fetch(`${URL}/auth/session`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (res.status === 404) {
      return false;
    }
    const data = await res.json();
    console.log(data.role);
    return data.authenticated;
  } catch (err) {
    return false;
  }
};

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = await checkSession(); // ตรวจสอบสถานะการล็อกอิน

  if (to.meta.requiresAuth) {
    if (isAuthenticated) {
      next(); // อนุญาตให้ไปที่หน้า Home
    } else {
      alert("Please login first");
      next("/login"); // เปลี่ยนเส้นทางไปหน้า Login
    }
  } else if (to.name === "Login" && isAuthenticated) {
    // หากผู้ใช้ล็อกอินแล้ว ไม่ให้กลับไปที่หน้า Login
    next("/home");
  } else {
    next(); // เส้นทางที่ไม่ต้องการการล็อกอิน
  }
});

export default router;
