import React, { useState, useEffect, useContext } from "react";
import {
  ref as databaseRef,
  onChildAdded,
  update,
  onChildRemoved,
  remove,
} from "firebase/database";
import { database, storage } from "../firebase";
import { THREADS_DB_KEY } from "../constants";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import NoImage from "../assets/Screenshot 2023-07-09 001928.png";
import ScrollToTop from "react-scroll-to-top";
import { ref as storageRef, deleteObject } from "firebase/storage";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { faTrash, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserContext } from "../App";
import "../App.css";

export default function Threads() {
  const user = useContext(UserContext);
  const [threads, setThreads] = useState([]);
  const [likes, setLikes] = useState({});
  const [userInput, setUserInput] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    const threadsRef = databaseRef(database, THREADS_DB_KEY);

    onChildAdded(threadsRef, (data) => {
      setThreads((t) => [...t, { key: data.key, val: data.val() }]);

      // When a new thread is added, grab the likes object from database and synchronize it with likes state.
      // As this effect runs when component mounts, the no of likes will now persist even if the user has navigated away/ closed the app
      setLikes((l) => ({
        ...l,
        [data.key]: data.val().likes,
      }));
    });
  }, []);

  useEffect(() => {
    const threadsRef = databaseRef(database, THREADS_DB_KEY);
    // Delete the deleted post & file from state so it is no longer rendered
    onChildRemoved(threadsRef, (removedOldData) => {
      console.log("data onChildRemoved", removedOldData);
      const threadsCopy = [...threads];
      const newThreads = threadsCopy.filter(
        (thread) => thread.key !== removedOldData.key
      );
      setThreads(newThreads);
    });
  }, [threads]);

  const handleLikes = (currentThreadKey) => {
    // First check if the current thread is already liked by the current logged in user
    const isLiked = likes[currentThreadKey]?.[user.uid] || false;

    // Update likes status depending on the current logged in user's actions
    const newLikes = {
      // Make a shallow copy to not mutate the original state
      ...likes,

      // Likes object stored in state will have the same data structure as per the likes object stored in database - object key is the thread child node key while object value is a nested object with the key-value pair corresponding to user's uid - true/ false boolean
      // This keeps track of all the likes gathered from each individual user for a specific thread
      [currentThreadKey]: {
        // Previous users' likes status for each current thread
        // An object with key being the previous logged in users' uids while value being a boolean value depending on whether the thread is liked by that user
        ...likes[currentThreadKey],

        // Current logged in user's like status for each current thread
        // An object with key being the current logged in users's uids while value being a boolean value that toggles between true (liked)/ false (unliked) depending on the current logged in user's actions
        [user.uid]: !isLiked,
      },
    };

    setLikes(newLikes);

    // Calculate no of likes for the current thread
    // Object.values(newLikes[currentThreadRef]) extracts all the boolean values including true/ false from the current thread
    // .filter(Boolean) returns an array with only truthy values while .length then returns how many truthy values / likes
    const likeCount = Object.values(newLikes[currentThreadKey]).filter(
      Boolean
    ).length;

    // Update to the database
    const threadRef = databaseRef(
      database,
      `${THREADS_DB_KEY}/${currentThreadKey}`
    );

    update(threadRef, {
      // Update the current thread in the database with only the current likes object but not updating it with the entire newLikes variable which includes a shallow copy of the original likes object
      likes: newLikes[currentThreadKey],
      likeCount: likeCount,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsFiltered(true);
  };

  const threadsRendered = isFiltered
    ? threads
        .filter((thread) => thread.val.displayName.includes(userInput))
        .map((filteredThread) => {
          const likeCount = Object.values(likes[filteredThread.key]).filter(
            Boolean
          ).length;

          return (
            <div key={filteredThread.key}>
              <ScrollToTop color="black" width="15" height="15" />

              <Col>
                <Card>
                  <Link to={`/threads/${filteredThread.key}`}>
                    {filteredThread.val.url &&
                    filteredThread.val.fileType === "image" ? (
                      <Card.Img
                        variant="top"
                        src={filteredThread.val.url}
                        alt={filteredThread.val.title}
                        className="thread-img"
                      />
                    ) : filteredThread.val.url &&
                      filteredThread.val.fileType === "video" ? (
                      <div className="video-container">
                        <video className="threads-video">
                          <source src={filteredThread.val.url} />
                        </video>
                        <div className="play-icon-overlay">
                          <i className="fas fa-play"></i>
                        </div>
                      </div>
                    ) : (
                      <Card.Img
                        variant="top"
                        src={NoImage}
                        alt={filteredThread.val.title}
                        className="thread-img"
                      />
                    )}
                  </Link>

                  <Card.Body>
                    <Card.Title>{filteredThread.val.title}</Card.Title>

                    <Row>
                      <Col>
                        <Button
                          variant="white"
                          onClick={() => handleLikes(filteredThread.key)}
                        >
                          ❤️ {likeCount}
                        </Button>
                      </Col>

                      <Col>
                        <Card.Text>{filteredThread.val.displayName}</Card.Text>
                      </Col>
                    </Row>

                    <Button
                      variant="danger"
                      onClick={() => {
                        // Delete file from storage
                        const fileDeletionRef = storageRef(
                          storage,
                          filteredThread.val.fileRef
                        );
                        filteredThread.val.fileRef &&
                          deleteObject(fileDeletionRef).then(() => {
                            console.log("file deleted");
                          });

                        // Delete an entire post from database
                        const postDeletionRef = databaseRef(
                          database,
                          `${THREADS_DB_KEY}/${filteredThread.key}`
                        );
                        remove(postDeletionRef).then(() => {
                          console.log("entire post deleted");
                        });
                      }}
                      hidden={user.email !== filteredThread.val.email}
                    >
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </div>
          );
        })
    : threads.map((thread) => {
        const likeCount = Object.values(likes[thread.key]).filter(
          Boolean
        ).length;

        return (
          <div key={thread.key}>
            <ScrollToTop color="black" width="15" height="15" />
            <Col>
              <Card className="h-100">
                <Link to={`/threads/${thread.key}`}>
                  {thread.val.url && thread.val.fileType === "image" ? (
                    <Card.Img
                      variant="top"
                      src={thread.val.url}
                      alt={thread.val.title}
                      className="thread-img"
                    />
                  ) : thread.val.url && thread.val.fileType === "video" ? (
                    <div className="video-container">
                      <video className="threads-video">
                        <source src={thread.val.url} />
                      </video>
                      <div className="play-icon-overlay">
                        <i className="fas fa-play"></i>
                      </div>
                    </div>
                  ) : (
                    <Card.Img
                      variant="top"
                      src={NoImage}
                      alt={thread.val.title}
                      className="thread-img"
                    />
                  )}
                </Link>
                {/*Start of Card Body */}
                <Card.Body>
                  <Card.Title className="fs-2">{thread.val.title}</Card.Title>
                  <div className="container text-center">
                    <Row>
                      <Col>
                        <Button
                          variant="white"
                          onClick={() => handleLikes(thread.key)}
                        >
                          ❤️ {likeCount}
                        </Button>
                      </Col>

                      <Col>
                        <Card.Text className="fs-5 pt-3">
                          {thread.val.displayName}
                        </Card.Text>
                      </Col>
                    </Row>
                  </div>
                  <Button
                    variant="danger"
                    onClick={() => {
                      // Delete file from storage
                      const fileDeletionRef = storageRef(
                        storage,
                        thread.val.fileRef
                      );
                      thread.val.fileRef &&
                        deleteObject(fileDeletionRef).then(() => {
                          console.log("file deleted");
                        });

                      // Delete an entire post from database
                      const postDeletionRef = databaseRef(
                        database,
                        `${THREADS_DB_KEY}/${thread.key}`
                      );
                      remove(postDeletionRef).then(() => {
                        console.log("entire post deleted");
                      });
                    }}
                    hidden={user.email !== thread.val.email}
                  >
                    <FontAwesomeIcon icon={faTrash} /> Delete
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </div>
        );
      });

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <InputGroup className="mb-3">
          <Form.Control
            type="text"
            placeholder="Search for a user's posts"
            value={userInput}
            onChange={({ target }) => setUserInput(target.value)}
            required
          />
          <InputGroup.Text>
            <FontAwesomeIcon icon={faSearch} onClick={handleSubmit} />
          </InputGroup.Text>
        </InputGroup>
      </Form>

      <Row xs={1} md={2} className="g-4">
        {threadsRendered.reverse()}
      </Row>
    </Container>
  );
}
