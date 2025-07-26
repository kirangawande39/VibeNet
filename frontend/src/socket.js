const backendUrl = import.meta.env.VITE_BACKEND_URL;
// console.log("backendUrl :",backendUrl)
import { io } from "socket.io-client";
const socket = io(`${backendUrl}`, {
  withCredentials: true,
});
export default socket;
