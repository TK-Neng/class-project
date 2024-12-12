<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import Nav from './Nav.vue';
const router = useRouter()
const book = reactive({
    title: '',
    author: '',
    isbn: '',
    description: ''
})

const handleSubmit = async () => {
    try {
        // Add your API call here to save the book
        console.log('Book data:', book)
        // After successful submission, redirect to book list
        // router.push('/books')
    } catch (error) {
        console.error('Error adding book:', error)
    }
}
</script>

<template>
    <Nav />
    <div class="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div class="relative py-3 sm:max-w-xl sm:mx-auto">
            <div class="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
                <div class="max-w-md mx-auto">
                    <div class="flex items-center space-x-5">
                        <div class="block pl-2 font-semibold text-xl text-gray-700">
                            <h2 class="leading-relaxed">Add New Book</h2>
                        </div>
                    </div>
                    <form @submit.prevent="handleSubmit" class="divide-y divide-gray-200">
                        <div class="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                            <div class="flex flex-col">
                                <label class="leading-loose">Book Title</label>
                                <input v-model="book.title" type="text"
                                    class="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none"
                                    placeholder="Book title">
                            </div>
                            <div class="flex flex-col">
                                <label class="leading-loose">Author</label>
                                <input v-model="book.author" type="text"
                                    class="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none"
                                    placeholder="Author name">
                            </div>
                            <div class="flex flex-col">
                                <label class="leading-loose">ISBN</label>
                                <input v-model="book.isbn" type="text"
                                    class="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none"
                                    placeholder="ISBN">
                            </div>
                            <div class="flex flex-col">
                                <label class="leading-loose">Description</label>
                                <textarea v-model="book.description" rows="3"
                                    class="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none"
                                    placeholder="Book description"></textarea>
                            </div>
                        </div>
                        <div class="pt-4 flex items-center space-x-4">
                            <button
                                class="bg-blue-500 flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none hover:bg-blue-600">Add
                                Book</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
