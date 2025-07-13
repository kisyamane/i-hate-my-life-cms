import axios from "axios";



const API = axios.create({
    baseURL: 'http://localhost:3001'
});

API.interceptors.request.use((req) => {
    console.log("Token:", localStorage.getItem('jwt_sign'));
    const token = localStorage.getItem('jwt_sign');

    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
})

export default API;