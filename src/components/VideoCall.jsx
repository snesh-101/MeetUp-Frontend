// src/components/VideoCallComponent.jsx
import React, { useState, useEffect } from "react";
import {
  MeetingProvider,
  useMeeting,
  useLocalVideoToggle,
  ParticipantView,
} from "@videosdk.live/react-sdk";
import {
  MdMic,
  MdMicOff,
  MdVideocam,
  MdVideocamOff,
  MdCallEnd,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Fetch a token for VideoSDK from your backend
async function fetchToken() {
  const res = await fetch(`${BASE_URL}/get-token`, {
    method: "POST",
    credentials: "include",
  });
  const { token } = await res.json();
  return token;
}

// Create a new room on your backend
async function createRoom(token) {
  const res = await fetch(`${BASE_URL}/create-room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token }),
  });
  const { roomId } = await res.json();
  return roomId;
}

// Validate an existing room ID on your backend
async function validateMeetingId(token, roomId) {
  const res = await fetch(`${BASE_URL}/validate-room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, roomId }),
  });
  const { valid } = await res.json();
  return valid;
}

function Controls() {
  const { toggleMic, toggleWebcam, leave, localMicOn, localWebcamOn } =
    useMeeting();
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const handleToggle = async (type) => {
    if (processing) return;
    setProcessing(true);
    try {
      if (type === "mic") await toggleMic();
      else await toggleWebcam();
    } catch (e) {
      console.error(`${type} toggle error:`, e);
    } finally {
      setProcessing(false);
    }
  };

  const handleLeave = () => {
    leave();
    navigate("/connections");
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-5 bg-gray-800/80 backdrop-blur-lg p-5 rounded-full border border-gray-700 shadow-lg">
      <button
        onClick={() => handleToggle("mic")}
        disabled={processing}
        className={`p-4 rounded-full ${
          localMicOn ? "bg-green-500" : "bg-red-500"
        } text-white`}
      >
        {localMicOn ? <MdMic /> : <MdMicOff />}
      </button>
      <button
        onClick={() => handleToggle("camera")}
        disabled={processing}
        className={`p-4 rounded-full ${
          localWebcamOn ? "bg-green-500" : "bg-red-500"
        } text-white`}
      >
        {localWebcamOn ? <MdVideocam /> : <MdVideocamOff />}
      </button>
      <button
        onClick={handleLeave}
        className="p-4 rounded-full bg-red-600 text-white"
      >
        <MdCallEnd />
      </button>
    </div>
  );
}

function MeetingView({ meetingId }) {
  const { join, participants, localParticipant } = useMeeting();
  const [joined, setJoined] = useState(false);

  const remoteIds = Array.from(participants.keys()).filter(
    (id) => id !== localParticipant?.id
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 text-white p-5 pb-32">
      <h2 className="text-center mb-6 text-2xl font-bold">
        Meeting ID: {meetingId}
      </h2>

      {!joined ? (
        <div className="text-center">
          <button
            onClick={() => {
              join();
              setJoined(true);
            }}
            className="px-8 py-4 bg-green-500 rounded-2xl font-bold hover:bg-green-600 transition"
          >
            Join Meeting
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap justify-center gap-4">
            {/* Local video */}
            {localParticipant && (
              <ParticipantView
                participantId={localParticipant.id}
                view="video"
                className="w-[320px] h-[240px] bg-black rounded-lg overflow-hidden"
              />
            )}
            {/* Remote videos */}
            {remoteIds.map((id) => (
              <ParticipantView
                key={id}
                participantId={id}
                view="video"
                className="w-[320px] h-[240px] bg-black rounded-lg overflow-hidden"
              />
            ))}
          </div>
          <Controls />
        </>
      )}
    </div>
  );
}

export default function VideoCallComponent() {
  const username = useSelector((s) => s.user?.firstName || "Guest");
  const [token, setToken] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [inputId, setInputId] = useState("");
  const [error, setError] = useState("");
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    fetchToken()
      .then(setToken)
      .catch((e) => {
        console.error("Token fetch failed:", e);
        setError("Failed to fetch token");
      });
  }, []);

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-purple-900">
        <p className="text-white animate-pulse">
          {error || "Fetching token..."}
        </p>
      </div>
    );
  }

  if (!meetingId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center p-5">
        <div className="bg-gray-800/80 backdrop-blur-lg p-8 rounded-2xl border border-gray-700 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6 text-white">
            Video Call
          </h1>
          <button
            onClick={async () => {
              const id = await createRoom(token);
              setMeetingId(id);
            }}
            className="w-full py-3 mb-4 bg-green-500 rounded-2xl font-bold text-white hover:bg-green-600 transition"
          >
            Create New Room
          </button>
          <div className="text-center mb-4 text-cyan-300 font-medium">OR</div>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={inputId}
            onChange={(e) => {
              setInputId(e.target.value);
              setError("");
            }}
            className="w-full p-3 mb-2 bg-gray-700 text-white rounded-xl"
          />
          {error && (
            <p className="text-red-400 text-sm mb-2 text-center">{error}</p>
          )}
          <button
            onClick={async () => {
              if (!inputId.trim()) {
                setError("Please enter a meeting ID");
                return;
              }
              setValidating(true);
              const ok = await validateMeetingId(token, inputId.trim());
              setValidating(false);
              if (ok) setMeetingId(inputId.trim());
              else setError("Invalid meeting ID");
            }}
            disabled={validating}
            className="w-full py-3 bg-blue-500 rounded-2xl font-bold text-white hover:bg-blue-600 transition disabled:opacity-50"
          >
            {validating ? "Validating..." : "Join Meeting"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <MeetingProvider
      token={token}
      config={{
        meetingId,
        name: username,
        mode: "CONFERENCE",
        micEnabled: true,
        webcamEnabled: true,
      }}
    >
      <MeetingView meetingId={meetingId} />
    </MeetingProvider>
  );
}
