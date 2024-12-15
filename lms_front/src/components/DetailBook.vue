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
const isAdmin = ref(false); // Add this line to track admin status
const showConfirmModal = ref(false);

const showAlert = ref(false);
const alertType = ref('');
const alertMessage = ref('');

const showNotification = (type, message) => {
    alertType.value = type;
    alertMessage.value = message;
    showAlert.value = true;
    setTimeout(() => {
        showAlert.value = false;
    }, 3000);
};

onBeforeMount(async () => {
    book.value = await getBookById(bookId);
    // Check if user is admin from localStorage or your auth store
    const user = await bookStore.getRole();
    isAdmin.value = user.role === 'ADMIN';
});

const goBack = () => {
    router.push({ path: '/home', query: { page: bookStore.currentPage } });
};

const deleteBook = async () => {
    showConfirmModal.value = true;
};

const confirmDelete = async () => {
    showConfirmModal.value = false;
    try {
        const response = await fetch(`${urlBook}/${bookId}`, {
            method: 'DELETE',
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error('Failed to delete book');
        }

        const data = await response.json();
        showNotification('success', 'Book deleted successfully');
        setTimeout(() => {
            router.push('/home');
        }, 1500);
    } catch (error) {
        console.error('Error deleting book:', error);
        showNotification('error', 'Failed to delete book');
    }
};

const editBook = (bookId) => {
    router.push({name: 'EditBook', query: { edit: true, id: bookId }});
};
</script>

<template>
    <Nav />
    <!-- Add confirmation modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <!-- Background overlay -->
            <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <!-- Modal panel -->
            <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="sm:flex sm:items-start">
                        <div
                            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Book</h3>
                            <div class="mt-2">
                                <p class="text-sm text-gray-500">Are you sure you want to delete this book? This action
                                    cannot be undone.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button @click="confirmDelete"
                        class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                        Delete
                    </button>
                    <button @click="showConfirmModal = false"
                        class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div v-if="showAlert"
        class="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-500" :class="{
            'bg-green-100 border-l-4 border-green-500': alertType === 'success',
            'bg-red-100 border-l-4 border-red-500': alertType === 'error'
        }">
        <div class="flex items-center">
            <div class="flex-shrink-0">
                <svg v-if="alertType === 'success'" class="h-5 w-5 text-green-500" viewBox="0 0 20 20"
                    fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd" />
                </svg>
                <svg v-if="alertType === 'error'" class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clip-rule="evenodd" />
                </svg>
            </div>
            <div class="ml-3">
                <p :class="{
                    'text-green-700': alertType === 'success',
                    'text-red-700': alertType === 'error'
                }">{{ alertMessage }}</p>
            </div>
        </div>
    </div>
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
                            <div class="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
                                style="height: 450px;">
                                <img :src="`${urlBook}/image/${book.bookId}`" alt="Book cover"
                                    class="w-auto max-w-full h-auto max-h-[420px] object-contain rounded-lg"
                                    @error="$event.target.src = '/image/default-book.jpg'" />
                            </div>
                        </div>
                        <div class="space-y-8">
                            <div class="prose max-w-none">
                                <div
                                    class="border-t border-gray-200 pt-6 hover:bg-gray-50/50 transition-colors duration-200 rounded-lg p-4">
                                    <p class="text-gray-800 font-semibold text-lg mb-2">Description:</p>
                                    <p class="text-gray-700 text-lg leading-relaxed">{{ book.description }}</p>
                                </div>
                                <div
                                    class="border-t border-gray-200 pt-6 hover:bg-gray-50/50 transition-colors duration-200 rounded-lg p-4">
                                    <p class="text-gray-800 font-semibold text-lg mb-2">Year Published:</p>
                                    <p class="text-gray-700 text-lg">{{ book.yearPublication }}</p>
                                </div>
                            </div>
                            <div
                                class="border-t border-gray-200 pt-6 hover:bg-gray-50/50 transition-colors duration-200 rounded-lg p-4">
                                <p class="text-gray-800 font-semibold text-lg mb-2">Author:</p>
                                <p class="text-gray-700 text-lg">{{ book.author }}</p>
                            </div>
                            <div v-if="isAdmin" class="border-t border-gray-200 pt-6 hover:bg-gray-50/50 transition-colors duration-200 rounded-lg p-4">
                                <p class="text-gray-800 font-semibold text-lg mb-2">Quantity:</p>
                                <p class="text-gray-700 text-lg">{{ book.quantity }}</p>
                            </div>
                            <div v-if="!isAdmin" class="border-t border-gray-200 pt-6 hover:bg-gray-50/50 transition-colors duration-200 rounded-lg p-4">
                                <p class="text-gray-800 font-semibold text-lg mb-2">Status:</p>
                                <p v-if="book.quantity > 0" class="text-green-600 text-lg">Available for borrowing</p>
                                <p v-else class="text-red-600 text-lg">Full Borrow</p>
                            </div>
                            <div class="flex space-x-6 pt-8">
                                <button v-if="!isAdmin && book.quantity > 0"
                                    class="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-6 py-4 rounded-lg font-medium hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2">
                                    Borrow
                                </button>
                                <button v-if="isAdmin" @click="editBook(book.bookId)"
                                    class="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-6 py-4 rounded-lg font-medium hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2">
                                    Edit
                                </button>
                                <button @click="goBack"
                                    class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-4 rounded-lg font-medium hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                                    Back
                                </button>
                                <button v-if="isAdmin" @click="deleteBook"
                                    class="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg font-medium hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>