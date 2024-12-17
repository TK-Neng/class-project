const API_ROOT = import.meta.env.VITE_API_ROOT;
const URL = `${API_ROOT}/api/users`;

const getProfile = async () => {
    try{
        const res = await fetch(URL+'/profile', {
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

const getAllUsers = async () => {
    try{
        const res = await fetch(URL+'/allusers', {
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

const getUser = async (id) => {
    try{
        const res = await fetch(URL+`/show/${id}`, {
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


export { URL, getProfile, getAllUsers, getUser };