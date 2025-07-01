import { BrowserRouter, Route, Routes } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import Profile from "./components/Profile";
import { Provider } from "react-redux";
import { appStore } from "./utils/appStore";
import Feed from "./components/Feed";
import Connections from "./components/Connections";
import Requests from "./components/Requests";
import Chat from "./components/Chat";
import VideoCall from "./components/VideoCall";

function App() {
  return (
   <Provider store={appStore}>
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Body/>}>
          <Route path="/" element={<Feed></Feed>}></Route>
          <Route path="/login" element={<Login></Login>}></Route>
          <Route path="/profile" element={<Profile/>}></Route>
          <Route path="/connections" element={<Connections/>}></Route>
          <Route path="/requests" element={<Requests/>}></Route>
          <Route path="/chat/:targetUserId/:firstName" element={<Chat></Chat>}> </Route>
          <Route path="/video-call/:targetUserId/:firstName" element={<VideoCall></VideoCall>}> </Route>
          
         </Route>
    
      </Routes>
    </BrowserRouter>
    </Provider>
  )
}

export default App
