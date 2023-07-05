import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { Button, Card } from "react-bootstrap";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function LoginForm() {
  // Setting State
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // see the current state of the email
  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  // see the current state of the password
  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  // sign in and catching the error from firebase to reflect the message
  const signIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(user);
        navigate("/threads");
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
    <>
      <Container
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="w-100" style={{ maxWidth: "400px" }}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Log in </h2>
              <Form>
                <Form.Group id="email">
                  <Form.Label className="fs-5">Email:</Form.Label>
                  <Form.Control
                    value={email}
                    name="email"
                    type="email"
                    placeholder="Enter Email Address"
                    onChange={handleEmail}
                  />
                </Form.Group>
                <Form.Group id="password">
                  <Form.Label className="fs-5">Password:</Form.Label>
                  <Form.Control
                    value={password}
                    name="password"
                    type="password"
                    placeholder="Enter Password"
                    onChange={handlePassword}
                  />
                </Form.Group>
                <br />
                <p className="text-danger">{message}</p>
                <br />
                <Button className="w-100" onClick={signIn}>
                  Sign In
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
}

export default LoginForm;
