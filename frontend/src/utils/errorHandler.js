import { toast } from "react-toastify";

export const handleError = (err) => {
  const message = err.response?.data?.message || "Something went wrong!";
  toast.error(message);
};
