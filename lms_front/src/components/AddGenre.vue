<script setup>
import Nav from './Nav.vue';
import { getGenres, urlGenre } from '../../composable/getGenre';
import { ref, onBeforeMount } from 'vue';

const genres = ref();
const showEditModal = ref(false);
const editingGenre = ref({ id: null, name: '' });
const newGenreName = ref('');

const showDeleteConfirm = ref(false);
const genreToDelete = ref(null);

const errorMessage = ref('');

const validateGenreName = (name) => {
    if (!name) return 'Genre name is required';
    if (!/^[A-Z]/.test(name)) return 'Genre name must start with a capital letter';
    return '';
};

const loadGenres = async () => {
    genres.value = await getGenres();
};

onBeforeMount(async () => {
    await loadGenres();
});

const startEditing = (genre) => {
    editingGenre.value = { ...genre };
    showEditModal.value = true;
};

const saveEdit = async () => {
    errorMessage.value = validateGenreName(editingGenre.value.name);
    if (errorMessage.value) return;

    try {
        const response = await fetch(`${urlGenre}/${editingGenre.value.genreId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ name: editingGenre.value.name })
        });
        if (response.ok) {
            const index = genres.value.findIndex(g => g.id === editingGenre.value.id);
            genres.value[index].name = editingGenre.value.name;
            showEditModal.value = false;
        }
    } catch (error) {
        console.error('Error updating genre:', error);
        errorMessage.value = error.message;
    }
};

const cancelEdit = () => {
    showEditModal.value = false;
    editingGenre.value = { id: null, name: '' };
};

const addGenre = async () => {
    errorMessage.value = validateGenreName(newGenreName.value);
    if (errorMessage.value) return;
    
    try {
        const response = await fetch(urlGenre, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ name: newGenreName.value })
        });

        if (response.ok) {
            await loadGenres();
            newGenreName.value = ''; // clear input
        }
    } catch (error) {
        console.error('Error adding genre:', error);
        errorMessage.value = error.message;
    }
};

const confirmDelete = (genre) => {
    genreToDelete.value = genre;
    showDeleteConfirm.value = true;
};

const deleteGenre = async () => {
    try {
        const response = await fetch(`${urlGenre}/${genreToDelete.value.genreId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            await loadGenres();
            showDeleteConfirm.value = false;
            genreToDelete.value = null;
        }
    } catch (error) {
        console.error('Error deleting genre:', error);
    }
};

const cancelDelete = () => {
    showDeleteConfirm.value = false;
    genreToDelete.value = null;
};
</script>

<template>
    <Nav />
    <div class="container mx-auto px-4 py-8">
        <!-- Add Genre Form -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4">Add New Genre</h2>
            <div class="flex gap-4">
                <input type="text" 
                    v-model="newGenreName"
                    class="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter genre name">
                <button @click="addGenre"
                    class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                    Add
                </button>
            </div>
            <p v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</p>
        </div>

        <!-- Edit Modal -->
        <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-white rounded-lg p-6 w-96">
                <h3 class="text-lg font-semibold mb-4">Edit Genre</h3>
                <input 
                    v-model="editingGenre.name"
                    type="text"
                    class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                >
                <p v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</p>
                <div class="flex justify-end gap-2">
                    <button @click="cancelEdit" 
                        class="px-4 py-2 border rounded-md hover:bg-gray-100">
                        Cancel
                    </button>
                    <button @click="saveEdit" 
                        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                        Save
                    </button>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-white rounded-lg p-6 w-96">
                <h3 class="text-lg font-semibold mb-4">Delete Genre</h3>
                <p class="mb-4">Are you sure you want to delete "{{ genreToDelete?.name }}"?</p>
                <div class="flex justify-end gap-2">
                    <button @click="cancelDelete" 
                        class="px-4 py-2 border rounded-md hover:bg-gray-100">
                        Cancel
                    </button>
                    <button @click="deleteGenre" 
                        class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                        Delete
                    </button>
                </div>
            </div>
        </div>

        <!-- Genre List -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <h2 class="text-xl font-semibold p-4 border-b">Genre List</h2>
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">No.</th>
                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Genre Name</th>
                        <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(genre, index) in genres" :key="genre.id" 
                        class="border-t hover:bg-gray-50">
                        <td class="px-4 py-3 text-sm">{{ index + 1 }}</td>
                        <td class="px-4 py-3 text-sm">{{ genre.name }}</td>
                        <td class="px-4 py-3 text-sm text-right">
                            <button @click="startEditing(genre)" 
                                class="text-blue-500 hover:text-blue-700 mx-1">Edit</button>
                            <button @click="confirmDelete(genre)"
                                class="text-red-500 hover:text-red-700 mx-1">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>