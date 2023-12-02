"use client";
export default function Login() {
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
        // Sign up failed, display the error
        console.error("Error during sign up:", response.statusText);
        // Add some code here to display the error to the user
      }
    } catch (error) {
      console.error("Error during sign up:", error);
    }
  };

  const handleLogin = async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

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
        // Login failed, display the error
        console.error("Error during login:", response.statusText);
        // Add some code here to display the error to the user
      }
    } catch (error) {
      console.error("Error during login:", error);
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
