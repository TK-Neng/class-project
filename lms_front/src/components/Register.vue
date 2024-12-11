<script setup>
import { ref } from 'vue';

const step = ref(1);

const formData = ref({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    phone_number: ''
});

const nextStep = () => {
    step.value++;
};

const prevStep = () => {
    step.value--;
};
</script>

<template>
    <div class="bg-slate-300 flex h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
        <div class="w-full max-w-md space-y-8">
            <div class="bg-white shadow-md rounded-md p-6">

                <img class="mx-auto h-12 w-auto" src="https://www.svgrepo.com/show/499664/user-happy.svg" alt="" />

                <h2 class="my-3 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Sign up for an account
                </h2>

                <form class="space-y-6" method="POST">
                    <div v-if="step === 1">
                        <div>
                            <label for="first-name" class="block text-sm font-medium text-gray-700">First Name</label>
                            <div class="mt-1">
                                <input v-model="formData.first_name" name="first_name" type="text" required
                                    class="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label for="last-name" class="block text-sm font-medium text-gray-700">Last Name</label>
                            <div class="mt-1">
                                <input v-model="formData.last_name" name="last_name" type="text" required
                                    class="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label for="new-password" class="block text-sm font-medium text-gray-700">Username</label>
                            <div class="mt-1">
                                <input v-model="formData.username" name="username" type="username" required
                                    class="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm" />
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
                                <input v-model="formData.email" name="email" type="email-address" autocomplete="email-address" required
                                    class="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                            <div class="mt-1">
                                <input v-model="formData.password" name="password" type="password" autocomplete="password" required
                                    class="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <div class="mt-1">
                                <input v-model="formData.confirm_password" name="confirm_password" type="password" autocomplete="confirm-password" required
                                    class="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label for="phone-number" class="block text-sm font-medium text-gray-700">Phone Number</label>
                            <div class="mt-1">
                                <input v-model="formData.phone_number" name="phone_number" type="tel" class="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm" />
                            </div>
                        </div>

                        <div class="flex justify-between mt-4">
                            <button type="button" @click="prevStep"
                                class="flex justify-center rounded-md border border-transparent bg-gray-400 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">Back</button>
                            <button type="submit"
                                class="flex justify-center rounded-md border border-transparent bg-sky-400 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2">Register</button>
                        </div>
                    </div>
                </form>
                <div class="text-center mt-4">
                    Already have an account? <a href="/login" class="text-sm text-sky-400 hover:underline">Sign in</a>
                </div>
            </div>
        </div>
    </div>
</template>