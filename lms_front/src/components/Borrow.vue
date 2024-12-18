<script setup>
import { ref, onBeforeMount } from 'vue';
import Nav from './Nav.vue';
import { useRouter } from 'vue-router';
import { useBookStore } from '../../stores/book'
const book = useBookStore()
const router = useRouter();
const Role = ref(null);
const goToBack = () => {
    router.push({ name: 'Home' });
}
onBeforeMount(async () => {
    Role.value = await book.getRole();
})
</script>

<template>
    <Nav />
    <div class="min-h-screen bg-gray-100">
        <!-- Admin/Owner View -->
        <div v-if="Role?.role === 'ADMIN' || Role?.role === 'OWNER'" class="container mx-auto px-4 py-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-6">Borrow Management</h1>
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Borrow Statistics -->
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h2 class="text-xl font-semibold text-blue-800 mb-3">Borrow Statistics</h2>
                        <!-- Add statistics content here -->
                    </div>
                    <!-- Pending Requests -->
                    <div class="bg-yellow-50 p-4 rounded-lg">
                        <h2 class="text-xl font-semibold text-yellow-800 mb-3">Pending Requests</h2>
                        <!-- Add pending requests content here -->
                    </div>
                    <!-- Recent Activities -->
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h2 class="text-xl font-semibold text-green-800 mb-3">Recent Activities</h2>
                        <!-- Add recent activities content here -->
                    </div>
                </div>
            </div>
        </div>

        <!-- User View -->
        <div v-else-if="Role?.role === 'USER'" class="container mx-auto px-4 py-8">
            <h1 class="text-2xl font-bold text-gray-800 mb-6">My Borrowings</h1>
            <div class="bg-white rounded-lg shadow-md p-6">
                <!-- Current Borrowed Books -->
                <div class="mb-8">
                    <h2 class="text-xl font-semibold text-gray-700 mb-4">Currently Borrowed</h2>
                    <div class="bg-gray-50 rounded-lg p-4">
                        <!-- Add borrowed books list here -->
                    </div>
                </div>
                
                <!-- Borrow History -->
                <div class="mb-8">
                    <h2 class="text-xl font-semibold text-gray-700 mb-4">Borrow History</h2>
                    <div class="bg-gray-50 rounded-lg p-4">
                        <!-- Add borrow history here -->
                    </div>
                </div>

                <div class="text-center">
                    <button @click="goToBack" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300">
                        Back
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>