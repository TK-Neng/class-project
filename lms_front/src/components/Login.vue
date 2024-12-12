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
  <div class="font-[sans-serif] bg-slate-300">
    <div class="min-h-screen flex fle-col items-center justify-center py-6 px-4">
      <div class="grid md:grid-cols-2 items-center gap-4 max-w-6xl w-full">

        <div class="lg:h-[400px] md:h-[300px] max-md:mt-8">
          <img src="/Designer.png" class="w-full h-full max-md:w-4/5 mx-auto block object-cover rounded-lg"
            alt="Dining Experience" />
        </div>
        <div
          class="border border-gray-300 rounded-lg p-6 max-w-md shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] max-md:mx-auto bg-white">
          <form class="space-y-4">
            <div class="mb-8">
              <h3 class="text-gray-800 text-3xl font-extrabold">Sign in</h3>
            </div>
            <div>
              <label class="text-gray-800 text-sm mb-2 block">Username</label>
              <div class="relative flex items-center">
                <input name="username" type="text" required
                  class="w-full text-sm text-gray-800 border border-gray-300 px-4 py-3 rounded-lg outline-blue-600"
                  placeholder="Enter user name" v-model="username" />
                <svg xmlns="http://www.w3.org/2000/svg" fill="#bbb" stroke="#bbb"
                  class="w-[18px] h-[18px] absolute right-4" viewBox="0 0 24 24">
                  <circle cx="10" cy="7" r="6" data-original="#000000"></circle>
                  <path
                    d="M14 15H6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5zm8-4h-2.59l.3-.29a1 1 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-.3-.29H22a1 1 0 0 0 0-2z"
                    data-original="#000000"></path>
                </svg>
              </div>
            </div>
            <div>
              <label class="text-gray-800 text-sm mb-2 block">Password</label>
              <div class="relative flex items-center">
                <input :type="showPassword ? 'text' : 'password'" name="password" required
                  class="w-full text-sm text-gray-800 border border-gray-300 px-4 py-3 rounded-lg outline-blue-600"
                  placeholder="Enter password" v-model="password" />
                <svg @click="togglePasswordVisibility" xmlns="http://www.w3.org/2000/svg" fill="#bbb" stroke="#bbb"
                  class="w-[18px] h-[18px] absolute right-4 cursor-pointer" viewBox="0 0 128 128">
                  <path v-if="!showPassword"
                    d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"
                    data-original="#000000"></path>
                  <path v-else
                    d="M64 24C22.127 24 1.367 60.504.504 62.057a4 4 0 0 0 0 3.887C1.367 67.496 22.127 104 64 104s62.633-36.504 63.496-38.057a4 4 0 0 0 0-3.887C126.633 60.504 105.873 24 64 24zm0 72c-31.955 0-50.535-24.775-55.293-31.994C13.465 56.795 32.146 32 64 32c31.955 0 50.535 24.775 55.293 31.994C114.535 71.205 95.854 96 64 96zm0-56c-13.234 0-24 10.766-24 24s10.766 24 24 24 24-10.766 24-24-10.766-24-24-24zm0 40c-8.822 0-16-7.178-16-16s7.178-16 16-16 16 7.178 16 16-7.178 16-16 16z"
                    data-original="#000000"></path>
                </svg>
              </div>
            </div>
            <div v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</div>
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div class="text-sm ml-auto">
                <a href="javascript:void(0);" class="text-blue-600 hover:underline font-semibold">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div class="!mt-8">
              <button type="button" @click="matchLogin(username, password)"
                class="w-full shadow-xl py-3 px-4 text-sm tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                Log in
              </button>
            </div>

            <p class="text-sm !mt-8 text-center text-gray-800">Don't have an account <a href="/register"
                class="text-blue-600 font-semibold hover:underline ml-1 whitespace-nowrap" >Register here</a></p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
