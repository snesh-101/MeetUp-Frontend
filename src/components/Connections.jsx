import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";
import { Link } from "react-router-dom";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  
  const fetchConnections = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      dispatch(addConnections(res.data.data));
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
    fetchConnections();
  }, []);
  
  if (!connections) return <h1 className="flex justify-center p-5 text-2xl animate-pulse bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent font-bold">No connections found</h1>;
  if (connections.length === 0) return <h1 className="text-center text-xl text-white mt-6 animate-bounce bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 shadow-2xl">No Connections Found</h1>;
  
  const firstConnection = connections[0]; // use for the top video call button
  
  return (
    <div className="text-center my-10 min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 px-4">
      <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-5xl mb-8 drop-shadow-2xl animate-pulse">
        Connections
      </h1>
      
      {/* Video Call Button with first connection */}
      {firstConnection && (
        <div className="mb-10">
          <Link to={`/video-call/${firstConnection._id}/${firstConnection.firstName}`}>
            <button className="btn btn-primary rounded-3xl relative overflow-hidden bg-gradient-to-r from-emerald-500 via-blue-600 to-purple-600 hover:from-emerald-600 hover:via-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 shadow-2xl transform hover:scale-110 transition-all duration-300 hover:shadow-blue-500/50 border-0 group">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <span className="relative">Start Video Call</span>
            </button>
          </Link>
        </div>
      )}
      
      {connections.map((connection) => {
        const { _id, firstName, lastName, photoUrl, age, gender, about } = connection;
        return (
          <div
            key={_id}
            className="flex flex-col sm:flex-row items-center sm:items-start m-4 p-6 rounded-2xl bg-gradient-to-br from-gray-800/80 via-gray-900/80 to-black/80 backdrop-blur-lg w-full sm:w-3/4 lg:w-1/2 mx-auto border border-gray-700/50 hover:border-blue-500/50 shadow-2xl hover:shadow-blue-500/20 transform hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            
            {/* Profile Photo */}
            <div className="mb-2 sm:mb-0 relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <img
                  alt="photo"
                  className="relative w-20 h-20 rounded-full object-cover border-4 border-transparent bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 p-1 shadow-xl transform group-hover:scale-110 transition-transform duration-300"
                  src={photoUrl}
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800 animate-pulse"></div>
              </div>
            </div>
            
            {/* Details */}
            <div className="text-left mx-4 hidden sm:block flex-1 relative z-10">
              <h2 className="font-bold text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-1">
                {firstName + " " + lastName}
              </h2>
              {age && gender && (
                <p className="text-cyan-300 font-medium flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                  {age + ", " + gender}
                </p>
              )}
              <p className="text-gray-300 bg-gray-800/40 rounded-lg p-3 backdrop-blur-sm leading-relaxed">
                {about}
              </p>
            </div>
            
            <div className="sm:hidden mt-2 text-center relative z-10">
              <h2 className="font-bold text-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {firstName + " " + lastName}
              </h2>
            </div>
            
            {/* Chat Button */}
            <Link to={`/chat/${_id}/${firstName}`} className="sm:ml-auto mt-2 mr-3 sm:mt-0 relative z-10">
              <button className="btn btn-primary rounded-3xl mt-4 relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 shadow-xl transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/50 border-0 group/btn">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 transform -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></span>
                <span className="relative">Chat</span>
              </button>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default Connections;