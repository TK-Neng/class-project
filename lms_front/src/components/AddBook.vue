<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Nav from './Nav.vue'
import { urlBook } from '../../composable/getBook';
import { getGenres } from '../../composable/getGenre';
const router = useRouter()
const route = useRoute()
const error = ref('')
const loading = ref(false)
const step = ref(1) // Add this line

const book = reactive({
    title: '',
    description: '',
    author: '',
    genres: [], // Will now store genre IDs instead of names
    year_publication: '',
    quantity: 0,
    image: null
})

const imagePreview = ref('')

const handleImageChange = (e) => {
    const file = e.target.files[0]
    errors.image = ''
    
    if (file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
        if (!validTypes.includes(file.type)) {
            errors.image = 'Please select only JPG, JPEG or PNG images'
            return
        }

        // Validate file size (2MB = 2 * 1024 * 1024 bytes)
        if (file.size > 2 * 1024 * 1024) {
            errors.image = 'Image size should not exceed 2MB'
            return
        }

        book.image = file
        imagePreview.value = URL.createObjectURL(file)
    }
}

const genres = ref([]) // Will now store objects with id and name

const isEditing = ref(false)
const bookId = ref(null)

onMounted(async () => {
    try {
        const data = await getGenres()
        console.log('All genres:', data)
        if (Array.isArray(data)) {
            genres.value = data.map(genre => ({
                id: genre.genreId || genre.id, // รองรับทั้ง genreId และ id
                name: genre.name
            }))
        }

        // ถ้าเป็นโหมด edit
        if (route.query.edit && route.query.id) {
            isEditing.value = true
            bookId.value = route.query.id
            try {
                const res = await fetch(`${urlBook}/${bookId.value}`, {
                    credentials: "include"
                })
                if (!res.ok) {
                    throw new Error('Failed to fetch book details')
                }
                const data = await res.json()
                console.log('Book edit data:', data)

                book.title = data.title
                book.description = data.description
                book.author = data.author
                book.year_publication = data.yearPublication
                book.quantity = data.quantity
                imagePreview.value = `${urlBook}/image/${data.bookId}`

                // จัดการ genres ใหม่
                if (data.genres && Array.isArray(data.genres)) {
                    book.genres = data.genres.map(g => g.genreId || g.id)
                } else if (data.genre) {
                    // กรณีเป็น single genre
                    book.genres = [data.genre.genreId || data.genre.id]
                }
                
                console.log('Selected genre IDs:', book.genres)
            } catch (err) {
                console.error('Error fetching book:', err)
                error.value = err.message
            }
        }
    } catch (error) {
        console.error('Error in onMounted:', error)
    }
})

const handleSubmit = async () => {
    if (!validateStep3()) return
    
    try {
        loading.value = true
        error.value = ''

        const formData = new FormData()
        formData.append('title', book.title)
        formData.append('description', book.description)
        formData.append('author', book.author)
        // Send genre IDs
        book.genres.forEach((genreId, index) => {
            formData.append(`genres[${index}]`, genreId)
        })
        formData.append('year_publication', book.year_publication)
        formData.append('quantity', book.quantity)
        if (book.image instanceof File) {
            formData.append('image', book.image)
        }
        console.log([...formData])
        const url = isEditing.value ? `${urlBook}/${bookId.value}` : urlBook
        const method = isEditing.value ? 'PUT' : 'POST'

        const res = await fetch(url, {
            method: method,
            credentials: "include",
            body: formData
        })

        if (!res.ok) {
            const data = await res.json()
            throw new Error(data.message || `Failed to ${isEditing.value ? 'update' : 'add'} book`)
        }

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

const errors = reactive({
    title: '',
    description: '',
    author: '',
    genres: '', // Changed from genre to genres
    year_publication: '',
    quantity: '',
    image: ''
})

const validateStep1 = () => {
    let isValid = true
    errors.title = ''
    errors.author = ''
    errors.genres = ''

    if (!book.title || book.title.length < 3) {
        errors.title = 'Title must be at least 3 characters long'
        isValid = false
    } else if (!/^[a-zA-Z0-9\s\-':,.]+$/.test(book.title)) {
        errors.title = 'Title contains invalid characters'
        isValid = false
    }

    if (!book.author || book.author.length < 2) {
        errors.author = 'Author name must be at least 2 characters long'
        isValid = false
    } else if (!/^[a-zA-Z\s\-',.]+$/.test(book.author)) {
        errors.author = 'Author name contains invalid characters'
        isValid = false
    }

    if (!book.genres.length) {
        errors.genres = 'Please select at least one genre'
        isValid = false
    }

    if (!isValid) {
        showAlert('Please correct the errors before proceeding')
        return false
    }
    return true
}

const validateStep2 = () => {
    let isValid = true
    errors.year_publication = ''
    errors.quantity = ''
    errors.description = ''

    const currentYear = new Date().getFullYear()
    const year = parseInt(book.year_publication)

    if (!book.year_publication || !/^\d{4}$/.test(book.year_publication) || 
        year < 1800 || year > currentYear) {
        errors.year_publication = `Year must be between 1800 and ${currentYear}`
        isValid = false
    }

    if (book.quantity < 1 || book.quantity > 999) {
        errors.quantity = 'Quantity must be between 1 and 999'
        isValid = false
    }

    if (!book.description || book.description.length < 10) {
        errors.description = 'Description must be at least 10 characters long'
        isValid = false
    }

    if (!isValid) {
        showAlert('Please correct the errors before proceeding')
        return false
    }
    return true
}

const validateStep3 = () => {
    let isValid = true
    errors.image = ''

    if (!isEditing.value && !book.image) {
        errors.image = 'Please select an image for the book'
        isValid = false
    }

    if (!isValid) {
        showAlert('Please select a valid image before proceeding')
        return false
    }
    return true
}

const nextStep = () => {
    if (step.value === 1 && !validateStep1()) return
    if (step.value === 2 && !validateStep2()) return
    step.value++
}

const prevStep = () => {
    step.value--
}

const showAlert = (message) => {
    error.value = message
    // Auto-hide the alert after 3 seconds
    setTimeout(() => {
        error.value = ''
    }, 3000)
}

// Modified to handle genre IDs
const toggleGenre = (genreId) => {
    const index = book.genres.indexOf(genreId)
    if (index === -1) {
        book.genres.push(genreId)
    } else {
        book.genres.splice(index, 1)
    }
}
</script>

<template>
    <Nav />
    <div
        class="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 py-6 flex flex-col justify-center sm:py-12">
        <div class="relative py-3 sm:max-w-3xl sm:mx-auto">
            <div
                class="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-300 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl">
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
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    <span class="text-sm font-medium">Back to Home</span>
                                </button>
                            </div>
                            <div class="text-3xl font-bold text-center mb-8 text-gray-800">
                                {{ isEditing ? 'Edit Book' : 'Add New Book' }}
                            </div>
                            <div v-if="error" 
                                 class="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg transition-all duration-500 ease-in-out transform hover:scale-105"
                                 role="alert">
                                <p class="font-bold">Error</p>
                                <p>{{ error }}</p>
                            </div>
                            <form @submit.prevent="handleSubmit" class="space-y-6">
                                <!-- Step 1: Basic Information -->
                                <div v-if="step === 1" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div class="flex flex-col space-y-2">
                                        <label class="text-sm font-medium text-gray-700">Title</label>
                                        <input v-model="book.title" 
                                               type="text" 
                                               :class="{'border-red-500 focus:ring-red-200': errors.title}"
                                               class="px-4 py-2 transition duration-300 border border-gray-300 rounded focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-200">
                                        <p v-if="errors.title" class="text-red-500 text-xs mt-1">{{ errors.title }}</p>
                                    </div>
                                    <div class="flex flex-col space-y-2">
                                        <label class="text-sm font-medium text-gray-700">Author</label>
                                        <input v-model="book.author" 
                                               type="text" 
                                               :class="{'border-red-500 focus:ring-red-200': errors.author}"
                                               class="px-4 py-2 transition duration-300 border border-gray-300 rounded focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-200">
                                        <p v-if="errors.author" class="text-red-500 text-xs mt-1">{{ errors.author }}</p>
                                    </div>
                                    <div class="md:col-span-2">
                                        <label class="text-sm font-medium text-gray-700 mb-2 block">Genres</label>
                                        <div class="border border-gray-300 rounded-lg p-4 bg-white">
                                            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                                <div v-for="genre in genres" 
                                                    :key="genre.id"
                                                    @click="toggleGenre(genre.id)"
                                                    class="cursor-pointer relative group p-3 rounded-lg text-sm transition-all duration-200 hover:shadow-md"
                                                    :class="[
                                                        book.genres.includes(genre.id) 
                                                            ? 'bg-blue-50 ring-2 ring-blue-400 text-blue-700'
                                                            : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                                                    ]">
                                                    <div class="flex items-center space-x-2">
                                                        <div class="flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center"
                                                            :class="[
                                                                book.genres.includes(genre.id)
                                                                    ? 'border-blue-500 bg-blue-500'
                                                                    : 'border-gray-400 group-hover:border-gray-500'
                                                            ]">
                                                            <svg v-if="book.genres.includes(genre.id)" 
                                                                class="w-3 h-3 text-white" 
                                                                fill="none" 
                                                                stroke="currentColor" 
                                                                viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" 
                                                                    stroke-linejoin="round" 
                                                                    stroke-width="2" 
                                                                    d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                        <span class="font-medium">{{ genre.name }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="mt-2 flex items-center justify-between">
                                            <p v-if="errors.genres" 
                                            class="text-red-500 text-xs">
                                                {{ errors.genres }}
                                            </p>
                                            <p class="text-sm text-gray-500">
                                                Selected: {{ book.genres.length }} genre(s)
                                            </p>
                                        </div>
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
                                        <input v-model="book.year_publication" 
                                               type="text" 
                                               required pattern="\d{4}"
                                               :class="{'border-red-500 focus:ring-red-200': errors.year_publication}"
                                               class="px-4 py-2 transition duration-300 border border-gray-300 rounded focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-200">
                                        <p v-if="errors.year_publication" class="text-red-500 text-xs mt-1">{{ errors.year_publication }}</p>
                                    </div>
                                    <div class="flex flex-col space-y-2">
                                        <label class="text-sm font-medium text-gray-700">Quantity</label>
                                        <input v-model="book.quantity" 
                                               type="number" 
                                               min="0" 
                                               required
                                               :class="{'border-red-500 focus:ring-red-200': errors.quantity}"
                                               class="px-4 py-2 transition duration-300 border border-gray-300 rounded focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-200">
                                        <p v-if="errors.quantity" class="text-red-500 text-xs mt-1">{{ errors.quantity }}</p>
                                    </div>
                                    <div class="flex flex-col space-y-2 md:col-span-2">
                                        <label class="text-sm font-medium text-gray-700">Description</label>
                                        <textarea v-model="book.description" 
                                                  required
                                                  :class="{'border-red-500 focus:ring-red-200': errors.description}"
                                                  class="px-4 py-2 transition duration-300 border border-gray-300 rounded focus:border-transparent focus:outline-none focus:ring-4 focus:ring-blue-200 w-full h-32 resize-none"></textarea>
                                        <p v-if="errors.description" class="text-red-500 text-xs mt-1">{{ errors.description }}</p>
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
                                            <div
                                                :class="{'border-red-500': errors.image}"
                                                class="w-full h-[240px] border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-all duration-200">
                                                <div v-if="!imagePreview" class="text-center">
                                                    <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor"
                                                        fill="none" viewBox="0 0 48 48">
                                                        <path
                                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                            stroke-width="2" stroke-linecap="round"
                                                            stroke-linejoin="round" />
                                                    </svg>
                                                    <p class="mt-2 text-sm text-gray-500">Click or drag to upload image
                                                    </p>
                                                    <p class="mt-1 text-xs text-gray-400">PNG, JPG up to 2MB</p>
                                                </div>
                                                <img v-else
                                                    :src="imagePreview"
                                                    alt="Book cover preview"
                                                    class="w-full h-full object-contain rounded-lg shadow-md">
                                            </div>
                                            <input type="file" @change="handleImageChange" accept="image/png,image/jpeg,image/jpg"
                                                class="hidden" id="book-image">
                                            <label for="book-image"
                                                class="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer transition duration-200 ease-in-out text-sm font-medium">
                                                Select Image
                                            </label>
                                            <p v-if="errors.image" class="text-red-500 text-xs mt-2">{{ errors.image }}</p>
                                            <p class="text-gray-500 text-xs mt-2">Allowed formats: JPG, JPEG, PNG (max 2MB)</p>
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
                                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle class="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" stroke-width="4"></circle>
                                                    <path class="opacity-75" fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                                    </path>
                                                </svg>
                                                {{ isEditing ? 'Updating...' : 'Adding...' }}
                                            </template>
                                            <template v-else>
                                                {{ isEditing ? 'Update Book' : 'Add Book' }}
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

<style scoped>
.group:hover {
  transform: translateY(-1px);
}
</style>
