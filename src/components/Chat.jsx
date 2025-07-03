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
  const socketRef = useRef(null); // ✅ only one socket

  const fetchChatMessages = async () => {
    try {
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
    } catch (err) {
      console.error("Failed to fetch messages:", err.message);
    }
  };

  useEffect(() => {
    fetchChatMessages();
  }, [targetUserId]);

  useEffect(() => {
    if (!userId) return;

    const socket = createSocketConnection();
    socketRef.current = socket;

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
    if (!newMessage.trim()) return;
    if (!socketRef.current) return;

    socketRef.current.emit("sendMessage", {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 px-4 py-10">
      <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-gray-800/80 via-gray-900/80 to-black/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden h-[80vh] flex flex-col border border-gray-700/50 hover:border-blue-500/50 transition-all duration-500">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-gray-800/90 via-gray-900/90 to-black/90 backdrop-blur-lg border-b border-gray-700/50 flex items-center justify-between">
          <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-2xl drop-shadow-lg">Chat</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, index) => {
            const isOwnMessage = user.firstName === msg.firstName;
            return (
              <div
                key={index}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-4 py-3 shadow-xl backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
                    isOwnMessage
                      ? "bg-gradient-to-br from-purple-600/90 via-blue-600/90 to-indigo-600/90 text-white rounded-l-xl rounded-tr-xl border-purple-500/30 shadow-purple-500/20"
                      : "bg-gradient-to-br from-gray-700/90 via-gray-800/90 to-gray-900/90 text-white rounded-r-xl rounded-tl-xl border-gray-600/30 shadow-gray-500/20"
                  }`}
                >
                  <div className="text-sm font-medium opacity-80 bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
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
        <div className="p-6 bg-gradient-to-r from-gray-800/90 via-gray-900/90 to-black/90 backdrop-blur-lg border-t border-gray-700/50 flex items-center gap-4">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-gradient-to-r from-gray-700/80 via-gray-800/80 to-gray-900/80 backdrop-blur-sm text-white rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-600/50 hover:border-blue-500/30 transition-all duration-300 placeholder-gray-400"
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white rounded-full p-3 w-12 h-12 flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-110 hover:shadow-blue-500/50 border-0 group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 relative z-10"
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
    </div>
  );
};

export default Chat;
