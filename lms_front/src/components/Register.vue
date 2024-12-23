<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { URL } from '../../composable/getUser';
const router = useRouter();
const step = ref(1);

const formData = ref({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone_number: ''
});

const errors = ref({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone_number: ''
});

const validateForm = () => {
    let isValid = true;
    if (!formData.value.first_name) {
        errors.value.first_name = 'First name is required';
        isValid = false;
    } else {
        errors.value.first_name = '';
    }
    if (!formData.value.last_name) {
        errors.value.last_name = 'Last name is required';
        isValid = false;
    } else {
        errors.value.last_name = '';
    }
    if (!formData.value.username) {
        errors.value.username = 'Username is required';
        isValid = false;
    } else {
        errors.value.username = '';
    }
    if (!formData.value.email) {
        errors.value.email = 'Email is required';
        isValid = false;
    } else {
        errors.value.email = '';
    }
    if (!formData.value.password) {
        errors.value.password = 'Password is required';
        isValid = false;
    } else {
        errors.value.password = '';
    }
    if (formData.value.password !== formData.value.password_confirmation) {
        errors.value.password_confirmation = 'Passwords do not match';
        isValid = false;
    } else {
        errors.value.password_confirmation = '';
    }
    return isValid;
};

const nextStep = () => {
    step.value++;
};

const prevStep = () => {
    step.value--;
};

const isLoading = ref(false);

const showSuccess = ref(false);
const successMessage = ref('');

const register = async (event, formData) => {
    event.preventDefault();
    if (!validateForm()) {
        return;
    }
    if (formData.phone_number === '') {
        formData.phone_number = null;
    }

    isLoading.value = true;
    try {
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 2000));

        const res = await fetch(URL + `/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            successMessage.value = 'Registration successful! Redirecting to login...';
            showSuccess.value = true;
            setTimeout(() => {
                router.push({ name: 'Login' });
            }, 2000);
        } else if (res.status === 400) {
            const data = await res.json();
            // Reset previous errors
            for (const key in errors.value) {
                if (errors.value.hasOwnProperty(key)) {
                    errors.value[key] = '';
                }
            }
            // Set new errors from response
            data.forEach(error => {
                errors.value[error.field] = error.message;
            });
        }
    } catch (error) {
        console.error(error);
    } finally {
        isLoading.value = false;
    }
};

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
};

const toggleConfirmPasswordVisibility = () => {
    showConfirmPassword.value = !showConfirmPassword.value;
};

</script>

<template>
    <div
        class="min-h-screen bg-gradient-to-br from-sky-50 to-gray-200 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <!-- Success Message Notification -->
        <div v-if="showSuccess" class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg 
                    flex items-center space-x-2 transform transition-all duration-500 
                    animate-[fadeIn_0.5s_ease-out] motion-reduce:transition-none motion-reduce:animate-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{{ successMessage }}</span>
        </div>

        <div class="w-full max-w-md space-y-8">
            <div class="bg-white shadow-2xl rounded-2xl p-8 transition-all duration-300 hover:shadow-lg">
                <img class="mx-auto h-16 w-auto transition-transform duration-300 hover:scale-110"
                    src="https://www.svgrepo.com/show/499664/user-happy.svg" alt="" />

                <h2 class="my-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Sign up for an account
                </h2>

                <form class="space-y-6" method="POST">
                    <div v-if="step === 1">
                        <div>
                            <label for="first-name" class="block text-sm font-medium text-gray-700">First Name</label>
                            <div class="mt-1">
                                <input v-model="formData.first_name" name="first_name" type="text" required
                                    class="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm" />
                                <span class="text-red-500 text-sm">{{ errors.first_name }}</span>
                            </div>
                        </div>

                        <div>
                            <label for="last-name" class="block text-sm font-medium text-gray-700">Last Name</label>
                            <div class="mt-1">
                                <input v-model="formData.last_name" name="last_name" type="text" required
                                    class="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm" />
                                <span class="text-red-500 text-sm">{{ errors.last_name }}</span>
                            </div>
                        </div>

                        <div>
                            <label for="new-password" class="block text-sm font-medium text-gray-700">Username</label>
                            <div class="mt-1">
                                <input v-model="formData.username" name="username" type="username" required
                                    class="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm" />
                                <span class="text-red-500 text-sm">{{ errors.username }}</span>
                            </div>
                        </div>

                        <div>
                            <button type="button" @click="nextStep"
                                class="mt-4 flex w-full justify-center rounded-md border border-transparent bg-sky-400 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2">Next</button>
                        </div>
                    </div>

                    <div v-if="step === 2">
                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700">Email</label>
                            <div class="mt-1">
                                <input v-model="formData.email" name="email" type="email-address"
                                    autocomplete="email-address" required
                                    class="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm" />
                                <span class="text-red-500 text-sm">{{ errors.email }}</span>
                            </div>
                        </div>

                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                            <div class="mt-1 relative flex items-center">
                                <input :type="showPassword ? 'text' : 'password'" v-model="formData.password"
                                    name="password" autocomplete="password" required
                                    class="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm" />
                                <svg @click="togglePasswordVisibility" xmlns="http://www.w3.org/2000/svg" fill="#bbb"
                                    stroke="#bbb" class="w-[18px] h-[18px] absolute right-4 cursor-pointer"
                                    viewBox="0 0 128 128">
                                    <path v-if="!showPassword"
                                        d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178-16 16-16 16-7.178 16-16-7.178-16-16-16z"
                                        data-original="#000000"></path>
                                    <path v-else
                                        d="M64 24C22.127 24 1.367 60.504.504 62.057a4 4 0 0 0 0 3.887C1.367 67.496 22.127 104 64 104s62.633-36.504 63.496-38.057a4 4 0 0 0 0-3.887C126.633 60.504 105.873 24 64 24zm0 72c-31.955 0-50.535-24.775-55.293-31.994C13.465 56.795 32.146 32 64 32c31.955 0 50.535 24.775 55.293 31.994C114.535 71.205 95.854 96 64 96zm0-56c-13.234 0-24 10.766-24 24s10.766 24 24 24 24-10.766 24-24-10.766-24-24-24zm0 40c-8.822 0-16-7.178-16-16s7.178-16 16-16 16-7.178 16-16-7.178-16-16-16z"
                                        data-original="#000000"></path>
                                </svg>
                                <span class="text-red-500 text-sm">{{ errors.password }}</span>
                            </div>
                        </div>

                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700">Confirm
                                Password</label>
                            <div class="mt-1 relative flex items-center">
                                <input :type="showConfirmPassword ? 'text' : 'password'"
                                    v-model="formData.password_confirmation" name="confirm_password"
                                    autocomplete="confirm-password" required
                                    class="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm" />
                                <svg @click="toggleConfirmPasswordVisibility" xmlns="http://www.w3.org/2000/svg"
                                    fill="#bbb" stroke="#bbb" class="w-[18px] h-[18px] absolute right-4 cursor-pointer"
                                    viewBox="0 0 128 128">
                                    <path v-if="!showConfirmPassword"
                                        d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178-16 16-16 16-7.178 16-16-7.178-16-16-16z"
                                        data-original="#000000"></path>
                                    <path v-else
                                        d="M64 24C22.127 24 1.367 60.504.504 62.057a4 4 0 0 0 0 3.887C1.367 67.496 22.127 104 64 104s62.633-36.504 63.496-38.057a4 4 0 0 0 0-3.887C126.633 60.504 105.873 24 64 24zm0 72c-31.955 0-50.535-24.775-55.293-31.994C13.465 56.795 32.146 32 64 32c31.955 0 50.535 24.775 55.293 31.994C114.535 71.205 95.854 96 64 96zm0-56c-13.234 0-24 10.766-24 24s10.766 24 24 24 24-10.766 24-24-10.766-24-24-24zm0 40c-8.822 0-16-7.178-16-16s7.178-16 16-16 16-7.178 16-16-7.178-16-16-16z"
                                        data-original="#000000"></path>
                                </svg>
                            </div>
                            <span class="text-red-500 text-sm">{{ errors.password_confirmation }}</span>
                        </div>

                        <div>
                            <label for="phone-number" class="block text-sm font-medium text-gray-700">Phone Number
                                (optional)</label>
                            <div class="mt-1">
                                <input v-model="formData.phone_number" name="phone_number" type="tel"
                                    class="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm" />
                            </div>
                        </div>

                        <div class="flex justify-between mt-4">
                            <button type="button" @click="prevStep"
                                class="flex justify-center rounded-lg border border-transparent bg-gray-400 py-2.5 px-6 text-sm font-medium text-white shadow-sm hover:bg-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50"
                                :disabled="isLoading">
                                Back
                            </button>
                            <button type="submit" @click="register($event, formData)"
                                class="flex items-center justify-center rounded-lg border border-transparent bg-sky-500 py-2.5 px-6 text-sm font-medium text-white shadow-sm hover:bg-sky-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 disabled:opacity-50"
                                :disabled="isLoading">
                                <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                                {{ isLoading ? 'Registering...' : 'Register' }}
                            </button>
                        </div>
                    </div>
                </form>
                <div class="text-center mt-6">
                    <p class="text-gray-600">
                        Already have an account?
                        <a href="/login"
                            class="font-medium text-sky-500 hover:text-sky-600 transition-colors duration-300 hover:underline">
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>