import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSelector } from 'react-redux';
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

axios.defaults.withCredentials = true;
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";
import {
  MdMic,
  MdMicOff,
  MdVideocam,
  MdVideocamOff,
  MdCallEnd,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";


const fetchToken = async () => {
  //const res = await fetch("http://localhost:3000/get-token", { method: "POST" });
  const res = await fetch(`${BASE_URL}/get-token`, { method: "POST", credentials: "include",  });
  const data = await res.json();
  return data.token;
};

const createRoom = async (token) => {
  const res = await fetch(`${BASE_URL}/create-room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", 
    body: JSON.stringify({ token }),
  });
  const data = await res.json();
  return data.roomId;
};

const validateMeetingId = async (token, meetingId) => {
  try {
    const res = await fetch(`${BASE_URL}/validate-room`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", 
      body: JSON.stringify({ token, roomId: meetingId }),
    });
    const data = await res.json();
    return data.valid;
  } catch (error) {
    console.error("Error validating meeting ID:", error);
    return false;
  }
};

function ParticipantView({ participantId, isLocal }) {
  const {
    webcamStream,
    micStream,
    displayName,
    webcamOn,
    micOn,
  } = useParticipant(participantId);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const initMediaTrack = useCallback(async (type) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        type === "video" ? { video: true } : { audio: true }
      );
      return stream.getTracks()[0];
    } catch (error) {
      console.error(`Error reinitializing ${type} track:`, error);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
  
    const updateVideoStream = async () => {
      if (!videoRef.current || !webcamOn || !webcamStream?.track || !isMounted) return;
  
      try {
        const mediaStream = new MediaStream([webcamStream.track]);
        videoRef.current.srcObject = mediaStream;
  
        // Wait until DOM is ready and element is in view
        await new Promise((resolve) => setTimeout(resolve, 100));
  
        // Attempt to autoplay
        videoRef.current
          .play()
          .then(() => {
            // Autoplay succeeded
          })
          .catch((err) => {
            console.warn("Autoplay failed:", err.message);
          });
      } catch (err) {
        console.error("Error updating video stream:", err.message);
      }
    };
  
    updateVideoStream();
  
    return () => {
      isMounted = false;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [webcamOn, webcamStream]);
  
  useEffect(() => {
    let isMounted = true;

    const updateAudioStream = async () => {
      if (!audioRef.current || !micOn || isLocal || !isMounted) return;
      try {
        const track = micStream?.track || (await initMediaTrack("audio"));
        if (!track || !audioRef.current) return;

        const mediaStream = new MediaStream([track]);
        audioRef.current.srcObject = mediaStream;

        await audioRef.current.play().catch((err) => {
          console.warn("Autoplay audio failed:", err);
        });
      } catch (err) {
        console.error("Error updating audio stream:", err);
      }
    };

    updateAudioStream();

    return () => {
      isMounted = false;
      if (audioRef.current) {
        audioRef.current.srcObject = null;
      }
    };
  }, [micOn, micStream, isLocal, initMediaTrack]);

  return (
    <div className="bg-gradient-to-br from-gray-800/80 via-gray-900/80 to-black/80 backdrop-blur-lg rounded-3xl border border-gray-700/50 hover:border-blue-500/50 w-full max-w-[480px] flex-grow relative overflow-hidden shadow-2xl transition-all duration-500">
      <div className="bg-gradient-to-r from-gray-800/90 via-gray-900/90 to-black/90 backdrop-blur-lg text-white px-4 py-2 text-base flex justify-between items-center">
        <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent font-medium">
          {displayName} {isLocal && "(You)"}
        </span>
        <div className="flex gap-2 items-center">
          {micOn ? <MdMic className="text-green-400" /> : <MdMicOff className="text-red-400" />}
          {webcamOn ? (
            <MdVideocam className="text-green-400" />
          ) : (
            <MdVideocamOff className="text-red-400" />
          )}
        </div>
      </div>
      {webcamOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full aspect-video bg-black"
        />
      ) : (
        <div className="w-full aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
            {displayName?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      )}
      <audio ref={audioRef} autoPlay playsInline muted={isLocal} />
    </div>
  );
}

function Controls() {
  const { toggleMic, toggleWebcam, leave, localMicOn, localWebcamOn } = useMeeting();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleToggle = async (type) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      type === "mic" ? await toggleMic() : await toggleWebcam();
    } catch (error) {
      console.error(`${type} toggle failed:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLeave = () => {
    leave();
    navigate("/connections");
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-5 bg-gradient-to-r from-gray-800/80 via-gray-900/80 to-black/80 backdrop-blur-lg p-5 rounded-full border border-gray-700/50 shadow-2xl">
      <button
        onClick={() => handleToggle("mic")}
        disabled={isProcessing}
        className={`w-15 h-15 rounded-full text-white flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 ${
          localMicOn ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-red-600"
        }`}
      >
        {localMicOn ? <MdMic /> : <MdMicOff />}
      </button>
      <button
        onClick={() => handleToggle("camera")}
        disabled={isProcessing}
        className={`w-15 h-15 rounded-full text-white flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 ${
          localWebcamOn ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-red-600"
        }`}
      >
        {localWebcamOn ? <MdVideocam /> : <MdVideocamOff />}
      </button>
      <button
        onClick={handleLeave}
        className="w-15 h-15 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110"
      >
        <MdCallEnd />
      </button>
    </div>
  );
}

function MeetingView({ meetingId }) {
  const { join, participants, localParticipant } = useMeeting();
  const [joined, setJoined] = useState(false);

  const remoteParticipantIds = Array.from(participants.keys()).filter(
    (id) => localParticipant && id !== localParticipant.id
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white px-5 pt-5 pb-32">
      <h2 className="text-center mb-6 font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-2xl drop-shadow-lg">
        Meeting ID: {meetingId}
      </h2>
      {!joined ? (
        <div className="text-center">
          <button
            onClick={() => {
              join();
              setJoined(true);
            }}
            className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-600 to-green-600 hover:from-green-600 hover:via-emerald-700 hover:to-green-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-300 hover:shadow-green-500/50 border-0 group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            <span className="relative">Join Meeting</span>
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap justify-center gap-4">
            {localParticipant && (
              <ParticipantView
                key={localParticipant.id}
                participantId={localParticipant.id}
                isLocal={true}
              />
            )}
            {remoteParticipantIds.map((pid) => (
              <ParticipantView key={pid} participantId={pid} isLocal={false} />
            ))}
          </div>
          <Controls />
        </>
      )}
    </div>
  );
}

export default function VideoCallComponent() {
  const username = useSelector((state) => state.user?.firstName || "Guest");
  const [token, setToken] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [inputMeetingId, setInputMeetingId] = useState("");
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const init = async () => {
      const tok = await fetchToken();
      setToken(tok);
    };
    init();
  }, []);

  const handleJoinMeeting = async () => {
    if (!inputMeetingId.trim()) {
      setError("Please enter a meeting ID");
      return;
    }

    setIsValidating(true);
    setError("");

    const isValid = await validateMeetingId(token, inputMeetingId.trim());
    
    if (isValid) {
      setMeetingId(inputMeetingId.trim());
    } else {
      setError("Please enter valid meeting ID");
    }
    
    setIsValidating(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent font-bold text-xl">
            Fetching token...
          </div>
        </div>
      </div>
    );
  }

  if (!meetingId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white px-10 py-10 flex flex-col items-center justify-center">
        <div className="bg-gradient-to-br from-gray-800/80 via-gray-900/80 to-black/80 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-8 w-full max-w-md shadow-2xl">
          <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-3xl mb-8 text-center drop-shadow-lg">
            Video Call
          </h1>
          
          <button
            onClick={async () => setMeetingId(await createRoom(token))}
            className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-600 to-green-600 hover:from-green-600 hover:via-emerald-700 hover:to-green-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-green-500/50 border-0 group w-full mb-6"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            <span className="relative">Create New Room</span>
          </button>
          
          <div className="text-center mb-6">
            <span className="text-cyan-300 font-medium flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
              OR
              <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
            </span>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={inputMeetingId}
              onChange={(e) => {
                setInputMeetingId(e.target.value);
                setError("");
              }}
              className="w-full px-4 py-3 bg-gradient-to-r from-gray-700/80 via-gray-800/80 to-gray-900/80 backdrop-blur-sm text-white border border-gray-600/50 hover:border-blue-500/30 focus:border-blue-500/50 rounded-xl focus:outline-none transition-all duration-300 placeholder-gray-400"
            />
            
            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                {error}
              </div>
            )}
            
            <button
              onClick={handleJoinMeeting}
              disabled={isValidating}
              className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 hover:from-blue-600 hover:via-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-blue-500/50 border-0 group w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <span className="relative">
                {isValidating ? "Validating..." : "Join Meeting"}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: true,
        webcamEnabled: true,
        name: username,
        mode: "CONFERENCE",
        permissions: {
          toggleSelfWebcam: true,
          toggleSelfMic: true,
        },
      }}
      token={token}
    >
      <MeetingView meetingId={meetingId} />
    </MeetingProvider>
  );
}