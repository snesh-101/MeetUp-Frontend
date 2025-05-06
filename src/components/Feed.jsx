import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { addFeed, removeUserFromFeed } from '../utils/feedSlice';
import UserCard from './UserCard';
import { useNavigate } from 'react-router-dom';

const Feed = () => {
  const dispatch = useDispatch();
  const feed = useSelector((store) => store.feed);
  const user=useSelector((store)=>store.user);
  const navigate=useNavigate();
  if(!user)
  {
    navigate("/login");
  }
  const [currentIndex, setCurrentIndex] = useState(0);

  const getFeed = async () => {
    if (feed && feed.length > 0) return;
    try {
      const res = await axios.get(BASE_URL + "/user/feed", { withCredentials: true });
      dispatch(addFeed(res.data));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
   // getFeed();
    if (!user) {
      // Redirect to login page if user is not logged in
      navigate("/login");
    } else {
      getFeed();  // Fetch feed if user is logged in
    }
  }, [user]);

  const handleAction = async (status, userId) => {
    try {
      await axios.post(`${BASE_URL}/request/${status}/${userId}`, {}, { withCredentials: true });
      dispatch(removeUserFromFeed(userId));
      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      console.error("Request failed", err);
    }
  };
    
  if (!feed || currentIndex >= feed.length) {
    return (
      <h2 className="text-center my-10 text-gray-400 text-lg">
        No more users in feed
      </h2>
    );
  }

  const currentUser = feed[currentIndex];

  return (
    <div className='flex justify-center my-10 '>
      <UserCard
        user={currentUser}
        onAction={handleAction} // pass handler
      />
    </div>
  );
};

export default Feed;
