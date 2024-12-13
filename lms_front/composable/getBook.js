const API_ROOT = import.meta.env.VITE_API_ROOT;
const urlBook = `${API_ROOT}/api/books`;
const getBookById = async (id) => {
    try {
        const res = await fetch(urlBook + `/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        if (res.ok) {
            const data = await res.json();
            return data;
        } else {
            throw new error("Error, can't get data");
        }
    } catch (err) {
        console.error(err);
    }
}

export { urlBook, getBookById};