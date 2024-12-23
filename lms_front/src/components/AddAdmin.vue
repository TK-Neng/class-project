<script setup>
import Nav from './Nav.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { urlAdmin } from '../../composable/getUser';
const router = useRouter();

const adminData = ref({
  username: '',
  password: '',
  password_confirmation: '',
  email: '',
  first_name: '',
  last_name: ''
});

const message = ref('');
const isError = ref(false);

const validatePasswords = () => {
  if (adminData.value.password !== adminData.value.password_confirmation) {
    message.value = 'Passwords do not match!';
    isError.value = true;
    return false;
  }
  return true;
};

const addAdmin = async () => {
  if (!validatePasswords()) return;
  
  try {
    const response = await fetch(`${urlAdmin}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: "include",
      body: JSON.stringify(adminData.value)
    });

    if (!response.ok) {
      const data = await response.json();
      message.value = data.errors.map(error => error.message).join(', ');
      isError.value = true;
      return;
    }

    message.value = 'Admin added successfully!';
    isError.value = false;
    adminData.value = {
      username: '',
      password: '',
      password_confirmation: '',
      email: '',
      first_name: '',
      last_name: ''
    };
    setTimeout(() => {
      router.push('/user');
    }, 1000);
  } catch (error) {
    message.value = error.message || 'Error adding admin';
    isError.value = true;
  }
};

const goBack = () => {
  router.go(-1);
};

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const togglePassword = (field) => {
  if (field === 'password') {
    showPassword.value = !showPassword.value;
  } else {
    showConfirmPassword.value = !showConfirmPassword.value;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Nav />
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Add New Admin</h2>
          <button @click="goBack" 
                  class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">
            Back
          </button>
        </div>
        
        <div v-if="message" 
             :class="['p-4 mb-4 rounded-md', 
                      isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700']">
          {{ message }}
        </div>

        <form @submit.prevent="addAdmin" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">First Name</label>
              <input v-model="adminData.first_name" 
                     type="text" 
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     required>
            </div>
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
              <input v-model="adminData.last_name" 
                     type="text" 
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     required>
            </div>
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input v-model="adminData.username" 
                   type="text" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   required>
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input v-model="adminData.email" 
                   type="email" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   required>
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <div class="relative">
              <input v-model="adminData.password" 
                     :type="showPassword ? 'text' : 'password'"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     required>
              <button type="button"
                      @mousedown="togglePassword('password')"
                      class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                <!-- Eye Icon -->
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <!-- Eye Slash Icon -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
            <div class="relative">
              <input v-model="adminData.password_confirmation" 
                     :type="showConfirmPassword ? 'text' : 'password'"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     required>
              <button type="button"
                      @mousedown="togglePassword('confirm')"
                      class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                <!-- Eye Icon -->
                <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <!-- Eye Slash Icon -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" 
                  class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">
            Add Admin
          </button>
        </form>
      </div>
    </div>
  </div>
</template>