const API_ROOT = import.meta.env.VITE_API_ROOT;
const urlGenre = `${API_ROOT}/api/genres`;

const getGenres = async ()=>{
    try{
        const res = await fetch(urlGenre, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        if(res.ok){
            const data = await res.json();
            return data;
        } else {
            throw new error("Error, can't get data");
        }
    } catch{
        console.error(err);
    }
}

export { getGenres };