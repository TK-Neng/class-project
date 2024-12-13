<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import Nav from './Nav.vue'
import { urlBook } from '../../composable/getBook';
const router = useRouter()
const error = ref('')
const loading = ref(false)

const step = ref(1) // Add this line

const book = reactive({
    title: '',
    description: '',
    author: '',
    genre: '',
    year_publication: '',
    quantity: 0,
    image: null
})

const imagePreview = ref('')

const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
        book.image = file
        imagePreview.value = URL.createObjectURL(file)
    }
}

const genres = [
    'Fiction',
    'Non-Fiction',
    'Science Fiction',
    'Fantasy',
    'Mystery',
    'Romance',
    'Horror',
    'Biography',
    'History',
    'Science',
    'Technology',
    'Education',
    'Children',
    'Comics',
    'Poetry',
    'Self-Help'
]

const handleSubmit = async () => {
    try {
        loading.value = true
        error.value = ''

        const formData = new FormData()
        formData.append('title', book.title)
        formData.append('description', book.description)
        formData.append('author', book.author)
        formData.append('genre', book.genre)
        formData.append('year_publication', book.year_publication)
        formData.append('quantity', book.quantity)
        if (book.image) {
            formData.append('image', book.image)
        }

        const res = await fetch(urlBook, {
            method: 'POST',
            credentials: "include",
            body: formData
        })

        if (!res.ok) {
            const data = await res.json()
            throw new Error(data.message || 'Failed to add book')
        }
        
        // Add 2 second delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        router.push('/books')
    } catch (err) {
        error.value = err.message
    } finally {
        loading.value = false
    }
}

const handleBack = () => {
    router.push({ name: 'Home' })
}

const nextStep = () => {
    step.value++
}

const prevStep = () => {
    step.value--
}
</script>

<template>
    <Nav />
    <div class="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 py-6 flex flex-col justify-center sm:py-12">
        <div class="relative py-3 sm:max-w-3xl sm:mx-auto">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-300 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl">
            </div>
            <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                <div class="max-w-3xl mx-auto">
                    <div class="divide-y divide-gray-200">
                        <div class="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                            <!-- Add Back to Home button -->
                            <div class="absolute top-4 left-4">
                                <button @click="handleBack" 
                                    class="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                                    </svg>
                                    <span class="text-sm font-medium">Back to Home</span>
                                </button>
                            </div>
                            <div class="text-3xl font-bold text-center mb-8 text-gray-800">
                                Add New Book
                            </div>
                            <div v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</div>
                            <form @submit.prevent="handleSubmit" class="space-y-6">
                                <!-- Step 1: Basic Information -->
                                <div v-if="step === 1" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div class="flex flex-col space-y-2">
                                        <label class="text-sm font-medium text-gray-700">Title</label>
                                        <input v-model="book.title" type="text" required
                                            class="px-4 py-2 transition duration-300 border border-gray-300 rounded focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-200">
                                    </div>
                                    <div class="flex flex-col space-y-2">
                                        <label class="text-sm font-medium text-gray-700">Author</label>
                                        <input v-model="book.author" type="text" required
                                            class="px-4 py-2 transition duration-300 border border-gray-300 rounded focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-200">
                                    </div>
                                    <div class="flex flex-col space-y-2">
                                        <label class="text-sm font-medium text-gray-700">Genre</label>
                                        <select v-model="book.genre" required
                                            class="px-4 py-2 transition duration-300 border border-gray-300 rounded focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-200">
                                            <option value="" disabled selected>Select a genre</option>
                                            <option v-for="genre in genres" :key="genre" :value="genre">
                                                {{ genre }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="md:col-span-2">
                                        <button type="button" @click="nextStep"
                                            class="w-full text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 p-3 rounded-lg tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-500">
                                            Next
                                        </button>
                                    </div>
                                </div>

                                <!-- Step 2: Additional Details -->
                                <div v-if="step === 2" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div class="flex flex-col space-y-2">
                                        <label class="text-sm font-medium text-gray-700">Year of Publication</label>
                                        <input v-model="book.year_publication" type="text" required pattern="\d{4}"
                                            class="px-4 py-2 transition duration-300 border border-gray-300 rounded focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-200">
                                    </div>
                                    <div class="flex flex-col space-y-2">
                                        <label class="text-sm font-medium text-gray-700">Quantity</label>
                                        <input v-model="book.quantity" type="number" min="0" required
                                            class="px-4 py-2 transition duration-300 border border-gray-300 rounded focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-200">
                                    </div>
                                    <div class="flex flex-col space-y-2 md:col-span-2">
                                        <label class="text-sm font-medium text-gray-700">Description</label>
                                        <textarea v-model="book.description" required
                                            class="px-4 py-2 transition duration-300 border border-gray-300 rounded focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-200 w-full h-32 resize-none"></textarea>
                                    </div>
                                    <div class="md:col-span-2 flex space-x-4">
                                        <button type="button" @click="prevStep"
                                            class="w-1/3 text-gray-700 bg-gray-100 hover:bg-gray-200 p-3 rounded-lg tracking-wide font-medium shadow-lg cursor-pointer transition ease-in duration-500">
                                            Back
                                        </button>
                                        <button type="button" @click="nextStep"
                                            class="w-2/3 text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 p-3 rounded-lg tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-500">
                                            Next
                                        </button>
                                    </div>
                                </div>

                                <!-- Step 3: Image Upload -->
                                <div v-if="step === 3" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div class="flex flex-col space-y-2 md:col-span-2">
                                        <label class="text-sm font-medium text-gray-700">Book Image</label>
                                        <div class="flex flex-col items-center justify-center w-full">
                                            <div class="w-full h-[240px] border-2 border-gray-300 border-dashed rounded-lg p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-all duration-200">
                                                <div v-if="!imagePreview" class="text-center">
                                                    <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                    </svg>
                                                    <p class="mt-2 text-sm text-gray-500">Click or drag to upload image</p>
                                                    <p class="mt-1 text-xs text-gray-400">PNG, JPG up to 2MB</p>
                                                </div>
                                                <img v-else 
                                                    :src="imagePreview" 
                                                    alt="Book cover preview" 
                                                    class="w-full h-full object-contain rounded-lg shadow-md"
                                                >
                                            </div>
                                            <input type="file" 
                                                @change="handleImageChange" 
                                                accept="image/*"
                                                class="hidden"
                                                id="book-image">
                                            <label for="book-image" 
                                                class="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer transition duration-200 ease-in-out text-sm font-medium">
                                                Select Image
                                            </label>
                                        </div>
                                    </div>
                                    <div class="flex space-x-4 mt-6 md:col-span-2">
                                        <button type="button" @click="prevStep"
                                            class="w-1/3 text-gray-700 bg-gray-100 hover:bg-gray-200 p-3 rounded-lg tracking-wide font-medium shadow-lg cursor-pointer transition ease-in duration-500">
                                            Back
                                        </button>
                                        <button type="submit" :disabled="loading"
                                            class="w-2/3 text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 p-3 rounded-lg tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-500 disabled:opacity-50 flex justify-center items-center">
                                            <template v-if="loading">
                                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Adding...
                                            </template>
                                            <template v-else>
                                                Add Book
                                            </template>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
