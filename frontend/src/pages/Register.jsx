import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from 'react-toastify';

const Register = () => {
  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", user);

      alert("Registered Successfully",);

      // if(res.status === 400){
      //   alert("user allready exists..")
      // }

      console.log("Res :", res);
      navigate("/login");
    } 
    catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message); // Alert message like "User already exists"
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <ToastContainer position="top-center" autoClose={2000}  theme="light"/>
      <div className="card p-4 shadow-sm" style={{ width: "350px" }}>
        <h3 className="text-center">Sign Up</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="form-control"
              value={user.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-2">
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="form-control"
              value={user.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-2">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="form-control"
              value={user.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-2">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="form-control"
              value={user.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Sign Up</button>
        </form>
        <p className="text-center mt-2">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
