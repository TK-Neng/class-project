<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { URL } from '../../composable/getUser';
import Nav from './Nav.vue'
const router = useRouter()
const logout = async()=>{
  try {
    const res = await fetch(URL + `/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // เพื่อให้ส่งและรับคุกกี้
    });
    if (res.status === 200) {
      // redirect ไปหน้า login
      router.push({ name: 'Login' });
    }
  }
  catch (error) {
    console.log(error);
  }
}

const createBook = () => {
  router.push({ name: 'AddBook' });
}

const editUser = () => {
  router.push({ name: 'EditUser' });
}
</script>

<template>
    <div class="navbar bg-cyan-100 shadow-lg">
        <div class="flex-1">
            <a class="btn btn-ghost normal-case text-xl font-bold" href="/home">
              <img src="/book.png" alt="book" class="w-10 h-10 inline-block" />
              LMS</a>
        </div>
        <!-- Add center section for search -->
        <div class="flex-1 justify-center">
            <div class="form-control">
                <div class="join">
                    <input type="text" placeholder="Search" class="input input-bordered join-item w-[400px]" />
                    <button class="btn join-item">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <div class="flex-1 justify-end">
            <div class="flex gap-4">
                <div class="dropdown dropdown-end">
                    <div tabindex="0" role="button" class="btn btn-ghost">
                        Manage
                    </div>
                    <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg">
                        <li><a @click="createBook">Add Book</a></li>
                        <li><a @click="editUser">Edit User</a></li>
                    </ul>
                </div>
                <div class="dropdown dropdown-end">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                        <div class="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            <img alt="User Avatar"
                                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                        </div>
                    </div>
                    <ul tabindex="0"
                        class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg">
                        <li>
                            <a class="justify-between">
                                Profile
                                <span class="badge badge-primary">New</span>
                            </a>
                        </li>
                        <li><a>Settings</a></li>
                        <li><a @click="logout">Logout</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
document.head.insertAdjacentHTML('beforeend', '<link rel="icon" type="image/png" href="/book.png" />');
</script>