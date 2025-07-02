// src/pages/Login.jsx
import React, { useState } from 'react'
import axios from "axios"
import { useDispatch } from 'react-redux'
import { addUser } from '../utils/userSlice'
import { useNavigate } from 'react-router-dom'
import { BASE_URL } from '../utils/constants'

const Login = () => {
  const [emailId, setEmailId]       = useState("")
  const [password, setPassword]     = useState("")
  const [firstName, setFirstName]   = useState("")
  const [lastName, setLastName]     = useState("")
  const [isLoginForm, setIsLoginForm] = useState(true)
  const [error, setError]           = useState("")
  
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSignUp = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(
        `${BASE_URL}/signup`,
        { firstName, lastName, emailId, password },
        { withCredentials: true }
      )
      
      // res.data = { message, data: savedUser }
      const newUser = res.data.data
      dispatch(addUser(newUser))
      navigate("/profile")
    }
    catch (err) {
      setError(err?.response?.data?.error || "Something went wrong")
      console.log(err)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(
        `${BASE_URL}/login`,
        { emailId, password },
        { withCredentials: true }
      )
      
      // res.data = { message, data: user }
      const loggedInUser = res.data.data
      dispatch(addUser(loggedInUser))

      // go straight to the Profile page
      navigate("/profile")
    }
    catch (err) {
      setError(err?.response?.data?.error || "Something went wrong")
      console.log(err)
    }
  }

  return (
    <div className="flex justify-center items-center mt-14">
      <div className="card border border-gray-700 bg-base-100 w-96 mt-11">
        <div className="p-4">
          <h2 className='font-bold text-2xl text-center'>
            {isLoginForm ? "Login" : "Sign Up"}
          </h2>
          <form onSubmit={isLoginForm ? handleLogin : handleSignUp}>
            {!isLoginForm && (
              <>
                <div className="form-control mt-4">
                  <label className="label"><span className="label-text">First Name</span></label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control mt-4">
                  <label className="label"><span className="label-text">Last Name</span></label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
              </>
            )}
            <div className="form-control mt-4">
              <label className="label"><span className="label-text">Email</span></label>
              <input
                type="email"
                value={emailId}
                onChange={e => setEmailId(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control mt-4">
              <label className="label"><span className="label-text">Password</span></label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
            {error && <p className='text-red-500 text-center mt-4'>{error}</p>}
            <div className="form-control mt-4 mb-2">
              <button type="submit" className="btn btn-primary w-full">
                {isLoginForm ? "Login" : "Sign Up"}
              </button>
            </div>
            <div className="form-control text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLoginForm(prev => !prev)
                  setError("")
                }}
                className="link"
              >
                {isLoginForm
                  ? "New user? Sign up here!"
                  : "Already have an account? Login here!"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
