import React, { useState, useEffect } from "react";
import { ref as databaseRef, onChildAdded, update } from "firebase/database";
import { database } from "../firebase";
import { THREADS_DB_KEY } from "../constants";
import { Button, Card, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Threads({ loggedInUser }) {
  const [threads, setThreads] = useState([]);
  const [likes, setLikes] = useState({});

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

  const handleLikes = (currentThreadKey) => {
    // First check if the current thread is already liked by the current logged in user
    const isLiked = likes[currentThreadKey]?.[loggedInUser] || false;

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
        [loggedInUser]: !isLiked,
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

  return (
    <div>
      <Row xs={1} md={2} className="g-4">
        {threads.map((thread) => {
          const likeCount = Object.values(likes[thread.key]).filter(
            Boolean
          ).length;

          return (
            <div key={thread.key}>
              <Col>
                <Card>
                  <Link to={`/post/${thread.key}`}>
                    <Card.Img
                      variant="top"
                      src={thread.val.url}
                      alt={thread.val.title}
                      className="thread-img"
                    />
                  </Link>

                  <Card.Body>
                    <Card.Title>{thread.val.title}</Card.Title>
                    <Card.Text>{thread.val.date}</Card.Text>

                    <Button
                      variant="white"
                      onClick={() => handleLikes(thread.key)}
                    >
                      ❤️ {likeCount}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </div>
          );
        })}
      </Row>
    </div>
  );
}
