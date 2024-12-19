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
              <button @click="goToHome"
                class="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300">
                กลับหน้าหลัก
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>