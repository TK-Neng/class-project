const API_ROOT = import.meta.env.VITE_API_ROOT;
const urlBorrow = `${API_ROOT}/api/borrowings`;

const getBorrow = async () => {
  try {
    const res = await fetch(urlBorrow, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.error("Error in getBorrow:", err);
  }
};

export { urlBorrow, getBorrow };
