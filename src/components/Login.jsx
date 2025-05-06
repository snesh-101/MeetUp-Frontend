import React, { useState, useEffect } from 'react'
import axios from "axios"
import { useDispatch } from 'react-redux';
import { addUser, removeUser } from '../utils/userSlice';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';

const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [error, setError] = useState("");
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Logout user when the component mounts
  // useEffect(() => {
  //   const logoutUser = async () => {
  //     try {
  //       // Call logout API endpoint
  //       await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
  //       // Remove user from Redux store
  //       dispatch(removeUser());
  //     } catch (err) {
  //       console.log("Logout error:", err);
  //       // Even if the API call fails, remove the user from Redux store
  //       dispatch(removeUser());
  //     }
  //   };
    
  //   logoutUser();
  // }, [dispatch]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(BASE_URL + "/signup", {
        firstName, 
        lastName,
        emailId,
        password
      },
      {
        withCredentials: true
      });
      dispatch(addUser(res.data.data));
      navigate("/profile");
    }
    catch (err) {
      setError(err?.response?.data.error || "Something went wrong");
      console.log(err);
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(BASE_URL + "/login", {
        emailId,
        password
      }, {withCredentials: true});
      
      dispatch(addUser(res.data));
      navigate("/");
    }
    catch (err) {
      setError(err?.response?.data.error || "Something went wrong");
      console.log(err);
    }
  }

  return (
    <div className="flex justify-center items-center mt-14">
      <div className="card card-border border-gray-700 bg-base-100 w-96 mt-11">
        <div className="p-4">
          <p className='font-bold text-2xl text-center'>{isLoginForm? "Login": "SignUp"}</p>
          <form onSubmit={isLoginForm ? handleLogin : handleSignUp}>
            {!isLoginForm && <>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Firstname</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {setFirstName(e.target.value)}}
                  placeholder="Enter your FirstName"
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Lastname</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {setLastName(e.target.value)}}
                  placeholder="Enter your LastName"
                  className="input input-bordered w-full"
                />
              </div>
            </>}

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                value={emailId}
                onChange={(e) => {setEmailId(e.target.value)}}
                placeholder="Enter your email"
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input input-bordered w-full"
              />
            </div>
            <p className='text-red-500 flex justify-center mt-4'>{error}</p>

            <div className="form-control mt-4 mb-2">
              <button type="submit" className="btn btn-primary w-full">
                {isLoginForm ? "Login" : "Sign Up"}
              </button>
            </div>
            <div className='flex justify-center form-control'>
              <button type='button' onClick={() => {
                setIsLoginForm((value) => !value)
                setError("")
              }}>
                {isLoginForm ? "New User? Sign up here!" : "Existing user? Login here!"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login