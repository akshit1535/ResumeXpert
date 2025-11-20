import React, { useState, useContext } from 'react';
import { authStyles as styles } from '../assets/dummySTyle';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import {validateEmail} from '../utils/helper';  
import axiosInstance from '../utils/axiosInstance';
import { Inputs as Input } from './Inputs';

const SignUp = ({setCurrentPage}) => {

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        if(!fullName){
            setError("Full name is required");
            return;
        }
        if(!validateEmail(email)){
            setError("Invalid email address");
            return;
        }
        if(!password){
            setError("Password is required");
            return;
        }
        setError('');
        try{
            const response = await axiosInstance.post('/api/auth/register', {
                name: fullName,
                email,
                password,
            });

            const {token} = response.data;
            if(token){
                localStorage.setItem('token', token);

                updateUser(response.data);
                navigate('/dashboard');
            }
        }
        catch(error){
            setError(error.response?.data?.message || 'Something went wrong');
        }
    }

    return (
        <div className={styles.signupContainer}>
            <div className={styles.headerWrapper}>
                <h3 className={styles.signupTitle}>Create Account</h3>
                <p className={styles.signupSubtitle}>Join thousands of professionals today</p>
            </div>


        <form onSubmit={handleSignup} className={styles.signupForm}>
            <Input value={fullName} onChange={({target}) => setFullName(target.value)} 
            label="Full Name"
            placeholder="Enter your full name"
            type="text"
            />

            <Input value={email} onChange={({target}) => setEmail(target.value)} 
            label="Email"
            placeholder="email@example.com"
            type="email"
            />

            <Input value={password} onChange={({target}) => setPassword(target.value)} 
            label="Password"
            placeholder="Enter your password"
            type="password"
            />

            {error && <div className={styles.errorMessage}>{error}</div>}
            <button type='submit' className={styles.signupSubmit}>
                Create Account
            </button>

            <p className={styles.switchButton}>
                Already have an Account?{' '}
                <button onClick={()=>setCurrentPage('login')}
                    type="button" className={styles.switchButtonText}>
                        Sign In
                </button>
            </p>
        </form>
        </div>
    );
}

export default SignUp;

