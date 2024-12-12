<script setup>
import { onBeforeMount, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Nav from './Nav.vue';
import { useBookStore } from '../../stores/book';
const book = useBookStore();
const currentPage = ref(book.page);
const router = useRouter()
const route = useRoute()
const data = ref({ data: [] }); // เพิ่ม initial value
const totalPages = ref(); // Assuming there are 5 pages for simplicity
const urlImage = './image/';
const changePage = async (page) => {
  currentPage.value = page;
  book.page = page;
  // อัพเดท URL เมื่อเปลี่ยนหน้า
  router.push({
    query: { page: page }
  });
  data.value = await book.getAllBooks();
};
onBeforeMount(async () => {
  // ดึงเลขหน้าจาก URL หรือใช้ค่าเริ่มต้นเป็น 1
  const pageFromUrl = parseInt(route.query.page) || 1;
  currentPage.value = pageFromUrl;
  book.page = pageFromUrl;
  // โหลดข้อมูลครั้งแรก
  data.value = await book.getAllBooks();
  totalPages.value = data.value.meta.lastPage;
})

</script>

<template>
  <Nav />
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="cards-container flex flex-row flex-wrap justify-center gap-6 px-4">
      <div v-for="book in data.data" :key="book.id" 
           class="card bg-base-100 w-64 shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <figure class="h-64 w-full p-4 flex items-center justify-center bg-gray-50">
          <img :src="`${urlImage}${book.title}.jpg`" 
               alt="Book cover" 
               class="rounded-lg h-full w-full object-contain" />
        </figure>
        <div class="card-body items-center text-center p-4">
          <h2 class="card-title text-lg font-semibold line-clamp-2 h-12 mb-2">{{ book.title }}</h2>
          <span class="px-4 py-1.5 text-sm font-medium rounded-full text-white bg-cyan-500 shadow-sm mb-4">
            {{ book.genre }}
          </span>
          <div class="card-actions">
            <button class="btn btn-primary bg-cyan-600 hover:bg-cyan-700 text-white px-6">
              Borrow
            </button>
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