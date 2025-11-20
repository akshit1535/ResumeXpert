import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

export const UserContext = createContext();

const UserProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() =>{
        if(user) return;

        const accessToken = localStorage.getItem('token');
        if(!accessToken){
            setLoading(false);
            return;
        }

        const fetchUser = async () =>{
            try{
                const response = await axiosInstance.get('/api/auth/profile');
                setUser(response.data);
            }
            catch(error){
                console.log("User not authenticated");
                clearUser();
            }
            finally{
                setLoading(false);
            }
        };
        fetchUser();
    }, [user]);

        const updateUser = (userData) =>{
        setUser(userData);
        localStorage.setItem('token', userData.token);
        setLoading(false);
        }

        const clearUser = () =>{
            setUser(null);
            localStorage.removeItem('token');
        }

        return(
            <UserContext.Provider value={{user, loading, updateUser, clearUser}}>
                {loading ? <div style={{padding: '20px', textAlign: 'center'}}>Loading...</div> : children}
            </UserContext.Provider>
        )
}

export default UserProvider;