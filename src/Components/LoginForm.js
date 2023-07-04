import React, { useState } from "react";
import "./LoginForm.css";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";



function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Sign up function
  const signUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(user);
        navigate("./threads");
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        console.log(errorCode);
        const errorMessage = error.message;
        console.log(errorMessage);
        if (errorCode === "auth/invalid-email") {
          setMessage("Please Key in a Valid Email Address.");
        } else if (errorCode === "auth/email-already-in-use") {
          setMessage("Email in use. Kindly pick another email ");
        } else if (errorCode === "auth/wrong-password") {
          setMessage("Incorrect Password. Try again!");
        } else if (errorCode === "auth/weak-password") {
          setMessage("Please key in a password of at least 6 characters.");
        } else {
          return setMessage("");
        }
        // ..
      });
  };
// Sign In Function
  const signIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(user);
        navigate("./threads");
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        console.log(errorCode);
        const errorMessage = error.message;
        console.log(errorMessage);
        if (errorCode === "auth/invalid-email") {
          setMessage("Please Key in a Valid Email Address.");
        } else if (errorCode === "auth/email-already-in-use") {
          setMessage("Email in use. Kindly pick another email ");
        } else if (errorCode === "auth/wrong-password") {
          setMessage("Incorrect Password. Try again!");
        } else if (errorCode === "auth/weak-password") {
          setMessage("Please key in a password of at least 6 characters.");
        } else {
          return setMessage("");
        }
      });
  };

  return (
    <div className="Login">
      <Container>
        <Row>
          <Col>
            <div className="Fakebook">
              <div className="Fakebooktext align-left text-primary fs-1 fw-bold">
                Fakebook
              </div>
              <div className="title fs-2">
                Connect with friends and the world <br /> around you on
                Fakebook.
              </div>
            </div>
          </Col>
          <Col>
            <div className="logincontainer border border-top-0 border-white mx-auto p-5 border-opacity-25">
              <div className="logindetail">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label className="fs-5">Email</Form.Label>
                    <br />
                    <Form.Control
                      value={email}
                      name="email"
                      type="email"
                      placeholder="Email address"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Form.Group>
                  <br />
                  <Form.Group className="mb-3">
                    <Form.Label className="fs-5">Password</Form.Label>
                    <br />
                    <Form.Control
                      value={password}
                      name="password"
                      type="password"
                      placeholder="Password"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="text-danger">{message}</p>
                  </Form.Group>
                </Form>
              </div>
              <br />
              <div className="d-flex justify-content-evenly">
                <Button onClick={signUp} className="btn btn-primary btn-sm">
                  Sign Up
                </Button>
                <Button onClick={signIn} className="btn btn-primary btn-sm">
                  Sign In
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default LoginForm;
