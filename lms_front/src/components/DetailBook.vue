<script setup>
import { ref, onBeforeMount, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getBookById } from '../../composable/getBook';
import { useBookStore } from '../../stores/book';
import Nav from './Nav.vue';
import { urlBook } from '../../composable/getBook';
import {urlBorrow} from '../../composable/getBorrow';
import { getBorrow } from '../../composable/getBorrow';
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
const borrow = ref();
const hasPendingBorrow = ref(false);

onBeforeMount(async () => {
    book.value = await getBookById(bookId);
    // Check if user is admin or owner
    const user = await bookStore.getRole();
    isAdmin.value = user.role === 'ADMIN' || user.role === 'OWNER';
    borrow.value = await getBorrow();   
    // Check if user has pending borrow
    if (borrow.value) {
        const pendingBorrow = borrow.value.find(b => 
            b.book.bookId === parseInt(bookId) && b.returnDate === null
        );
        hasPendingBorrow.value = !!pendingBorrow;
    }
});

const canBorrow = computed(() => {
    return !isAdmin.value && book.value?.quantity > 0 && !hasPendingBorrow.value;
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

const showBorrowModal = ref(false);
const returnDate = ref('');

const openBorrowModal = () => {
    showBorrowModal.value = true;
};

const getCurrentDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
};

const getMaxDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 15); // Add 15 days (tomorrow + 14 days)
    return date.toISOString().split('T')[0];
};

const handleBorrow = async () => {
    const selectedDate = new Date(returnDate.value);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 15);
    maxDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < tomorrow || selectedDate > maxDate) {
        showNotification('error', 'Please select a return date within 2 weeks from tomorrow');
        return;
    }

    try {
        const response = await fetch(urlBorrow, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                book_id: book.value.bookId,
                due_date: returnDate.value
            })
        });

        if (!response.ok) {
            throw new Error('Failed to borrow book');
        }

        const data = await response.json();
        showBorrowModal.value = false;
        showNotification('success', 'Book borrowed successfully');
        
        // Redirect to home page after short delay
        setTimeout(() => {
            router.push('/home');
        }, 1500);
        
    } catch (error) {
        console.error('Error borrowing book:', error);
        showNotification('error', 'Failed to borrow book');
    }
};
</script>

<template>
    <Nav />
    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 z-50 bg-gray-500/75">
        <div class="flex min-h-screen items-center justify-center p-4">
            <div class="bg-white rounded-lg w-full max-w-md p-6">
                <div class="flex gap-4 mb-4">
                    <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-lg font-medium">Delete Book</h3>
                        <p class="text-sm text-gray-500">Are you sure? This cannot be undone.</p>
                    </div>
                </div>
                <div class="flex gap-3 justify-end">
                    <button @click="showConfirmModal = false" class="px-4 py-2 text-sm border rounded">Cancel</button>
                    <button @click="confirmDelete" class="px-4 py-2 text-sm bg-red-600 text-white rounded">Delete</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Alert Notification -->
    <div v-if="showAlert" 
         class="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg"
         :class="alertType === 'success' ? 'bg-green-100' : 'bg-red-100'">
        <div class="flex items-center gap-2">
            <svg v-if="alertType === 'success'" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L9 11.586l3.293-3.293a1 1 0 011.414 1.414z"/>
            </svg>
            <svg v-else class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
            </svg>
            <p :class="alertType === 'success' ? 'text-green-700' : 'text-red-700'">{{ alertMessage }}</p>
        </div>
    </div>

    <!-- Borrow Modal -->
    <div v-if="showBorrowModal" class="fixed inset-0 z-50 bg-gray-500/75">
        <div class="flex min-h-screen items-center justify-center p-4">
            <div class="bg-white rounded-lg w-full max-w-md p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-medium text-gray-900">Borrow Book</h3>
                    <button @click="showBorrowModal = false" class="text-gray-400 hover:text-gray-500">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form @submit.prevent="handleBorrow" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Return Date</label>
                        <input v-model="returnDate" 
                               type="date" 
                               required
                               :min="getCurrentDate()"
                               :max="getMaxDate()"
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                        <p class="mt-1 text-sm text-gray-500">Please select a date within 2 weeks</p>
                    </div>
                    <div class="flex gap-3 justify-end mt-4">
                        <button type="button" @click="showBorrowModal = false"
                            class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                            Cancel
                        </button>
                        <button type="submit"
                            class="px-4 py-2 text-sm text-white bg-cyan-600 rounded-md hover:bg-cyan-700">
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto p-4">
        <div v-if="book" class="bg-white rounded-lg shadow">
            <!-- Header -->
            <div class="bg-cyan-600 p-6">
                <h1 class="text-2xl font-bold text-white">{{ book.title }}</h1>
                <p class="text-cyan-100">{{ book.genre }}</p>
            </div>

            <!-- Content -->
            <div class="p-6">
                <div class="grid md:grid-cols-2 gap-6">
                    <!-- Book Image -->
                    <div class="h-[400px] bg-gray-50 rounded flex items-center justify-center">
                        <img :src="`${urlBook}/image/${book.bookId}`" 
                             alt="Book cover"
                             class="max-h-[380px] w-auto object-contain"
                             @error="$event.target.src = '/image/default-book.jpg'" />
                    </div>

                    <!-- Book Details -->
                    <div class="space-y-4">
                        <div class="space-y-2">
                            <h3 class="font-medium">Genres:</h3>
                            <div class="flex flex-wrap gap-2">
                                <span v-for="genre in book.genres" 
                                      :key="genre.id"
                                      class="px-2 py-1 text-sm bg-cyan-100 text-cyan-700 rounded">
                                    {{ genre.name }}
                                </span>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <h3 class="font-medium">Description:</h3>
                            <p class="text-gray-600">{{ book.description }}</p>
                        </div>

                        <div>
                            <h3 class="font-medium">Year Published:</h3>
                            <p class="text-gray-600">{{ book.yearPublication }}</p>
                        </div>

                        <div>
                            <h3 class="font-medium">Author:</h3>
                            <p class="text-gray-600">{{ book.author }}</p>
                        </div>

                        <div v-if="isAdmin">
                            <h3 class="font-medium">Quantity:</h3>
                            <p class="text-gray-600">{{ book.quantity }}</p>
                        </div>

                        <div v-if="!isAdmin">
                            <h3 class="font-medium">Status:</h3>
                            <div>
                                <p v-if="hasPendingBorrow" class="text-yellow-600">
                                    You have a pending borrow for this book
                                </p>
                                <p v-else :class="book.quantity > 0 ? 'text-green-600' : 'text-red-600'">
                                    {{ book.quantity > 0 ? 'Available for borrowing' : 'Full Borrow' }}
                                </p>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex gap-3 pt-4">
                            <button v-if="canBorrow"
                                    @click="openBorrowModal"
                                    class="flex-1 bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700">
                                Borrow
                            </button>
                            <button v-if="isAdmin" 
                                    @click="editBook(book.bookId)"
                                    class="flex-1 bg-cyan-600 text-white px-4 py-2 rounded">
                                Edit
                            </button>
                            <button @click="goBack"
                                    class="flex-1 bg-gray-100 px-4 py-2 rounded">
                                Back
                            </button>
                            <button v-if="isAdmin" 
                                    @click="deleteBook"
                                    class="flex-1 bg-red-600 text-white px-4 py-2 rounded">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>