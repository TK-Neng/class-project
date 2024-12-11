<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { URL } from '../../composable/getBook';
import Nav from './Nav.vue';

const router = useRouter()

</script>

<template>
  <Nav />
  <h1>Home</h1>

</template>