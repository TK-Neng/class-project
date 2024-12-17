<script setup>
import { ref, onBeforeMount, watch } from 'vue';
import Nav from './Nav.vue';
import { useRoute, useRouter } from 'vue-router';
import { getUser } from '../../composable/getUser';
import { URL } from '../../composable/getUser';

const route = useRoute();
const router = useRouter();
const username = ref('');
const password = ref('');
const password_confirmation = ref('');
const userID = route.params.id;
const originalUsername = ref('');
const showPasswordFields = ref(false);
const errorMessage = ref('');
const showError = ref(false);
const isUsernameValid = ref(true);
const isCheckingUsername = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
}

const toggleConfirmPasswordVisibility = () => {
    showConfirmPassword.value = !showConfirmPassword.value;
}

onBeforeMount(async () => {
    const user = await getUser(userID);
    username.value = user.username;
    originalUsername.value = user.username;
});

// Add debounce function
const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

// Modified verifyUsername to use with watch
const verifyUsername = debounce(async () => {
    if (!username.value || username.value === originalUsername.value) {
        isUsernameValid.value = true;
        showError.value = false;
        return;
    }

    isCheckingUsername.value = true;
    try {
        const response = await fetch(`${URL}/verify`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username.value })
        });
        const data = await response.json();
        isUsernameValid.value = response.ok;
        if (response.status === 203) { 
            errorMessage.value = data.message || 'Username is already taken';
            showError.value = true;
        } else {
            showError.value = false;
        }
    } catch (error) {
        console.error('Error:', error);
        isUsernameValid.value = false;
        errorMessage.value = 'Error checking username availability';
        showError.value = true;
    } finally {
        isCheckingUsername.value = false;
    }
}, 500); // 500ms delay

// Add watch for username changes
watch(username, () => {
    verifyUsername();
});

const handleSubmit = async () => {
    // Reset error state
    showError.value = false;
    errorMessage.value = '';

    if (!isUsernameValid.value) {
        errorMessage.value = 'Please choose a valid username';
        showError.value = true;
        return;
    }

    if (showPasswordFields.value && password.value !== password_confirmation.value) {
        errorMessage.value = 'Passwords do not match';
        showError.value = true;
        return;
    }

    try {
        const requestBody = {};

        if (username.value !== originalUsername.value) {
            requestBody.username = username.value;
        }

        if (showPasswordFields.value && password.value) {
            requestBody.password = password.value;
            requestBody.password_confirmation = password_confirmation.value;
        }

        if (Object.keys(requestBody).length === 0) {
            errorMessage.value = 'No changes to update';
            showError.value = true;
            return;
        }

        const response = await fetch(`${URL}/edit/${userID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Profile updated successfully');
            router.push({ name: 'User' });
        } else if (response.status === 409) {
            errorMessage.value = data.message;
            showError.value = true;
        } else {
            errorMessage.value = data.message || 'Failed to update profile';
            showError.value = true;
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.value = 'An error occurred while updating profile';
        showError.value = true;
    }
}

const togglePasswordFields = () => {
    showPasswordFields.value = !showPasswordFields.value;
    if (!showPasswordFields.value) {
        password.value = '';
        password_confirmation.value = '';
    }
}

const goBack = () => {
    router.push({ name: 'User' });
}
</script>

<template>
    <Nav />
    <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 class="text-center text-3xl font-extrabold text-gray-900 mb-2">Edit Profile</h2>
            <p class="text-center text-sm text-gray-600">Update username or change password</p>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div class="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200">
                <!-- Error Alert -->
                <div v-if="showError" 
                     class="mb-4 p-4 rounded-md bg-red-50 border border-red-200">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <!-- Error icon -->
                            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-red-800">
                                Error
                            </h3>
                            <div class="mt-2 text-sm text-red-700">
                                {{ errorMessage }}
                            </div>
                        </div>
                    </div>
                </div>

                <form class="space-y-6" @submit.prevent="handleSubmit">
                    <!-- Username Field -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        <div class="mt-1">
                            <input v-model="username" 
                                   id="username" 
                                   name="username" 
                                   type="text"
                                   :class="{
                                       'border-red-500 ring-red-500': !isUsernameValid || showError,
                                       'border-green-300': isUsernameValid && username !== originalUsername && !showError,
                                       'appearance-none block w-full px-3 py-2 border rounded-md shadow-sm': true,
                                       'placeholder-gray-400 focus:outline-none': true,
                                       'focus:ring-2 focus:ring-red-500': !isUsernameValid || showError,
                                       'focus:ring-2 focus:ring-indigo-500': isUsernameValid && !showError,
                                       'sm:text-sm transition duration-150 ease-in-out': true
                                   }" />
                        </div>
                        <div v-if="isCheckingUsername" class="mt-1 text-sm text-gray-500">
                            Checking username availability...
                        </div>
                    </div>

                    <!-- Password Toggle -->
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-700">Want to change password?</span>
                        <button type="button" @click="togglePasswordFields"
                            class="text-indigo-600 hover:text-indigo-500 text-sm font-medium focus:outline-none">
                            {{ showPasswordFields ? 'Hide password fields' : 'Show password fields' }}
                        </button>
                    </div>

                    <!-- Password Fields -->
                    <div v-if="showPasswordFields" class="space-y-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div class="relative">
                                <input v-model="password" 
                                       id="password" 
                                       name="password" 
                                       :type="showPassword ? 'text' : 'password'"
                                       class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md 
                                       shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 
                                       focus:border-indigo-500 sm:text-sm pr-10" />
                                <button type="button" 
                                        @click="togglePasswordVisibility"
                                        class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" 
                                         :class="showPassword ? 'text-gray-700' : 'text-gray-400'"
                                         class="h-5 w-5" 
                                         fill="none" 
                                         viewBox="0 0 24 24" 
                                         stroke="currentColor">
                                        <path stroke-linecap="round" 
                                              stroke-linejoin="round" 
                                              stroke-width="2" 
                                              :d="showPassword 
                                                  ? 'M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88' 
                                                  : 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z'" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div class="relative">
                                <input v-model="password_confirmation" 
                                       id="confirm-password" 
                                       name="confirm-password"
                                       :type="showConfirmPassword ? 'text' : 'password'"
                                       class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md 
                                       shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 
                                       focus:border-indigo-500 sm:text-sm pr-10" />
                                <button type="button" 
                                        @click="toggleConfirmPasswordVisibility"
                                        class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" 
                                         :class="showConfirmPassword ? 'text-gray-700' : 'text-gray-400'"
                                         class="h-5 w-5" 
                                         fill="none" 
                                         viewBox="0 0 24 24" 
                                         stroke="currentColor">
                                        <path stroke-linecap="round" 
                                              stroke-linejoin="round" 
                                              stroke-width="2" 
                                              :d="showConfirmPassword 
                                                  ? 'M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88' 
                                                  : 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z'" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex items-center justify-between space-x-4 pt-4">
                        <button type="button" @click="goBack"
                            class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md 
                            shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                            transition duration-150 ease-in-out">
                            Cancel
                        </button>
                        <button type="submit"
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                            shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                            transition duration-150 ease-in-out">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>