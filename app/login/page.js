"use client";
import React, { useEffect, useState } from 'react';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css'; // for styles

export default function Login() {
  const [notyf, setNotyf] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const notyfInstance = new Notyf({
        duration: 8000 // Duration in milliseconds, e.g., 5000 for 5 seconds
        // You can add other Notyf options here
      });
      setNotyf(notyfInstance);
    }
  }, []);

  const handleSignUp = async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/api/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        window.location.href = "/";
      } else {
        const errorText = await response.text();
        if (notyf) handleErrorResponse(response.status, errorText, 'signup');
      }
    } catch (error) {
      if (notyf) notyf.error("Error during sign up: " + error.message);
    }
  };

    const handleLogin = async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    // Check if the username and password fields are empty
    if (!username.trim() || !password.trim()) {
      if (notyf) notyf.error("Username and password are required.");
      return; // Stop the function if fields are empty
    }
  
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (response.ok) {
        window.location.href = "/";
      } else {
        const errorText = await response.text();
        if (notyf) handleErrorResponse(response.status, errorText, 'login');
      }
    } catch (error) {
      if (notyf) notyf.error("Error during login: " + error.message);
    }
  };
  

  const handleErrorResponse = (status, message, action) => {
    if (!notyf) return;

    switch (status) {
      case 401:
        notyf.error("Incorrect username or password.");
        break;
      case 400:
        notyf.error("Username already exists.");
        break;
      case 500:
        notyf.error("Internal Server Error: Please try again later.");
        break;
      default:
        notyf.error(`${action.charAt(0).toUpperCase() + action.slice(1)} failed: ${message}`);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-ui">
        <div className="form-group">
          <label className="primary-color display-block" htmlFor="username">
            Username:
          </label>
          <input
            className="login-input"
            type="text"
            id="username"
            name="username"
            required
          />
        </div>
        <div className="form-group">
          <label className="primary-color display-block" htmlFor="password">
            Password:
          </label>
          <input
            className="login-input"
            type="password"
            id="password"
            name="password"
            required
          />
        </div>
        <button
          className="login-page-buttons"
          type="button"
          onClick={handleLogin}
        >
          Login
        </button>
        <button
          className="login-page-buttons"
          type="button"
          onClick={handleSignUp}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
