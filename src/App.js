import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import React, { useState, useEffect } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Button, Container, Navbar } from "react-bootstrap";
import AuthForm from "./Components/AuthForm";
import Threads from "./Components/Threads";
import Composer from "./Components/Composer";
import Post from "./Components/Post";

export const UserContext = React.createContext();

function RequireAuth({ children, redirectTo, loggedInUser }) {
  const isAuthenticated = loggedInUser.uid && loggedInUser.accessToken;
  return isAuthenticated ? children : <Navigate to={redirectTo} />;
}

function App() {
  const [loggedInUser, setLoggedInUser] = useState({});

  useEffect(() => {
    console.log(loggedInUser);

    onAuthStateChanged(auth, (loggedInUser) => {
      if (loggedInUser) {
        setLoggedInUser(loggedInUser);
      }
    });
  }, [loggedInUser]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fakebook</h1>

        <UserContext.Provider value={loggedInUser}>
          {loggedInUser.uid && loggedInUser.accessToken && (
            <Navbar>
              <Container>
                <Navbar.Brand href="#home">Signed in as: </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-end">
                  <Navbar.Text>
                    <a href="#login">{loggedInUser.displayName}</a>
                  </Navbar.Text>
                </Navbar.Collapse>
              </Container>
            </Navbar>
          )}

          {loggedInUser.uid && loggedInUser.accessToken ? null : (
            <Link to="login">
              <Button>Log In / Sign Up</Button>
            </Link>
          )}

          {loggedInUser.uid && loggedInUser.accessToken && (
            <Button
              onClick={() => signOut(auth).then(() => setLoggedInUser({}))}
            >
              Log Out
            </Button>
          )}

          <Routes>
            <Route
              path="/"
              element={
                <>
                  <RequireAuth loggedInUser={loggedInUser}>
                    <Threads />
                  </RequireAuth>
                </>
              }
            />

            <Route path="/auth" element={<AuthForm />} />

            <Route
              path="/threads"
              element={
                <>
                  {/* <RequireAuth> */}
                    <Threads loggedInUser={loggedInUser} />
                  {/* </RequireAuth> */}
                </>
              }
            />

            <Route
              path="/composer"
              element={
                <>
                  {/* <RequireAuth loggedInUser={loggedInUser}> */}
                    <Composer />
                  {/* </RequireAuth> */}
                </>
              }
            />

            <Route path="/post:id" element={<Post />} />
          </Routes>
        </UserContext.Provider>
      </header>
    </div>
  );
}

export default App;
