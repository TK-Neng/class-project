<script setup>
import { onBeforeMount, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Nav from './Nav.vue';
import { useBookStore } from '../../stores/book';
const Role = ref(null);
const book = useBookStore();
const currentPage = ref(book.page);
const router = useRouter()
const route = useRoute()
const data = ref({ data: [] }); // เพิ่ม initial value
const totalPages = ref(); // Assuming there are 5 pages for simplicity
const totalBooks = ref(0);
import { urlBook } from '../../composable/getBook';
const changePage = async (page) => {
  currentPage.value = page;
  book.page = page;
  book.currentPage = page; // Store current page
  // อัพเดท URL เมื่อเปลี่ยนหน้า
  router.push({
    query: { page: page }
  });
  data.value = await book.getAllBooks();
};
const navigateToDetail = (bookId) => {
  router.push({ name: 'DetailBook', params: { id: bookId } });
};
onBeforeMount(async () => {
  // ดึงเลขหน้าจาก URL หรือใช้ค่าเริ่มต้นเป็น 1
  const pageFromUrl = parseInt(route.query.page) || 1;
  currentPage.value = pageFromUrl;
  book.page = pageFromUrl;
  book.currentPage = pageFromUrl; 
  // โหลดข้อมูลครั้งแรก
  data.value = await book.getAllBooks();
  totalPages.value = data.value.meta.lastPage;
  totalBooks.value = data.value.meta.total;
  Role.value = await book.getRole();
})

</script>

<template>
  <Nav />
  <!-- Add this div after Nav -->
  <div v-if="Role?.role === 'ADMIN'" class="bg-white shadow-md p-4 mx-auto max-w-7xl mt-4 rounded-lg">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-800">Total Books</h2>
      <div class="bg-cyan-100 px-4 py-2 rounded-full">
        <span class="text-cyan-800 font-bold">{{ totalBooks }}</span>
        <span class="text-cyan-600 ml-1">Books</span>
      </div>
    </div>
  </div>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="cards-container flex flex-row flex-wrap justify-center gap-6 px-4">
      <div v-for="book in data.data" :key="book.id" 
           class="card bg-base-100 w-64 shadow-xl hover:shadow-2xl transition-shadow duration-300"
           @click="navigateToDetail(book.bookId)">
        <figure class="h-64 w-full p-4 flex items-center justify-center bg-gray-50">
          <img :src="`${urlBook}/image/${book.bookId}`" 
               alt="Book cover" 
               class="rounded-lg h-full w-full object-contain" />
        </figure>
        <div class="card-body items-center text-center p-4">
          <h2 class="card-title text-base font-semibold line-clamp-2 h-12 mb-2">{{ book.title }}</h2>
          <div class="flex flex-wrap gap-2 justify-center">
            <span v-for="(genre, index) in book.genres.slice(0, 2)" 
                  :key="index"
                  class="px-3 py-1 text-sm font-medium rounded-full text-white bg-cyan-500 shadow-sm">
              {{ genre.name }}
            </span>
            <span v-if="book.genres.length > 2"
                  class="px-3 py-1 text-sm font-medium rounded-full text-white bg-cyan-700 shadow-sm">
              +{{ book.genres.length - 2 }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="pagination-controls my-8 flex justify-center">
      <button v-for="page in totalPages" 
              :key="page" 
              @click="changePage(page)"
              :class="{ 'bg-cyan-500 text-white': currentPage === page }" 
              class="btn w-10 h-10 btn-circle mx-1 bg-cyan-100 hover:bg-cyan-400 transition-colors duration-300">
        {{ page }}
      </button>
    </div>
  </div>
</template>