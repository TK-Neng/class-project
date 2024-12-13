<script setup>
import { onBeforeMount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { URL } from '../../composable/getUser';
import { useBookStore } from '../../stores/book';
const book = useBookStore();
const router = useRouter()
const Role = ref('');
onBeforeMount(async () => {
  Role.value = await book.getRole();
})
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
    <div class="navbar bg-gradient-to-r from-cyan-50 to-cyan-100 shadow-md transition-all duration-300 px-6">
        <div class="flex-1">
            <a class="btn btn-ghost normal-case text-xl font-bold hover:bg-cyan-200 transition-colors duration-300" href="/home">
              <img src="/book.png" alt="book" class="w-10 h-10 inline-block hover:scale-110 transition-transform duration-300" />
              <span class="ml-2 text-cyan-800">LMS</span>
            </a>
        </div>
        <div class="flex-1 justify-center">
            <div class="form-control">
                <div class="join shadow-sm">
                    <input type="text" placeholder="Search books..." 
                           class="input input-bordered join-item w-[400px] focus:outline-none focus:border-cyan-300 transition-all" />
                    <button class="btn join-item bg-cyan-600 hover:bg-cyan-700 text-white border-none">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <div class="flex-1 justify-end">
            <div class="flex gap-4 items-center">
                <div v-if="Role === 'ADMIN'" class="dropdown dropdown-end">
                    <div tabindex="0" role="button" class="btn btn-ghost hover:bg-cyan-200 transition-colors duration-300">
                        <span class="text-cyan-800">Manage</span>
                    </div>
                    <ul tabindex="0" class="menu menu-sm dropdown-content bg-white rounded-xl z-[1] mt-3 w-52 p-2 shadow-xl">
                        <li><a @click="createBook" class="hover:bg-cyan-50 rounded-lg py-2 transition-colors duration-200">Add Book</a></li>
                        <li><a @click="editUser" class="hover:bg-cyan-50 rounded-lg py-2 transition-colors duration-200">Edit User</a></li>
                    </ul>
                </div>
                <div class="dropdown dropdown-end">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar hover:scale-105 transition-transform duration-300">
                        <div class="w-10 rounded-full ring ring-cyan-400 ring-offset-base-100 ring-offset-2">
                            <img alt="User Avatar"
                                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                        </div>
                    </div>
                    <ul tabindex="0"
                        class="menu menu-sm dropdown-content bg-white rounded-xl z-[1] mt-3 w-52 p-2 shadow-xl">
                        <li>
                            <a class="justify-between hover:bg-cyan-50 rounded-lg py-2 transition-colors duration-200">
                                Profile
                                <span class="badge bg-cyan-500 text-white border-none">New</span>
                            </a>
                        </li>
                        <li><a class="hover:bg-cyan-50 rounded-lg py-2 transition-colors duration-200">Settings</a></li>
                        <li><a @click="logout" class="hover:bg-red-50 rounded-lg py-2 transition-colors duration-200 text-red-600">Logout</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>