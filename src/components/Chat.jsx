import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const Chat = () => {
  const { targetUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const user = useSelector((store) => store.user);
  const userId = user?._id;
  const messagesEndRef = useRef(null);

  const fetchChatMessages = async () => {
    const chat = await axios.get(BASE_URL + "/chat/" + targetUserId, {
      withCredentials: true,
    });

    const chatMessages = chat?.data?.messages.map((msg) => {
      const { senderId, text } = msg;
      return {
        firstName: senderId?.firstName,
        lastName: senderId?.lastName,
        text,
      };
    });
    setMessages(chatMessages);
  };
  useEffect(() => {
    fetchChatMessages();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const socket = createSocketConnection();
    socket.emit("joinChat", {
      firstName: user.firstName,
      userId,
      targetUserId,
    });

    socket.on("messageReceived", ({ firstName, lastName, text }) => {
      setMessages((messages) => [...messages, { firstName, lastName, text }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, targetUserId]);

  const sendMessage = () => {
    const socket = createSocketConnection();
    socket.emit("sendMessage", {
      firstName: user.firstName,
      lastName: user.lastName,
      userId,
      targetUserId,
      text: newMessage,
    });
    setNewMessage("");
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-900 rounded-lg shadow-xl overflow-hidden h-[80vh] flex flex-col m-10">
      {/* Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Chat</h1>
        {/* <div className="flex items-center">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-300">Online</span>
        </div> */}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 bg-gray-900 space-y-4">
        {messages.map((msg, index) => {
          return (
            <div
              key={index}
              className={
                "flex " +
                (user.firstName === msg.firstName
                  ? "justify-end"
                  : "justify-start")
              }
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-2 shadow ${
                  user.firstName === msg.firstName
                    ? "bg-purple-600 text-white rounded-l-xl rounded-tr-xl"
                    : "bg-gray-700 text-white rounded-r-xl rounded-tl-xl"
                }`}
              >
                <div className="text-sm font-medium opacity-80">
                  {`${msg.firstName} ${msg.lastName}`}
                </div>
                <div className="break-words mt-1">{msg.text}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-800 border-t border-gray-700 flex items-center gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-gray-700 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Chat;
