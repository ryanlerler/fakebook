import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { Button, Card } from "react-bootstrap";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function SignUpForm() {
  // Setting State
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordconfirmation, setPasswordConfirmation] = useState("");
  const [emailmessage, setEmailMessage] = useState("");
  const [usernamemessage, setUsernameMessage] = useState("");
  const [passwordmessage, setPasswordMessage] = useState("");

  // Handle Email change
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  console.log(email);

  // This is to check is the email address enter conform to standard email address output.
  const checkEmailValidation = () => {
    const RGEXPemail =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (RGEXPemail.test(email)) {
      setEmailMessage("Email is Valid");
    } else if (email === "") {
      setEmailMessage("Please Enter Email");
    } else if (!RGEXPemail.test(email)) {
      setEmailMessage("Email is not valid");
    } else {
      setEmailMessage("");
    }
  };

  const handleUserNameChange = (e) => {
    setUsername(e.target.value);
  };
  // This to ensure that username input is not empty.
  const checkUsernameValidation = () => {
    if (username === "") {
      setUsernameMessage("Please Key in username");
    } else {
      setUsernameMessage("");
    }
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };
  const handleConfirmationPassword = (e) => {
    setPasswordConfirmation(e.target.value);
  };

  // This to check is the password in the password and confirm password field matches.
  const checkPasswordValidation = () => {
    if (password === passwordconfirmation) {
      setPasswordMessage("Password matched!");
    } else {
      setPasswordMessage("Password does not match");
    }
  };

  // Message prompt for new user if the email address in placed has been taken up.
  const signUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        updateProfile(auth.currentUser, { displayName: username });
        navigate("/threads");
      })
      .catch((error) => {
        const errorCode = error.code;
        console.log(errorCode);
        const errorMessage = error.message;
        console.log(errorMessage);
        if (errorCode === "auth/email-already-in-use") {
          setEmailMessage("Email in use. Kindly pick another email ");
        } else {
          return setEmailMessage("");
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
              <h2 className="text-center mb-4">Sign Up </h2>
              <Form>
                <Form.Group id="username">
                  <Form.Label className="fs-5">Username:</Form.Label>
                  <Form.Control
                    value={username}
                    name="username"
                    type="text"
                    placeholder="Enter Username"
                    onChange={handleUserNameChange}
                  />
                  <p className="fs-6 text-danger">{usernamemessage}</p>
                </Form.Group>

                <Form.Group id="email">
                  <Form.Label className="fs-5">Email:</Form.Label>
                  <Form.Control
                    value={email}
                    name="email"
                    type="email"
                    placeholder="Enter Email Address"
                    onChange={handleEmailChange}
                  />
                  <p className="fs-6 text-danger">{emailmessage}</p>
                </Form.Group>

                <Form.Group id="password">
                  <Form.Label className="fs-5">Password:</Form.Label>
                  <Form.Control
                    value={password}
                    name="password"
                    type="password"
                    placeholder="Password"
                    onChange={handlePassword}
                  />

                  <Form.Group id="confirmpassword">
                    <Form.Label className="fs-5">
                      Password Confirmation
                    </Form.Label>
                    <Form.Control
                      value={passwordconfirmation}
                      name="password"
                      type="password"
                      placeholder="Password"
                      onChange={handleConfirmationPassword}
                    />
                    <p className="fs-6 text-danger">{passwordmessage}</p>
                  </Form.Group>
                </Form.Group>
                <br />
                <Button
                  onClick={() => {
                    checkEmailValidation();
                    checkUsernameValidation();
                    checkPasswordValidation();
                    signUp();
                  }}
                  className="w-100"
                >
                  Sign Up
                </Button>
              </Form>
            </Card.Body>
          </Card>
          <br />
          <div className="w-100 text-center mt2 fs-5">
            Already have an account?
            <Button onClick={() => navigate("/login")}>Log In </Button>
          </div>
        </div>
      </Container>
    </>
  );
}

export default SignUpForm;
