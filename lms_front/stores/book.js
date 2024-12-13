import { defineStore } from "pinia";
import { ref } from "vue";
import { urlBook } from "../composable/getBook";
import { URL } from "../composable/getUser";
export const useBookStore = defineStore("book", () => {
  const page = ref(1);
  const currentPage = ref(1); // Add current page state
  const getAllBooks = async () => {
    try {
        const res = await fetch(urlBook + `?page=${page.value}`, {
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
  const getRole = async () => {
    try {
      const res = await fetch(`${URL}/auth/session`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if(res.ok){
        const data = await res.json();
        return data.role;
      }
    } catch (err) {
      console.error(err);
    }
  }
  return { page, currentPage, getAllBooks, getRole };
});
