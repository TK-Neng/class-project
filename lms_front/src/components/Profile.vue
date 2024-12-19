<script setup>
import Nav from './Nav.vue';
import { onBeforeMount, ref } from 'vue';
import { getProfile, URL } from '../../composable/getUser';
import { useBookStore } from '../../stores/book';
import { useRouter } from 'vue-router';

const user = ref(null);
const isEditing = ref(false);
const isLoading = ref(false);
const error = ref(null);
const editedUser = ref({});
const validationErrors = ref({});
const isUser = ref(false);
const showPasswordModal = ref(false);
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});
const passwordError = ref(null);

// เพิ่ม ref สำหรับควบคุมการแสดง/ซ่อนรหัสผ่าน
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// เพิ่ม ref สำหรับ notification
const showNotification = ref(false);
const notificationMessage = ref('');

const router = useRouter();
const bookStore = useBookStore();

onBeforeMount(async () => {
  user.value = await getProfile();
  editedUser.value = { ...user.value };
  const userRole = await bookStore.getRole();
  isUser.value = userRole.role === 'USER';
});

const toggleEdit = () => {
  isEditing.value = !isEditing.value;
  if (!isEditing.value) {
    editedUser.value = { ...user.value };
  }
};

const validateForm = () => {
  const errors = {};

  if (!editedUser.value.first_name?.trim() || editedUser.value.first_name.length < 2) {
    errors.first_name = 'ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร';
  }

  if (!editedUser.value.last_name?.trim() || editedUser.value.last_name.length < 2) {
    errors.last_name = 'นามสกุลต้องมีความยาวอย่างน้อย 2 ตัวอักษร';
  }

  if (!editedUser.value.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
  }

  if (editedUser.value.phone_number && !editedUser.value.phone_number.match(/^[0-9]{10}$/)) {
    errors.phone_number = 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
  }

  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const updateProfile = async () => {
  if (!validateForm()) {
    error.value = 'กรุณากรอกข้อมูลให้ถูกต้อง';
    return;
  }

  isLoading.value = true;
  error.value = null;
  validationErrors.value = {};

  try {
    const response = await fetch(URL + '/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        first_name: editedUser.value.first_name.trim(),
        last_name: editedUser.value.last_name.trim(),
        email: editedUser.value.email.trim(),
        phone_number: editedUser.value.phone_number?.trim() || null,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.errors) {
        validationErrors.value = result.errors;
        throw new Error('กรุณาตรวจสอบข้อมูลที่กรอก');
      }
      throw new Error(result.message || result.error || 'Failed to update profile');
    }

    user.value = result;
    isEditing.value = false;

    // รีเฟรชข้อมูลหลังอัพเดต
    const updatedProfile = await getProfile();
    user.value = updatedProfile;

  } catch (err) {
    error.value = err.message;
    console.error('Update Profile Error:', err);
  } finally {
    isLoading.value = false;
  }
};

const goToHome = () => {
  router.push({ name: "Home"});
};

const validatePasswordForm = () => {
  const errors = {};
  
  if (!passwordForm.value.currentPassword) {
    errors.currentPassword = 'กรุณากรอกรหัสผ่านปัจจุบัน';
  }
  
  if (!passwordForm.value.newPassword || passwordForm.value.newPassword.length < 6) {
    errors.newPassword = 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    errors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
  }

  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const changePassword = async () => {
  if (!validatePasswordForm()) {
    return;
  }

  isLoading.value = true;
  passwordError.value = null;

  try {
    const response = await fetch(URL + '/changepass', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        current_password: passwordForm.value.currentPassword,
        password: passwordForm.value.newPassword,
        password_confirmation: passwordForm.value.confirmPassword
      }),
    });

    // แก้ไขการจัดการ response
    if (!response.ok) {
      const text = await response.text();
      try {
        const result = JSON.parse(text);
        throw new Error(result.message || 'Failed to change password');
      } catch (parseError) {
        // กรณีที่ response ไม่ใช่ JSON
        throw new Error(text || 'Failed to change password');
      }
    }

    // แทนที่ alert ด้วย notification
    showPasswordModal.value = false;
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    notificationMessage.value = 'เปลี่ยนรหัสผ่านสำเร็จ';
    showNotification.value = true;
    
    // ซ่อน notification หลังจาก 3 วินาที
    setTimeout(() => {
      showNotification.value = false;
    }, 3000);

  } catch (err) {
    passwordError.value = err.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <Nav />
  <div class="min-h-screen bg-gray-100">
    <div v-if="user" class="container mx-auto px-4 py-8">
      <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-md">
        <div class="p-8">
          <div class="border-b pb-4 mb-6">
            <h1 class="text-3xl font-bold text-gray-800">Profile Information</h1>
          </div>

          <form v-if="isEditing" @submit.prevent="updateProfile" class="space-y-6">
            <div class="flex flex-col space-y-1">
              <label class="text-sm text-gray-500">Username</label>
              <input type="text" v-model="editedUser.username" disabled class="p-2 border rounded-lg bg-gray-100" />
            </div>

            <div class="flex flex-col space-y-1">
              <label class="text-sm text-gray-500">First Name</label>
              <input type="text" v-model="editedUser.first_name" class="p-2 border rounded-lg"
                :class="{ 'border-red-500': validationErrors.first_name }" />
              <span v-if="validationErrors.first_name" class="text-red-500 text-sm">
                {{ validationErrors.first_name }}
              </span>
            </div>

            <div class="flex flex-col space-y-1">
              <label class="text-sm text-gray-500">Last Name</label>
              <input type="text" v-model="editedUser.last_name" class="p-2 border rounded-lg"
                :class="{ 'border-red-500': validationErrors.last_name }" />
              <span v-if="validationErrors.last_name" class="text-red-500 text-sm">
                {{ validationErrors.last_name }}
              </span>
            </div>

            <div class="flex flex-col space-y-1">
              <label class="text-sm text-gray-500">Email</label>
              <input type="email" v-model="editedUser.email" class="p-2 border rounded-lg"
                :class="{ 'border-red-500': validationErrors.email }" />
              <span v-if="validationErrors.email" class="text-red-500 text-sm">
                {{ validationErrors.email }}
              </span>
            </div>

            <div class="flex flex-col space-y-1">
              <label class="text-sm text-gray-500">Phone Number</label>
              <input type="tel" v-model="editedUser.phone_number" class="p-2 border rounded-lg"
                :class="{ 'border-red-500': validationErrors.phone_number }" />
              <span v-if="validationErrors.phone_number" class="text-red-500 text-sm">
                {{ validationErrors.phone_number }}
              </span>
            </div>

            <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>

            <div class="pt-6 flex space-x-4">
              <button type="submit" :disabled="isLoading" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 
                transition duration-300 ease-in-out focus:outline-none focus:ring-2 
                focus:ring-indigo-500 focus:ring-offset-2">
                {{ isLoading ? 'กำลังบันทึก...' : 'บันทึก' }}
              </button>
              <button type="button" @click="toggleEdit"
                class="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300">
                ยกเลิก
              </button>
            </div>
          </form>

          <div v-else class="space-y-6">
            <div class="flex flex-col space-y-1">
              <span class="text-sm text-gray-500">Username</span>
              <span class="text-lg font-medium text-gray-800">{{ user.username }}</span>
            </div>

            <div class="flex flex-col space-y-1">
              <span class="text-sm text-gray-500">Full Name</span>
              <span class="text-lg font-medium text-gray-800">
                {{ user.first_name }} {{ user.last_name }}
              </span>
            </div>

            <div class="flex flex-col space-y-1">
              <span class="text-sm text-gray-500">Email</span>
              <span class="text-lg font-medium text-gray-800">{{ user.email }}</span>
            </div>

            <div class="flex flex-col space-y-1">
              <span class="text-sm text-gray-500">Phone Number</span>
              <span class="text-lg font-medium" :class="user.phone_number ? 'text-gray-800' : 'text-orange-500'">
                {{ user.phone_number || 'ยังไม่ได้เพิ่มเบอร์โทรศัพท์' }}
              </span>
            </div>

            <div class="pt-6 flex space-x-4">
              <button @click="toggleEdit" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 
                transition duration-300 ease-in-out focus:outline-none focus:ring-2 
                focus:ring-indigo-500 focus:ring-offset-2">
                แก้ไขข้อมูล
              </button>
              <button @click="showPasswordModal = true"
                class="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 
                transition duration-300 ease-in-out focus:outline-none focus:ring-2 
                focus:ring-yellow-500 focus:ring-offset-2">
                เปลี่ยนรหัสผ่าน
              </button>
              <button @click="goToHome"
                class="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300">
                กลับหน้าหลัก
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Password Change Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 class="text-2xl font-bold mb-6">เปลี่ยนรหัสผ่าน</h2>
        
        <form @submit.prevent="changePassword" class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm text-gray-600">รหัสผ่านปัจจุบัน</label>
            <div class="relative">
              <input 
                :type="showCurrentPassword ? 'text' : 'password'"
                v-model="passwordForm.currentPassword"
                class="w-full p-2 border rounded-lg pr-10"
                :class="{ 'border-red-500': validationErrors.currentPassword }"
              />
              <button 
                type="button"
                @click="showCurrentPassword = !showCurrentPassword"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
              >
                <!-- ใช้ SVG ของ Tailwind แทน Font Awesome -->
                <svg v-if="showCurrentPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <span v-if="validationErrors.currentPassword" class="text-red-500 text-sm">
              {{ validationErrors.currentPassword }}
            </span>
          </div>

          <div class="space-y-2">
            <label class="text-sm text-gray-600">รหัสผ่านใหม่</label>
            <div class="relative">
              <input 
                :type="showNewPassword ? 'text' : 'password'"
                v-model="passwordForm.newPassword"
                class="w-full p-2 border rounded-lg pr-10"
                :class="{ 'border-red-500': validationErrors.newPassword }"
              />
              <button 
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
              >
                <svg v-if="showNewPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <span v-if="validationErrors.newPassword" class="text-red-500 text-sm">
              {{ validationErrors.newPassword }}
            </span>
          </div>

          <div class="space-y-2">
            <label class="text-sm text-gray-600">ยืนยันรหัสผ่านใหม่</label>
            <div class="relative">
              <input 
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model="passwordForm.confirmPassword"
                class="w-full p-2 border rounded-lg pr-10"
                :class="{ 'border-red-500': validationErrors.confirmPassword }"
              />
              <button 
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
              >
                <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <span v-if="validationErrors.confirmPassword" class="text-red-500 text-sm">
              {{ validationErrors.confirmPassword }}
            </span>
          </div>

          <div v-if="passwordError" class="text-red-500 text-sm mt-2">
            {{ passwordError }}
          </div>

          <div class="flex space-x-4 mt-6">
            <button
              type="submit"
              :disabled="isLoading"
              class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 
                transition duration-300 ease-in-out focus:outline-none focus:ring-2 
                focus:ring-indigo-500 focus:ring-offset-2">
              {{ isLoading ? 'กำลังบันทึก...' : 'บันทึก' }}
            </button>
            <button
              type="button"
              @click="showPasswordModal = false"
              class="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300">
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- เพิ่ม Notification Component -->
    <Transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showNotification" 
        class="fixed top-4 right-4 z-50 flex items-center w-full max-w-sm p-4 mb-4 bg-white rounded-lg shadow-lg">
        <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg">
          <svg class="w-5 h-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div class="ml-3 text-sm font-normal text-gray-700">
          {{ notificationMessage }}
        </div>
        <button 
          @click="showNotification = false"
          class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-700 rounded-lg p-1.5 inline-flex h-8 w-8"
        >
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>