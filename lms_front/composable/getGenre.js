const API_ROOT = import.meta.env.VITE_API_ROOT;
const urlGenre = `${API_ROOT}/api/genres`;

const getGenres = async () => {
    try {
        const res = await fetch(urlGenre, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (!Array.isArray(data)) {
            console.error('Expected array of genres but got:', typeof data);
            return [];
        }
        
        return data;
    } catch (err) {
        console.error('Error in getGenres:', err);
        throw err;
    }
};


export { urlGenre, getGenres };