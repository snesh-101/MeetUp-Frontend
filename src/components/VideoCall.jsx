// src/components/VideoCallComponent.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
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

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

/* ---------- utility calls ---------- */
async function fetchToken() {
  const res = await fetch(`${BASE_URL}/get-token`, {
    method: "POST",
    credentials: "include",
  });
  return (await res.json()).token;
}
async function createRoom(token) {
  const res = await fetch(`${BASE_URL}/create-room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token }),
  });
  return (await res.json()).roomId;
}
async function validateMeetingId(token, roomId) {
  const res = await fetch(`${BASE_URL}/validate-room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, roomId }),
  });
  return (await res.json()).valid;
}

/* ---------- participant tile ---------- */
function ParticipantTile({ participantId, isLocal }) {
  const { webcamStream, micStream, displayName, webcamOn, micOn } =
    useParticipant(participantId);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (webcamOn && webcamStream?.track) {
      const stream = new MediaStream([webcamStream.track]);
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [webcamOn, webcamStream]);

  useEffect(() => {
    if (micOn && micStream?.track && !isLocal) {
      const stream = new MediaStream([micStream.track]);
      audioRef.current.srcObject = stream;
      audioRef.current.play().catch(() => {});
    } else if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
  }, [micOn, micStream, isLocal]);

  return (
    <div className="flex flex-col items-center bg-gray-800/70 rounded-lg overflow-hidden shadow-lg">
      <div className="flex items-center gap-2 bg-gray-900/80 w-full px-2 py-1">
        {micOn ? (
          <MdMic className="text-green-400" />
        ) : (
          <MdMicOff className="text-red-400" />
        )}
        {webcamOn ? (
          <MdVideocam className="text-green-400" />
        ) : (
          <MdVideocamOff className="text-red-400" />
        )}
        <span className="text-white text-sm">
          {displayName}
          {isLocal ? " (You)" : ""}
        </span>
      </div>
      {webcamOn ? (
        <video
          ref={videoRef}
          muted={isLocal}
          playsInline
          className="w-[320px] h-[240px] bg-black"
        />
      ) : (
        <div className="w-[320px] h-[240px] bg-gray-700 flex items-center justify-center text-white text-xl">
          {displayName?.charAt(0).toUpperCase() || "U"}
        </div>
      )}
      <audio ref={audioRef} muted={isLocal} />
    </div>
  );
}

/* ---------- in‑call controls ---------- */
function Controls() {
  const { toggleMic, toggleWebcam, leave, localMicOn, localWebcamOn } =
    useMeeting();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handle = async (type) => {
    if (busy) return;
    setBusy(true);
    try {
      if (type === "mic") await toggleMic();
      else await toggleWebcam();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 bg-gray-900/80 p-4 rounded-full shadow-lg">
      <button
        onClick={() => handle("mic")}
        disabled={busy}
        className={`p-3 rounded-full ${
          localMicOn ? "bg-green-500" : "bg-red-500"
        } text-white`}
      >
        {localMicOn ? <MdMic /> : <MdMicOff />}
      </button>
      <button
        onClick={() => handle("camera")}
        disabled={busy}
        className={`p-3 rounded-full ${
          localWebcamOn ? "bg-green-500" : "bg-red-500"
        } text-white`}
      >
        {localWebcamOn ? <MdVideocam /> : <MdVideocamOff />}
      </button>
      <button
        onClick={() => {
          leave();
          navigate("/connections");
        }}
        className="p-3 rounded-full bg-red-600 text-white"
      >
        <MdCallEnd />
      </button>
    </div>
  );
}

/* ---------- meeting view ---------- */
function MeetingView({ meetingId }) {
  const { join, participants, localParticipant } = useMeeting();
  const [joined, setJoined] = useState(false);

  const remoteIds = Array.from(participants.keys()).filter(
    (id) => id !== localParticipant?.id
  );

  if (!joined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
        <button
          onClick={() => {
            join();
            setJoined(true);
          }}
          className="px-8 py-4 bg-green-500 rounded-2xl text-white font-bold hover:bg-green-600"
        >
          Join Meeting
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 text-white">
      <h2 className="text-center text-2xl mb-4">Meeting ID: {meetingId}</h2>
      <div className="flex flex-wrap gap-4 justify-center">
        {localParticipant && (
          <ParticipantTile participantId={localParticipant.id} isLocal />
        )}
        {remoteIds.map((id) => (
          <ParticipantTile key={id} participantId={id} isLocal={false} />
        ))}
      </div>
      <Controls />
    </div>
  );
}

/* ---------- root component ---------- */
export default function VideoCallComponent() {
  /* ---------- auth guard ---------- */
  const user = useSelector((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  /* ---------- component state ---------- */
  const username = user?.firstName || "Guest";

  const [token, setToken] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [inputId, setInputId] = useState("");
  const [error, setError] = useState("");
  const [validating, setValidating] = useState(false);

  /* ---------- get API token ---------- */
  useEffect(() => {
    fetchToken()
      .then(setToken)
      .catch(() => setError("Failed to fetch token"));
  }, []);

  /* ---------- UI states ---------- */
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-purple-900">
        <p className="text-white">{error || "Fetching token..."}</p>
      </div>
    );
  }

  if (!meetingId) {
    return (
      <div className="min-h-screen p-5 flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
        <div className="bg-gray-800/80 p-6 rounded-2xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl mb-4 text-white font-bold">Video Call</h1>

          <button
            onClick={async () => {
              const id = await createRoom(token);
              setMeetingId(id);
            }}
            className="w-full py-3 mb-4 bg-green-500 rounded-xl text-white font-bold hover:bg-green-600"
          >
            Create New Room
          </button>

          <div className="text-center text-cyan-300 mb-4">OR</div>

          <input
            type="text"
            value={inputId}
            onChange={(e) => {
              setInputId(e.target.value);
              setError("");
            }}
            placeholder="Enter Room ID"
            className="w-full p-3 mb-2 rounded-lg bg-gray-700 text-white"
          />
          {error && <p className="text-red-400 mb-2">{error}</p>}

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
            className="w-full py-3 bg-blue-500 rounded-xl text-white font-bold hover:bg-blue-600 disabled:opacity-50"
          >
            {validating ? "Validating..." : "Join Meeting"}
          </button>
        </div>
      </div>
    );
  }

  /* ---------- meeting provider ---------- */
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
