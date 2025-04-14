import React, { useState } from 'react'
import axios from "axios"
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';
// import BASE_URL from "./utils/constants"
const Login = () => {
  const [emailId, setEmailId]=useState("aakriti1@gmail.com");
  const [password, setPassword]=useState("Aakriti@112");
  const dispatch=useDispatch();
  const navigate=useNavigate();
  const handleLogin=async (e)=>{
    e.preventDefault();
    try{
     
    const res=await axios.post(BASE_URL+"/login",{
      emailId,
      password
    }, {withCredentials:true})
  //  console.log(res);
    dispatch(addUser(res.data));
    navigate("/");
  }
   
    catch(err){
      console.log(err)
    }
  }
  return (
    <div className=" flex justify-center items-center mt-14">
    <div className="card card-border border-gray-700 bg-base-100 w-96  mt-11">
    <div className="p-4">
      <p className='font-bold text-2xl  text-center'>Login</p>
    <form onSubmit={handleLogin}>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Username</span>
        </label>
        <input
          type="text"
          placeholder="Enter your username"
          className="input input-bordered w-full"
        />
      </div>

      <div className="form-control mt-4">
        <label className="label">
          <span className="label-text">Email :{emailId}</span>
        </label>
        <input
          type="email"
          value={emailId}
          required
          onChange={(e)=>{setEmailId(e.target.value)}}
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
          required
          onChange={(e)=>setPassword(e.target.value)}
          placeholder="Enter your password"
          className="input input-bordered w-full"
        />
      </div>

      <div className="form-control mt-7 mb-2">
        <button type="submit" className="btn btn-primary w-full">
          login
        </button>
      </div>
    </form>
  </div>
  </div>
  </div>
  )
}

export default Login
