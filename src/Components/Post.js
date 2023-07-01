import React, { useEffect, useState } from "react";
import { database } from "../firebase";
import { ref as databaseRef, get } from "firebase/database";
import { THREADS_DB_KEY } from "../constants";
import { useParams } from "react-router-dom";
import { Card } from "react-bootstrap";

export default function Post() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const postRef = databaseRef(database, `${THREADS_DB_KEY}/${id}`);
      const data = await get(postRef);
      console.log(data);
      setPost(data.val());
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    console.log(post);
  }, [post]);

  return (
    <div>
      {post !== null && (
        <Card>
          <Card.Img
            variant="top"
            src={post.url}
            alt={post.title}
            className="thread-img"
          />

          <Card.Body>
            <Card.Title>{post.title}</Card.Title>
            <Card.Text>{post.description}</Card.Text>
            <Card.Text>{post.date}</Card.Text>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
