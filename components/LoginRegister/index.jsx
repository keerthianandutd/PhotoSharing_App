import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function LoginRegister({ onLoginSuccess }) {
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [description, setDescription] = useState(""); 
  const [occupation, setOccupation] = useState(""); 
  const [location, setLocation] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("/admin/login", { login_name: loginName, password }, {withCredentials: true});
      onLoginSuccess(response.data);
      navigate("/");
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Login failed.");
      setSuccessMessage("");
    }
  };

  const handleRegister = async () => {
    if (!loginName || !password || !firstName || !lastName) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return; // Don't proceed with registration if passwords don't match
    }
    //else {
      // eslint-disable-next-line no-alert
      //alert("Registration successful! Please log in.");
    //}

    try {
      await axios.post("/user", {
        first_name: firstName,
        last_name: lastName,
        description,
        occupation,
        location,
        login_name: loginName,
        password,
      });
      setSuccessMessage("Registration successful! Please log in.");
      setErrorMessage("");
      setIsRegistering(false);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Registration failed.");
    }
  };

  const resetForm = () => {
    setLoginName("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setDescription("");
    setOccupation("");
    setLocation("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSwitchMode = () => {
    setIsRegistering(!isRegistering);
    resetForm();
  };

  return (
    <div className="login-register">
      <h1>{isRegistering ? "Register Me" : "Login"}</h1>
      {isRegistering && (
      <>
        <div className="row">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="row">
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="text"
            placeholder="Occupation"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
          />
        </div>
        <div className="row">
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <input
            type="text"
            placeholder="Login Name"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
          />
        </div>
        <div className="row">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </>
      )}

      {/* Login Name field (always shown outside of registration condition) */}
      {!isRegistering && (
        <>
          <input
            type="text"
            placeholder="Login Name"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
          />
	        <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </>
      )}
      <label>
        <input
          type="checkbox"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
        />
        ShowPassword
      </label>
      <button onClick={isRegistering ? handleRegister : handleLogin}>
        {isRegistering ? "Register" : "Login"}
      </button>
      <button onClick={handleSwitchMode}>
        {isRegistering ? "Switch to Login" : "Switch to Register"}
      </button>
      <label className="switch-lable">
          {isRegistering ? "Already have an Account" : "Have no Account"}
      </label>
      {successMessage && <p className="success">{successMessage}</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
}

export default LoginRegister;