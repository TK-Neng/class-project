import { defineStore } from "pinia";
import { ref } from "vue";
import { urlBook } from "../composable/getBook";

export const useBookStore = defineStore("book", () => {
  const page = ref(1);
  const getAllBooks = async () => {
    try {
        const res = await fetch(urlBook + `/books?page=${page.value}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        })
        if (res.ok) {
            const data = await res.json();
            return data;
        } else{
            throw new error("Error, can't get data");
        }
    } catch (err) {
      console.error(err);
    }
  };
  return { page, getAllBooks };
});
