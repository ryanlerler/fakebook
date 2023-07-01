import React, { useEffect, useState } from "react";
import { database } from "../firebase";
import { ref as databaseRef, get } from "firebase/database";
import { THREADS_DB_KEY } from "../constants";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card } from "react-bootstrap";

export default function Post() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const postRef = databaseRef(database, `${THREADS_DB_KEY}/${id}`);
      const data = await get(postRef);
      console.log(data);
      setPost({ key: data.key, val: data.val() });
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    console.log(post);
  }, [post]);

  return (
    <div>
      {post.key && (
        <Card>
          <Card.Img
            variant="top"
            src={post.val.url}
            alt={post.val.title}
            className="thread-img"
          />

          <Card.Body>
            <Card.Title>{post.val.title}</Card.Title>
            <Card.Text>{post.val.description}</Card.Text>
            <Card.Text>{post.val.date}</Card.Text>
            <Button onClick={() => navigate(-1)}>Back</Button>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
