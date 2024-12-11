// ใช้ import แทน require สำหรับดึง DaisyUI plugin
import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    daisyui, // ใช้ daisyui เป็น plugin
  ],
}
