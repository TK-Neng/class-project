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
const userName = ref('')
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

// ปรับปรุงฟังก์ชันนำทาง
const goToBookDetail = async (bookId) => {
  const currentRoute = router.currentRoute.value
  if (currentRoute.name === 'DetailBook') {
    // ถ้าอยู่ที่หน้า DetailBook อยู่แล้ว ให้ใช้ replace แทน push
    await router.replace({ name: 'DetailBook', params: { id: bookId } })
    // Reload component by forcing a refresh
    window.location.reload()
  } else {
    // ถ้าอยู่หน้าอื่น ให้ใช้ push ตามปกติ
    await router.push({ name: 'DetailBook', params: { id: bookId } })
  }
  searchQuery.value = ''
  searchResults.value = []
}

const createBook = () => router.push({ name: 'AddBook' })
const editUser = () => router.push({ name: 'User' })
const createGenre = () => router.push({ name: 'AddGenre' })
const viewBorrow = () => router.push({ name: 'Borrow' })
// Add new navigation function
const goToProfile = () => router.push({ name: 'Profile' })
const goBorrow = () => router.push({ name: 'Borrow' })

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
  const data = await book.getRole()
  Role.value = data.role
  userName.value = data.username
})
</script>

<template>
    <div class="navbar bg-gradient-to-r from-cyan-50 to-cyan-100 shadow-lg transition-all duration-300 px-8 h-16">
        <div class="flex-1">
            <a class="btn btn-ghost normal-case text-xl font-bold hover:bg-cyan-200/50 rounded-xl transition-all duration-300" href="/home">
                <img src="/book.png" alt="book" class="w-8 h-8 inline-block hover:rotate-12 transition-all duration-300" />
                <span class="ml-2 text-cyan-800 hover:text-cyan-600">LMS</span>
            </a>
        </div>
        <div class="flex-1 justify-center">
            <div class="form-control relative">
                <input type="text" 
                       v-model="searchQuery"
                       placeholder="Search books..." 
                       class="input input-bordered w-[400px] bg-white/70 backdrop-blur-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/50 transition-all duration-300 rounded-xl shadow-sm" />
                <!-- Search Results Dropdown -->
                <div v-if="searchResults.length > 0" 
                     class="absolute top-full mt-2 w-[400px] bg-white/95 backdrop-blur-md rounded-xl shadow-xl z-50 max-h-[300px] overflow-y-auto border border-cyan-100">
                    <div v-for="book in searchResults" 
                         :key="book.id" 
                         @click="goToBookDetail(book.bookId)"
                         class="p-3 hover:bg-cyan-50/80 cursor-pointer border-b border-cyan-100 last:border-b-0 transition-colors duration-200">
                        <div class="font-medium text-cyan-800">{{ book.title }}</div>
                        <div class="text-sm text-cyan-600/70">by {{ book.author }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex-1 justify-end">
            <div class="flex gap-6 items-center">
                <div v-if="Role === 'ADMIN' || Role === 'OWNER'" class="dropdown dropdown-end">
                    <div tabindex="0" role="button" class="btn btn-ghost hover:bg-cyan-200/50 rounded-xl transition-all duration-300">
                        <span class="text-cyan-800 font-medium">Manage</span>
                    </div>
                    <ul tabindex="0" class="menu menu-sm dropdown-content bg-white/95 backdrop-blur-md rounded-xl z-[1] mt-3 w-52 p-2 shadow-xl border border-cyan-100">
                        <li><a @click="createBook" class="hover:bg-cyan-50/80 rounded-lg py-3 transition-all duration-200 text-cyan-700">Book</a></li>
                        <li><a @click="createGenre" class="hover:bg-cyan-50/80 rounded-lg py-3 transition-all duration-200 text-cyan-700">Genre</a></li>
                        <li><a @click="editUser" class="hover:bg-cyan-50/80 rounded-lg py-3 transition-all duration-200 text-cyan-700">User</a></li> 
                        <li><a @click="viewBorrow" class="hover:bg-cyan-50/80 rounded-lg py-3 transition-all duration-200 text-cyan-700">Borrow</a></li> 
                      </ul>
                </div>
                <div class="dropdown dropdown-end">
                    <div tabindex="0" role="button" 
                         class="btn btn-ghost hover:bg-cyan-100 rounded-xl transition-all duration-300 flex items-center gap-2 group">
                        <span class="text-cyan-800 font-medium">{{ userName }}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" 
                             class="h-4 w-4 text-cyan-600 transform transition-all duration-200 ease-out group-hover:text-cyan-700 group-hover:-rotate-90 group-hover:scale-110" 
                             fill="none" 
                             viewBox="0 0 24 24" 
                             stroke="currentColor"
                             stroke-width="2">
                            <path stroke-linecap="round" 
                                  stroke-linejoin="round" 
                                  d="M15 19l-7-7 7-7" />
                        </svg>
                    </div>
                    <ul tabindex="0"
                        class="menu menu-sm dropdown-content bg-white/95 backdrop-blur-md rounded-xl z-[1] mt-3 w-52 p-2 shadow-xl border border-cyan-100">
                        <li>
                            <a @click="goToProfile" class="flex items-center gap-2 hover:bg-cyan-50/80 rounded-lg py-3 transition-all duration-200 text-cyan-700">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>Profile</span>
                            </a>
                        </li>
                        <li v-if="Role === 'USER'">
                            <a @click="goBorrow" class="flex items-center gap-2 hover:bg-cyan-50/80 rounded-lg py-3 transition-all duration-200 text-cyan-700">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span>My Borrow</span>
                            </a>
                        </li>
                        <li>
                            <a @click="logout" class="flex items-center gap-2 hover:bg-red-50/80 rounded-lg py-3 transition-all duration-200 text-red-500 mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Logout</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>