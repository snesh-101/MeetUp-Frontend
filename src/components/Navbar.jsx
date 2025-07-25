import axios from 'axios';
import React from 'react'
import { GiFeather } from "react-icons/gi";
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';
import { removeUser } from '../utils/userSlice';
const Navbar = () => {
  const user= useSelector((store)=>store.user);
  const dispatch= useDispatch();
  const navigate=useNavigate()
  const handleLogout= async()=>{
    try{
      await axios.post(BASE_URL+"/logout", {}, 
      {withCredentials:true})
      dispatch(removeUser())
      return navigate("/login")
    }
    catch(err){
      console.log(err);
    }
  }
  console.log(user);
  return (
    <div className="navbar bg-base-300 shadow-sm">
    <div className="flex-1">
      <Link to="/" className="btn btn-ghost text-xl font-serif text-sky-200">MeetUp <GiFeather></GiFeather></Link>
    </div>
    {user && ( <div className="flex gap-2">

      {/* <input type="text" placeholder="Search" className="input input-bordered w-24  md:w-auto" /> */}

      <div className='flex items-center text-sky-200'>{user.firstName}👋</div>
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar mx-3">
          <div className="w-10 rounded-full">
            <img
              alt="user photo"
              src={user.photoUrl}/>
          </div>
        </div>
                <ul
          tabIndex={0}
          className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
          <li>
            <Link to="/profile">Profile</Link>
          </li>
          <li>
            <Link to="/requests">
              Requests
            </Link>
          </li>
          <li><Link to="/connections">Connections</Link></li>
          <li><a onClick={handleLogout}>Logout</a></li>
        </ul>

      </div>
    </div>)}
   
  </div>
  )
}

export default Navbar
