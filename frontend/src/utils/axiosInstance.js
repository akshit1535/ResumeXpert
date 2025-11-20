import axios from 'axios';
import {BASE_URL} from '../config/constants';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }

    
})

axiosInstance.interceptors.request.use(
        (config) => {
            const accessToken = localStorage.getItem('token');
            if(accessToken){
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
            return config;
        },
        (error) =>{
            return Promise.reject(error);
        }
    )


    axiosInstance.interceptors.response.use(
        (response) =>{
            return response;
        },
        (error)=>{
            if(error.message){
                if(error.response.status === 400){
                    window.location.href = '/';
                }
                else if(error.response.status === 500){
                    console.log("Server Error");
                }
            }
                else if(error.code === "ECONNABORTED"){
                    console.log("Request timeout");
                }
                return Promise.reject(error); 
        }
    )

export default axiosInstance;