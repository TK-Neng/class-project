<script setup>
import Nav from './Nav.vue';
import { ref, onBeforeMount } from 'vue';
import { getAllUsers, URL } from '../../composable/getUser'
import { useRouter } from 'vue-router';
import { useBookStore } from '../../stores/book';
const router = useRouter();
const users = ref();
const isOwner = ref(false);
const isAdmin = ref(false);
const currentRole = ref('');
const bookStore = useBookStore();
const showAlert = ref(false);
const alertMessage = ref('');
const alertType = ref(''); // 'success' or 'error'
const showConfirmModal = ref(false);
const userToDelete = ref(null);
onBeforeMount(async () => {
  users.value = await getAllUsers();
  const user = await bookStore.getRole();
  isOwner.value = user.role === 'OWNER';
  isAdmin.value = user.role === 'ADMIN';
  currentRole.value = user.role;
});

const goToEdit = (id) => {
  router.push({ name: 'EditUser', params: { id: id } });
}

const goToAddAdmin = () => {
  router.push({ name: 'AddAdmin' });
}

const handleDelete = (userId) => {
  userToDelete.value = userId;
  showConfirmModal.value = true;
}

const confirmDelete = async () => {
  try {
    const response = await fetch(`${URL}/delete/${userToDelete.value}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    if (response.ok) {
      users.value = users.value.filter(user => user.userId !== userToDelete.value);
      alertMessage.value = 'User deleted successfully';
      alertType.value = 'success';
      showAlert.value = true;
    } else {
      alertMessage.value = 'Failed to delete user';
      alertType.value = 'error';
      showAlert.value = true;
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    alertMessage.value = 'Failed to delete user';
    alertType.value = 'error';
    showAlert.value = true;
  } finally {
    showConfirmModal.value = false;
    userToDelete.value = null;
    setTimeout(() => {
      showAlert.value = false;
    }, 3000);
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" 
         class="fixed inset-0 z-50 overflow-y-auto"
         aria-labelledby="modal-title" 
         role="dialog" 
         aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
             aria-hidden="true"
             @click="showConfirmModal = false"></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <!-- Warning icon -->
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <!-- Modal content -->
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Delete User
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Are you sure you want to delete this user? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Modal actions -->
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button"
                    @click="confirmDelete"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm
                           transition-colors duration-200">
              Delete
            </button>
            <button type="button"
                    @click="showConfirmModal = false"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm
                           transition-colors duration-200">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <Nav />
    
    <!-- Alert Component -->
    <div v-if="showAlert"
         class="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out"
         :class="[showAlert ? 'translate-x-0' : 'translate-x-full']">
      <div class="rounded-lg shadow-lg p-4 flex items-center space-x-3"
           :class="{
             'bg-green-50 border border-green-200': alertType === 'success',
             'bg-red-50 border border-red-200': alertType === 'error'
           }">
        <!-- Success Icon -->
        <div v-if="alertType === 'success'" 
             class="flex-shrink-0 w-6 h-6 text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <!-- Error Icon -->
        <div v-if="alertType === 'error'"
             class="flex-shrink-0 w-6 h-6 text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <!-- Alert Message -->
        <p class="text-sm font-medium"
           :class="{
             'text-green-800': alertType === 'success',
             'text-red-800': alertType === 'error'
           }">
          {{ alertMessage }}
        </p>
        <!-- Close Button -->
        <button @click="showAlert = false"
                class="flex-shrink-0 ml-2 hover:opacity-75 transition-opacity duration-150">
          <svg class="w-4 h-4"
               :class="{
                 'text-green-600': alertType === 'success',
                 'text-red-600': alertType === 'error'
               }"
               xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 animate-fadeIn">
      <div class="px-4 py-6 sm:px-0">
        <h1 class="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight animate-slideDown">
          User Management
        </h1>
        
        <div class="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          <div class="p-6 border-b border-gray-200 sm:flex sm:items-center sm:justify-between bg-gray-50">
            <div class="sm:flex-auto">
              <h2 class="text-2xl font-bold text-gray-900 animate-slideDown">Users</h2>
              <p class="mt-2 text-sm text-gray-600">A list of all users in the system.</p>
            </div>
            <div v-if="isOwner" class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button @click="goToAddAdmin"
                      class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium 
                             rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200
                             shadow-sm hover:shadow-md transform hover:-translate-y-0.5 animate-slideDown">
                <span class="mr-2">Add New Admin</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 animate-slideDown">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(user, index) in users" :key="user.id" class="hover:bg-gray-50 transition-colors duration-200 animate-slideIn" :style="{ animationDelay: `${index * 0.1}s` }">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ user.firstName }} {{ user.lastName }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ user.email }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                          :class="user.role === 'Student' ? 
                                 'bg-green-100 text-green-800 ring-1 ring-green-600/20' : 
                                 'bg-blue-100 text-blue-800 ring-1 ring-blue-600/20'">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button class="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 
                                 rounded-md hover:bg-indigo-100 transition-colors duration-200 mr-2"
                            @click="goToEdit(user.userId)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button v-if="user.role !== currentRole"
                            class="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 
                                   rounded-md hover:bg-red-100 transition-colors duration-200"
                            @click="handleDelete(user.userId)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                      Delete
                    </button>
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

<style>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

.animate-slideDown {
  animation: slideDown 0.5s ease-out;
}

.animate-slideIn {
  animation: slideIn 0.5s ease-out;
  animation-fill-mode: both;
}
</style>