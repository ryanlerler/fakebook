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

  // Sign up function
  const signUp = async () => {
    const user = await createUserWithEmailAndPassword(auth, email, password);
    console.log(user);
    setEmail("");
    setPassword("");
    navigate("/threads");
  };

  // Sign In Function
  const signIn = async () => {
    const user = await signInWithEmailAndPassword(auth, email, password);
    console.log(user);
    setEmail("");
    setPassword("");
    navigate("/threads");
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
