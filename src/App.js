import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import React, { useState, useEffect } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Button, Container, Navbar } from "react-bootstrap";
import Threads from "./Components/Threads";
import Composer from "./Components/Composer";
import Post from "./Components/Post";
import LoginForm from "./Components/LoginForm";
import SignUpForm from "./Components/SignUpForm";

export const UserContext = React.createContext();

function RequireAuth({ children, redirectTo, loggedInUser }) {
  const isAuthenticated = loggedInUser.uid && loggedInUser.accessToken;
  return isAuthenticated ? children : <Navigate to={redirectTo} />;
}

function App() {
  const [loggedInUser, setLoggedInUser] = useState({});

  useEffect(() => {
    onAuthStateChanged(auth, (loggedInUser) => {
      console.log(loggedInUser);
      if (loggedInUser) {
        setLoggedInUser(loggedInUser);
      }
    });
  }, [loggedInUser]);

  return (
    <div className="App">
      <header className="App-header">
        <UserContext.Provider value={loggedInUser}>
          {loggedInUser.uid && loggedInUser.accessToken && (
            <Navbar>
              <Container>
                <Navbar.Brand href="#home">Signed in as: </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                  <Navbar.Text>
                    {/**  TODO: change to displayName */}
                    <a href="#login">{loggedInUser.email}</a>
                  </Navbar.Text>
                </Navbar.Collapse>
              </Container>
            </Navbar>
          )}

          {loggedInUser.uid && loggedInUser.accessToken && (
            <Button
              onClick={() =>
                signOut(auth).then(() => {
                  setLoggedInUser({});
                })
              }
              className="logout-button"
            >
              Log Out
            </Button>
          )}

          <Routes>
            <Route
              path="/"
              element={
                <>
                  <RequireAuth redirectTo="/signup" loggedInUser={loggedInUser}>
                    <Threads loggedInUser={loggedInUser.uid} />
                  </RequireAuth>
                </>
              }
            />

            <Route path="/signup" element={<SignUpForm />} />

            <Route path="/login" element={<LoginForm />} />

            <Route
              path="/threads"
              element={
                <>
                  {/* <RequireAuth redirectTo="/signup" loggedInUser={loggedInUser}> */}
                    <Threads loggedInUser={loggedInUser.uid} />
                  {/* </RequireAuth> */}
                  <Button variant="danger" className="plus-button">
                    <Link to="/composer">+</Link>
                  </Button>
                </>
              }
            />

            <Route
              path="/composer"
              element={
                <>
                  <Link to="/threads" className="home">
                    Home
                  </Link>
                  {/* <RequireAuth redirectTo="/signup" loggedInUser={loggedInUser}> */}
                    <Composer />
                  {/* </RequireAuth> */}
                </>
              }
            />

            <Route
              path="/post/:id"
              element={
                <>
                  {/* <RequireAuth redirectTo="/signup" loggedInUser={loggedInUser}> */}
                    <Post loggedInUser={loggedInUser} />
                  {/* </RequireAuth> */}
                </>
              }
            />
          </Routes>
        </UserContext.Provider>
      </header>
    </div>
  );
}

export default App;
