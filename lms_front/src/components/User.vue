<script setup>
import Nav from './Nav.vue';
import { ref } from 'vue';

const users = ref([
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Student' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Teacher' },
  // Add more mock data as needed
]);
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <Nav />
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">User Management</h1>
        
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="p-4 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
            <div class="sm:flex-auto">
              <h2 class="text-xl font-semibold text-gray-900">Users</h2>
              <p class="mt-2 text-sm text-gray-700">A list of all users in the system.</p>
            </div>
            <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Add User
              </button>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in users" :key="user.id">
                  <td class="px-6 py-4 whitespace-nowrap">{{ user.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ user.email }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          :class="user.role === 'Student' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                    <button class="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>