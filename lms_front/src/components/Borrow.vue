<script setup>
import { ref, onBeforeMount } from 'vue';
import { getBorrow } from '../../composable/getBorrow';
import Nav from './Nav.vue';
import { useRouter } from 'vue-router';
import { useBookStore } from '../../stores/book'
const book = useBookStore()
const router = useRouter();
const Role = ref(null);
const borrow = ref();
const goToBack = () => {
    router.push({ name: 'Home' });
}
const goToReturn = (borrowId) => {
    // TODO: Implement return functionality
    console.log('Return book:', borrowId);
}
onBeforeMount(async () => {
    Role.value = await book.getRole();
    borrow.value = await getBorrow();
    console.log(borrow.value);
})

const formatDate = (date) => {
    console.log(date);
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const getStatus = (item) => {
    if (item.returnDate) return 'Returned';
    const dueDate = new Date(item.dueDate);
    const today = new Date();
    return today > dueDate ? 'Overdue' : 'Borrowed';
};

const getStatusClass = (item) => {
    const status = getStatus(item);
    return {
        'px-2 py-1 rounded-full text-xs font-medium': true,
        'bg-green-100 text-green-800': status === 'Returned',
        'bg-yellow-100 text-yellow-800': status === 'Borrowed',
        'bg-red-100 text-red-800': status === 'Overdue'
    };
};

const showSendMailButton = (item) => {
    const status = getStatus(item);
    return status === 'Overdue';
};

const hasData = (data) => {
    return data && data.length > 0;
};
</script>

<template>
    <Nav />
    <div class="min-h-screen bg-gray-100">
        <!-- Admin/Owner View -->
        <div v-if="Role?.role === 'ADMIN' || Role?.role === 'OWNER'" class="container mx-auto px-4 py-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-6">Borrow Management</h1>
            <div class="bg-white rounded-lg shadow-md p-6">
                <div v-if="hasData(borrow)" class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book Title</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrow Date</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Date</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="(item, index) in borrow" :key="item.id">
                                <td class="px-6 py-4">{{ index + 1 }}</td>
                                <td class="px-6 py-4">{{ item.user?.firstName }} {{ item.user?.lastName }}</td>
                                <td class="px-6 py-4">{{ item.book?.title }}</td>
                                <td class="px-6 py-4">{{ formatDate(item.borrowDate) }}</td>
                                <td class="px-6 py-4">{{ formatDate(item.dueDate) }}</td>
                                <td class="px-6 py-4">{{ item.returnDate ? formatDate(item.returnDate) : '-' }}</td>
                                <td class="px-6 py-4">
                                    <span :class="getStatusClass(item)">
                                        {{ getStatus(item) }}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <button v-if="showSendMailButton(item)"
                                        @click="goToReturn(item.id)"
                                        class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm">
                                        Send Mail
                                    </button>
                                    <span v-else-if="item.returnDate" class="text-green-600 font-medium">Returned</span>
                                    <span v-else class="text-yellow-600 font-medium">-</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="text-center py-12">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 class="mt-2 text-lg font-medium text-gray-900">ไม่พบข้อมูลการยืมหนังสือ</h3>
                    <p class="mt-1 text-sm text-gray-500">ยังไม่มีการยืมหนังสือในระบบ</p>
                </div>
            </div>
        </div>

        <!-- User View -->
        <div v-else-if="Role?.role === 'USER'" class="container mx-auto px-4 py-8">
            <h1 class="text-2xl font-bold text-gray-800 mb-6">My Borrowings</h1>
            <div class="bg-white rounded-lg shadow-md p-6">
                <div v-if="hasData(borrow)" class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book Title</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrow Date</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Date</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <tr v-for="(item, index) in borrow" :key="item.id">
                                <td class="px-6 py-4">{{ index + 1 }}</td>
                                <td class="px-6 py-4">{{ item.book?.title }}</td>
                                <td class="px-6 py-4">{{ formatDate(item.borrowDate) }}</td>
                                <td class="px-6 py-4">{{ formatDate(item.dueDate) }}</td>
                                <td class="px-6 py-4">{{ item.returnDate ? formatDate(item.returnDate) : '-' }}</td>
                                <td class="px-6 py-4">
                                    <span :class="getStatusClass(item)">
                                        {{ getStatus(item) }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else class="text-center py-12">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <h3 class="mt-2 text-lg font-medium text-gray-900">ยังไม่มีประวัติการยืมหนังสือ</h3>
                    <p class="mt-1 text-sm text-gray-500">คุณสามารถยืมหนังสือได้จากหน้าหลัก</p>
                    <div class="mt-6">
                        <button @click="goToBack"
                            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300">
                            กลับไปหน้าหลัก
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>