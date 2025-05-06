import React from 'react'
import { useSelector } from 'react-redux';

const ChatBubble = ({message}) => {
    const user=useSelector((store)=>store.user);
    const {photoUrl}=user||"https://i.pinimg.com/736x/98/1d/6b/981d6b2e0ccb5e968a0618c8d47671da.jp…";
  return (
    <div>
      <div className="chat chat-start">
  <div className="chat-image avatar">
    <div className="w-10 rounded-full">
      <img
        alt="Tailwind CSS chat bubble component"
        src={photoUrl} />
    </div>
  </div>
  <div className="chat-bubble">{message}</div>
</div>

</div>

  )
}

export default ChatBubble
