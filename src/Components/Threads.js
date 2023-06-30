import React, { useState, useEffect } from "react";
import { ref as databaseRef, onChildAdded } from "firebase/database";
import { database } from "../firebase";
import { THREADS_DB_KEY } from "../constants";
import { Card, Col, Row } from "react-bootstrap";

export default function Threads() {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    const threadsRef = databaseRef(database, THREADS_DB_KEY);

    onChildAdded(threadsRef, (data) => {
      setThreads((t) => [...t, { key: data.key, val: data.val() }]);
    });
  }, []);

  return (
    <div>
      <Row xs={1} md={2} className="g-4">
        {threads.map((thread) => (
          <div key={thread.key}>
            <Col>
              <Card>  
                <Card.Img
                  variant="top"
                  src={thread.val.url}
                  alt={thread.val.title}
                  className="thread-img"
                />

                <Card.Body>
                  <Card.Title>{thread.val.title}</Card.Title>
                  <Card.Text>{thread.val.date}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </div>
        ))}
      </Row>
    </div>
  );
}
