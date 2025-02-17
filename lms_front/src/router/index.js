import { createRouter, createWebHistory } from "vue-router";
import Login from "../components/Login.vue";
const history = createWebHistory(import.meta.env.BASE_URL);
import Home from "../components/Home.vue";
import Register from "../components/Register.vue";
import { URL } from "../../composable/getUser";
import AddBook from "../components/AddBook.vue";
import DetailBook from "../components/DetailBook.vue";
import Profile from "../components/Profile.vue";
import User from "../components/User.vue";
import AddGenre from "../components/AddGenre.vue";
import EditUser from "../components/EditUser.vue";
import AddAdmin from "../components/AddAdmin.vue";
import Borrow from "../components/Borrow.vue";
const routes = [
  {
    path: "/",
    redirect: "/login", // Redirect ไปที่ path /home
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/login", // Redirect ไปที่ path /home
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/home",
    name: "Home",
    component: Home,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/addbook",
    name: "AddBook",
    component: AddBook,
    meta: {
      requiresAuth: true,
      requiresAuthRole: true,
    },
  },
  {
    path: "/book/:id",
    name: "DetailBook",
    component: DetailBook,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/editbook/:id",
    name: "EditBook",
    component: AddBook,
    meta: {
      requiresAuth: true,
      requiresAuthRole: true,
    },
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/user",
    name: "User",
    component: User,
    meta: {
      requiresAuth: true,
      requiresAuthRole: true,
    },
  },
  {
    path: "/addgenre",
    name: "AddGenre",
    component: AddGenre,
    meta: {
      requiresAuth: true,
      requiresAuthRole: true,
    },
  },
  {
    path: "/edituser/:id",
    name: "EditUser",
    component: EditUser,
    meta: {
      requiresAuth: true,
      requiresAuthRole: true,
    },
  },
  {
    path: "/addadmin",
    name: "AddAdmin",
    component: AddAdmin,
    meta: {
      requiresAuth: true,
      requiresAuthRole: true,
    },
  },
  {
    path: "/borrow",
    name: "Borrow",
    component: Borrow,
    meta: {
      requiresAuth: true,
    },
  }
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
      return { authenticated: false, role: null };
    }
    const data = await res.json();
    return { authenticated: data.authenticated, role: data.role };
  } catch (err) {
    return { authenticated: false, role: null };
  }
};

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const { authenticated, role } = await checkSession();

  if (to.meta.requiresAuth) {
    if (!authenticated) {
      alert("Please login first");
      next("/login");
      return;
    }

    if (to.meta.requiresAuthRole && role !== "ADMIN" && role !== "OWNER") {
      alert("Access denied. Admin privileges required.");
      next("/home");
      return;
    }

    next();
  } else if (to.name === "Login" && authenticated) {
    next("/home");
  } else {
    next();
  }
});

export default router;
