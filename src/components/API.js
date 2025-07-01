// src/API.js

// Fetch VideoSDK token from your backend
export const getToken = async () => {
    const res = await fetch("http://localhost:3000/get-token", {
      credentials: "include", // if you are using cookies
    });
    const data = await res.json();
    if (data.success) return data.token;
    throw new Error("Failed to fetch token");
  };
  
  // Create a new meeting using VideoSDK API
  export const createMeeting = async ({ token }) => {
    const res = await fetch("https://api.videosdk.live/v2/rooms", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return data.roomId;
  };
  