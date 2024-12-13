<script setup>
import { ref, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getBookById } from '../../composable/getBook';
import { useBookStore } from '../../stores/book';
import Nav from './Nav.vue';
import { urlBook } from '../../composable/getBook';

const route = useRoute();
const router = useRouter();
const bookStore = useBookStore();
const bookId = route.params.id;
const book = ref(null);


onBeforeMount(async () => {
    book.value = await getBookById(bookId);
    console.log(book.value);
});

const goBack = () => {
    router.push({ path: '/home', query: { page: bookStore.currentPage } });
};
</script>

<template>
    <Nav />
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div v-if="book" class="max-w-4xl mx-auto">
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                <div class="bg-gradient-to-r from-cyan-600 to-cyan-700 p-8 relative overflow-hidden">
                    <div class="absolute inset-0 bg-black opacity-10"></div>
                    <h1 class="text-4xl font-bold text-white relative z-10 tracking-tight">{{ book.title }}</h1>
                    <p class="text-cyan-100 mt-3 text-xl font-light relative z-10">{{ book.genre }}</p>
                </div>
                <div class="p-6 md:p-10">
                    <div class="grid md:grid-cols-2 gap-10">
                        <div class="space-y-4">
                            <div class="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center" style="height: 450px;">
                                <img 
                                    :src="`${urlBook}/image/${book.bookId}`" 
                                    alt="Book cover" 
                                    class="w-auto max-w-full h-auto max-h-[420px] object-contain rounded-lg"
                                    @error="$event.target.src = '/image/default-book.jpg'"
                                />
                            </div>
                        </div>
                        <div class="space-y-8">
                            <div class="prose max-w-none">
                                <div class="border-t border-gray-200 pt-6 hover:bg-gray-50/50 transition-colors duration-200 rounded-lg p-4">
                                    <p class="text-gray-800 font-semibold text-lg mb-2">Description:</p>
                                    <p class="text-gray-700 text-lg leading-relaxed">{{ book.description }}</p>
                                </div>
                                <div class="border-t border-gray-200 pt-6 hover:bg-gray-50/50 transition-colors duration-200 rounded-lg p-4">
                                    <p class="text-gray-800 font-semibold text-lg mb-2">Year Published:</p>
                                    <p class="text-gray-700 text-lg">{{ book.yearPublication }}</p>
                                </div>
                            </div>
                            <div class="border-t border-gray-200 pt-6 hover:bg-gray-50/50 transition-colors duration-200 rounded-lg p-4">
                                <p class="text-gray-800 font-semibold text-lg mb-2">Author:</p>
                                <p class="text-gray-700 text-lg">{{ book.author }}</p>
                            </div>
                            <div class="flex space-x-6 pt-8">
                                <button class="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-6 py-4 rounded-lg font-medium hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2">
                                    Borrow
                                </button>
                                <button 
                                    @click="goBack" 
                                    class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-4 rounded-lg font-medium hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>