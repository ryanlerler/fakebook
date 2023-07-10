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
import { useNavigate } from "react-router-dom";
import ProfilePic from "./Components/ProfilePic";

export const UserContext = React.createContext();

function App() {
  const [loggedInUser, setLoggedInUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (loggedInUser) => {
      console.log(loggedInUser);
      if (loggedInUser) {
        setLoggedInUser(loggedInUser);
        navigate("/threads");
      }
    });
  }, []);

  const RequireAuth = ({ children, redirectTo, loggedInUser }) => {
    console.log("loggedInUser in RequireAuth", loggedInUser);
    const isAuthenticated = loggedInUser.uid && loggedInUser.accessToken;
    return isAuthenticated ? children : <Navigate to={redirectTo} />;
  };

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
                    <img
                      src={loggedInUser.photoURL}
                      alt="profilepic"
                      className="avatar"
                    />
                    <a href="#login">{loggedInUser.displayName}</a>
                  </Navbar.Text>
                </Navbar.Collapse>
              </Container>
            </Navbar>
          )}

          {loggedInUser.uid && loggedInUser.accessToken && (
            <Button
              onClick={async () => {
                await signOut(auth);
                setLoggedInUser({});
                navigate("/login");
              }}
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
                  <RequireAuth redirectTo="/login" loggedInUser={loggedInUser}>
                    <Threads />
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
                  <RequireAuth redirectTo="/signup" loggedInUser={loggedInUser}>
                    <Threads />
                  </RequireAuth>
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
                    Fakebook
                  </Link>
                  <RequireAuth redirectTo="/signup" loggedInUser={loggedInUser}>
                    <Composer />
                  </RequireAuth>
                </>
              }
            />

            <Route
              path="/threads/:id"
              element={
                <>
                  <RequireAuth redirectTo="/signup" loggedInUser={loggedInUser}>
                    <Link to="/threads" className="home">
                      Fakebook
                    </Link>
                    <Post />
                  </RequireAuth>
                </>
              }
            />

            <Route path="/profilepic" element={<ProfilePic />} />
          </Routes>
        </UserContext.Provider>
      </header>
    </div>
  );
}

export default App;
