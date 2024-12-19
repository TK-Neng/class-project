<script setup>
import { ref, onBeforeMount } from 'vue';
import { getBorrow, urlBorrow } from '../../composable/getBorrow';
import Nav from './Nav.vue';
import { useRouter } from 'vue-router';
import { useBookStore } from '../../stores/book'

// สร้างตัวแปรและฟังก์ชันที่จำเป็น
const book = useBookStore()
const router = useRouter();
const Role = ref(null);
const borrow = ref();
const loading = ref({});
const toast = ref({ show: false, message: '', type: '' });

// เพิ่มตัวแปรสำหรับ dialog
const showConfirmDialog = ref(false);
const selectedBorrow = ref(null);

// ฟังก์ชันสำหรับกลับไปหน้าหลัก
const goToBack = () => {
    router.push({ name: 'Home' });
}

// ฟังก์ชันแสดง toast message
const showToast = (message, type = 'success') => {
    toast.value = { show: true, message, type };
    setTimeout(() => {
        toast.value.show = false;
    }, 3000);
};

// ฟังก์ชันสำหรับคืนหนังสือ
const goToReturn = async (borrow_id, user_id) => {
    selectedBorrow.value = { borrow_id, user_id };
    showConfirmDialog.value = true;
};

// เพิ่มฟังก์ชันสำหรับการยืนยันการคืนหนังสือ
const confirmReturn = async () => {
    if (!selectedBorrow.value) return;
    
    const { borrow_id, user_id } = selectedBorrow.value;
    loading.value[borrow_id] = true;
    showConfirmDialog.value = false;
    
    try {
        const res = await fetch(urlBorrow, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ borrow_id, user_id }),
        });

        if (!res.ok) throw new Error('Failed to return book');

        borrow.value = await getBorrow();
        showToast('คืนหนังสือเรียบร้อยแล้ว');
    } catch (error) {
        console.error(error);
        showToast('เกิดข้อผิดพลาดในการคืนหนังสือ', 'error');
    } finally {
        loading.value[borrow_id] = false;
        selectedBorrow.value = null;
    }
}

// โหลดข้อมูลเมื่อเริ่มต้นคอมโพเนนต์
onBeforeMount(async () => {
    Role.value = await book.getRole();
    borrow.value = await getBorrow();
})

// ฟังก์ชันจัดรูปแบบวันที่เป็นภาษาไทย
const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// ฟังก์ชันตรวจสอบสถานะการยืม
const getStatus = (item) => {
    if (item.returnDate) return 'Returned';
    const dueDate = new Date(item.dueDate);
    const today = new Date();
    return today > dueDate ? 'Overdue' : 'Borrowed';
};

// ฟังก์ชันกำหนด class สำหรับแสดงสถานะ
const getStatusClass = (item) => {
    const status = getStatus(item);
    return {
        'px-2 py-1 rounded-full text-xs font-medium': true,
        'bg-green-100 text-green-800': status === 'Returned',
        'bg-yellow-100 text-yellow-800': status === 'Borrowed',
        'bg-red-100 text-red-800': status === 'Overdue'
    };
};

// ฟังก์ชันตรวจสอบว่ามีข้อมูลหรือไม่
const hasData = (data) => {
    return data && data.length > 0;
};
</script>

<template>
    <Nav />
    <div v-if="toast.show" :class="[
        'fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 z-50',
        toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
    ]">
        <p class="text-white font-medium">{{ toast.message }}</p>
    </div>
    <div class="min-h-screen bg-gray-100">
        <!-- Admin/Owner View -->
        <div v-if="Role?.role === 'ADMIN' || Role?.role === 'OWNER'" class="container mx-auto px-4 py-8">
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Borrow Management</h1>
                <button @click="goToBack"
                    class="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300">
                    กลับไปหน้าหลัก
                </button>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6">
                <div v-if="hasData(borrow)" class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book Title
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrow Date
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date
                                </th>
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
                                <td class="px-6 py-4">
                                    <span :class="getStatusClass(item)">
                                        {{ getStatus(item) }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 space-x-2">
                                    <div class="flex gap-2">
                                        <button v-if="getStatus(item) === 'Borrowed' || getStatus(item) === 'Overdue'"
                                            @click="goToReturn(item.borrowId, item.userId)"
                                            :disabled="loading[item.borrowId]"
                                            class="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 
                                                text-white px-4 py-2 rounded-lg text-sm transition duration-300 min-w-[120px]">
                                            <svg v-if="loading[item.borrowId]"
                                                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                    stroke-width="4"></circle>
                                                <path class="opacity-75" fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                                </path>
                                            </svg>
                                            <span>{{ loading[item.borrowId] ? 'กำลังคืน...' : 'คืนหนังสือ' }}</span>
                                        </button>
                                        <span v-else-if="item.returnDate"
                                            class="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm min-w-[120px] bg-green-100 text-green-800">
                                            Returned
                                        </span>
                                        <span v-else
                                            class="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm min-w-[120px] bg-yellow-100 text-yellow-800">
                                            -
                                        </span>
                                    </div>
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
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-2xl font-bold text-gray-800">My Borrowings</h1>
                <button @click="goToBack"
                    class="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300">
                    กลับไปหน้าหลัก
                </button>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6">
                <div v-if="hasData(borrow)" class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book Title
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrow Date
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Date
                                </th>
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

    <!-- เพิ่ม Confirmation Dialog -->
    <div v-if="showConfirmDialog" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
            <!-- Backdrop -->
            <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <!-- Dialog -->
            <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="sm:flex sm:items-start">
                        <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                            <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 class="text-lg leading-6 font-medium text-gray-900">
                                ยืนยันการคืนหนังสือ
                            </h3>
                            <div class="mt-2">
                                <p class="text-sm text-gray-500">
                                    คุณแน่ใจหรือไม่ที่จะคืนหนังสือเล่มนี้? การดำเนินการนี้จะอัปเดตสถานะการคืนหนังสือในระบบ
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button @click="confirmReturn" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm transform transition-all duration-200 hover:scale-105">
                        ยืนยัน
                    </button>
                    <button @click="showConfirmDialog = false" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transform transition-all duration-200 hover:scale-105">
                        ยกเลิก
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
