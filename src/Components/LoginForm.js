import React, { useState } from "react";
import "./LoginForm.css";
import { Button } from "react-bootstrap";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { setNavigate } from "react-router-dom";




function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="Login">
      <div className="Fakebook">
        <div className="Fakebooktext">fakebook</div>
        <div className="title">
          Connect with friends and the world <br /> around you on Fakebook.
        </div>
      </div>
      <div className="logincontainer">
        <div className="logindetail"></div>
        <label>Email</label>
        <br />
        <input
          value={email}
          name="email"
          type="email"
          placeholder="Email address"
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <label>Password</label>
        <br />
        <input
          value={password}
          name="password"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button className="btn">Login</Button>
      </div>
    </div>
  );
}

export default LoginForm;
