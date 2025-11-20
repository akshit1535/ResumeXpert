import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { validateEmail } from '../utils/helper';
import { authStyles as styles } from '../assets/dummySTyle';
import axiosInstance from '../utils/axiosInstance';
import { Inputs as Input } from './Inputs';


const Login = ({ setCurrentPage }) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) =>{
    e.preventDefault();

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
      const response = await axiosInstance.post('/api/auth/login', {email, password});
      const { token} = response.data;

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
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <h3 className={styles.title}>Welcome Back</h3>
        <p className={styles.subtitle}>
          Sign in to continue building amazing resumes
        </p>
      </div>

      <form onSubmit={handleLogin} className={styles.form}>
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
            <button type='submit' className={styles.submitButton}>Sign In</button>

            <p className={styles.switchText}>
              Dont't have an account?{' '}
              <button type='button' onClick={() => setCurrentPage('signup')} className={styles.switchButton}>Sign Up</button>
            </p>
      </form>
    </div>
  )
}

export default Login