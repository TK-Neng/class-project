<script setup>
import Nav from './Nav.vue';
import { ref } from 'vue';

const user = ref({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Student',
  avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Felix'
});
</script>

<template>
  <Nav />
  <div class="min-h-screen bg-gray-100">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div class="md:flex">
          <div class="md:shrink-0 p-6 bg-indigo-50">
            <img 
              :src="user.avatar" 
              class="h-48 w-48 rounded-full object-cover border-4 border-white shadow-lg"
              alt="Profile picture"
            >
          </div>
          <div class="p-8">
            <div class="uppercase tracking-wide text-sm text-indigo-600 font-semibold">
              {{ user.role }}
            </div>
            <h2 class="mt-2 text-2xl font-bold text-gray-800">
              {{ user.name }}
            </h2>
            <div class="mt-4 space-y-4">
              <div class="flex items-center text-gray-600">
                <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {{ user.email }}
              </div>
            </div>
            <div class="mt-6">
              <button class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 
                transition duration-300 ease-in-out">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>