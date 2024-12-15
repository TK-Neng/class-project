<script setup>
import Nav from './Nav.vue';
import { onBeforeMount, ref } from 'vue';
import { getProfile } from '../../composable/getUser';
const user = ref(null);
onBeforeMount( async() => {
  user.value =  await getProfile();
});
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
          
          <div class="space-y-6">
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

            <div class="pt-6">
              <button class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 
                transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                แก้ไขข้อมูล
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>