<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { URL } from '../../composable/getUser';
const router = useRouter();
const username = ref('');
const password = ref('');
const errorMessage = ref('');
const showPassword = ref(false);

const matchLogin = async (username, password) => {
  if (!username && !password) {
    errorMessage.value = 'Please enter both username and password.';
    return;
  } else if (!username) {
    errorMessage.value = 'Please enter your username.';
    return;
  } else if (!password) {
    errorMessage.value = 'Please enter your password.';
    return;
  }

  const data = {
    username: username,
    password: password
  };
  try {
    const res = await fetch(URL + `/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include', // เพื่อให้ส่งและรับคุกกี้
    });
    if (res.status === 200) {
      router.push({ name: 'Home' });
    } else if (res.status === 401) {
      errorMessage.value = 'Incorrect username or password.';
    }
  }
  catch (error) {
    console.log(error);
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

</script>

<template>
  <div class="font-[sans-serif] min-h-screen bg-gradient-to-br from-blue-100 to-gray-100">
    <div class="min-h-screen flex items-center justify-center px-4 py-8">
      <div class="grid md:grid-cols-2 items-center gap-8 max-w-6xl w-full">

        <div class="lg:h-[500px] md:h-[400px] max-md:hidden">
          <img src="/Designer.png"
            class="w-full h-full object-cover rounded-2xl transform transition-transform duration-300 hover:scale-105 shadow-2xl"
            alt="Dining Experience" />
        </div>

        <div class="bg-white rounded-2xl p-8 max-w-md mx-auto w-full backdrop-blur-sm bg-opacity-90 
          shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)]">
          <form class="space-y-6">
            <div class="mb-8 text-center">
              <h3 class="text-gray-800 text-3xl font-bold mb-2">Welcome Back</h3>
              <p class="text-gray-600 text-sm">Please sign in to continue</p>
            </div>

            <div class="space-y-2">
              <label class="text-gray-700 text-sm font-semibold block">Username</label>
              <div class="relative">
                <input name="username" type="text" required v-model="username" class="w-full text-gray-800 px-4 py-3 rounded-lg border border-gray-300
                  focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200
                  outline-none text-sm" placeholder="Enter username" />
                <svg xmlns="http://www.w3.org/2000/svg" fill="#94a3b8" stroke="#94a3b8"
                  class="w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2" viewBox="0 0 24 24">
                  <circle cx="10" cy="7" r="6" data-original="#000000"></circle>
                  <path
                    d="M14 15H6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5zm8-4h-2.59l.3-.29a1 1 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-.3-.29H22a1 1 0 0 0 0-2z">
                  </path>
                </svg>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-gray-700 text-sm font-semibold block">Password</label>
              <div class="relative">
                <input :type="showPassword ? 'text' : 'password'" name="password" required v-model="password" class="w-full text-gray-800 px-4 py-3 rounded-lg border border-gray-300
                  focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200
                  outline-none text-sm" placeholder="Enter password" />
                <svg @click="togglePasswordVisibility" xmlns="http://www.w3.org/2000/svg" fill="#94a3b8"
                  stroke="#94a3b8" class="w-5 h-5 absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer 
                  hover:scale-110 transition-transform duration-200" viewBox="0 0 128 128">
                  <path v-if="!showPassword"
                    d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z">
                  </path>
                  <path v-else
                    d="M64 24C22.127 24 1.367 60.504.504 62.057a4 4 0 0 0 0 3.887C1.367 67.496 22.127 104 64 104s62.633-36.504 63.496-38.057a4 4 0 0 0 0-3.887C126.633 60.504 105.873 24 64 24zm0 72c-31.955 0-50.535-24.775-55.293-31.994C13.465 56.795 32.146 32 64 32c31.955 0 50.535 24.775 55.293 31.994C114.535 71.205 95.854 96 64 96zm0-56c-13.234 0-24 10.766-24 24s10.766 24 24 24 24-10.766 24-24-10.766-24-24-24zm0 40c-8.822 0-16-7.178-16-16s7.178-16 16-16 16 7.178 16 16-7.178 16-16 16z">
                  </path>
                </svg>
              </div>
            </div>

            <div v-if="errorMessage"
              class="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200 animate-fadeIn">
              {{ errorMessage }}
            </div>


            <button type="button" @click="matchLogin(username, password)" class="w-full py-3.5 px-4 text-sm font-semibold rounded-lg text-white bg-blue-600 
              hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200
              transform hover:scale-[1.02] active:scale-[0.98]">
              Sign in
            </button>

            <p class="text-sm text-center text-gray-600">
              Don't have an account?
              <a href="/register" class="text-blue-600 font-semibold hover:text-blue-700 
                transition-colors duration-200 hover:underline">
                Register here
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
