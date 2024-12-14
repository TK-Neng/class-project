<script setup>
// Imports จาก Vue
import { onBeforeMount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

// Imports จาก Store และ Composables
import { useBookStore } from '../../stores/book'
import { URL } from '../../composable/getUser'
import { urlBook } from '../../composable/getBook'

// ประกาศตัวแปรและ Store
const book = useBookStore()
const router = useRouter()
const Role = ref('')
const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)

// ฟังก์ชันค้นหาหนังสือแบบ Real-time
const quickSearch = async () => {
  try {
    isSearching.value = true
    const response = await fetch(`${urlBook}/search?query=${encodeURIComponent(searchQuery.value)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    
    const data = await response.json()
    searchResults.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

// ตั้งค่า Debounce สำหรับการค้นหา
let searchTimeout
watch(searchQuery, (newQuery) => {
  clearTimeout(searchTimeout)
  if (newQuery.trim()) {
    searchTimeout = setTimeout(quickSearch, 300)
  } else {
    searchResults.value = []
  }
})

// ฟังก์ชันนำทาง
const goToBookDetail = (bookId) => {
  router.push({ name: 'DetailBook', params: { id: bookId } })
  searchQuery.value = ''
  searchResults.value = []
}

const createBook = () => router.push({ name: 'AddBook' })
const editUser = () => router.push({ name: 'EditUser' })

// Add new navigation function
const goToProfile = () => router.push({ name: 'Profile' })

// ฟังก์ชันจัดการผู้ใช้
const logout = async () => {
  try {
    const res = await fetch(`${URL}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
    if (res.status === 200) router.push({ name: 'Login' })
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// ดึงข้อมูล Role เมื่อโหลดคอมโพเนนต์
onBeforeMount(async () => {
  Role.value = await book.getRole()
})
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
            <div class="form-control relative">
                <input type="text" 
                       v-model="searchQuery"
                       placeholder="Search books..." 
                       class="input input-bordered w-[400px] focus:outline-none focus:border-cyan-300 transition-all rounded-lg" />
                <!-- Search Results Dropdown -->
                <div v-if="searchResults.length > 0" 
                     class="absolute top-full mt-1 w-[400px] bg-white rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto">
                    <div v-for="book in searchResults" 
                         :key="book.id" 
                         @click="goToBookDetail(book.bookId)"
                         class="p-3 hover:bg-cyan-50 cursor-pointer border-b last:border-b-0">
                        <div class="font-medium text-cyan-800">{{ book.title }}</div>
                        <div class="text-sm text-gray-500">by {{ book.author }}</div>
                    </div>
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
                            <a @click="goToProfile" class="justify-between hover:bg-cyan-50 rounded-lg py-2 transition-colors duration-200">
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