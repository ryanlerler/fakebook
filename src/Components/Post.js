import React, { useEffect, useState, useRef } from "react";
import { database } from "../firebase";
import {
  ref as databaseRef,
  get,
  onChildAdded,
  update,
} from "firebase/database";
import { GOOGLE_MAPS_API_KEY, THREADS_DB_KEY } from "../constants";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Form } from "react-bootstrap";
import axios from "axios";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import NoImage from "../assets/Screenshot 2023-07-09 001928.png";
import ScrollToTop from "react-scroll-to-top";
import Filter from "bad-words";

const filter = new Filter();

export default function Post({ displayName, loggedInUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState({});
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState([]);
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const [likes, setLikes] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const postRef = databaseRef(database, `${THREADS_DB_KEY}/${id}`);
      const data = await get(postRef);
      console.log(data);
      setPost({
        key: data.key,
        val: data.val(),
      });
      // Grab the comments from DB and synchronize them with comments state
      // When there are no comments yet, data.val().comments will be undefined or null. Set it to an empty array explicitly to avoid errors when spreading comments later
      setComments(data.val().comments || []);
    };

    fetchData();
  }, [id, likes]);

  useEffect(() => {
    const threadsRef = databaseRef(database, THREADS_DB_KEY);

    onChildAdded(threadsRef, (data) => {
      setLikes((l) => ({
        ...l,
        [data.key]: data.val().likes,
      }));
    });
  }, []);

  const handleLikes = (currentThreadKey) => {
    const isLiked = likes[currentThreadKey]?.[loggedInUser] || false;
    const newLikes = {
      ...likes,
      [currentThreadKey]: {
        ...likes[currentThreadKey],
        [loggedInUser]: !isLiked,
      },
    };
    setLikes(newLikes);
    const likeCount = Object.values(newLikes[currentThreadKey]).filter(
      Boolean
    ).length;
    const threadRef = databaseRef(
      database,
      `${THREADS_DB_KEY}/${currentThreadKey}`
    );
    update(threadRef, {
      likes: newLikes[currentThreadKey],
      likeCount: likeCount,
    });
  };

  const writeData = (e) => {
    e.preventDefault();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        axios
          .get(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&result_type=country&key=${GOOGLE_MAPS_API_KEY}`
          )
          .then((data) => {
            const location = data.data.results[0].formatted_address;
            const threadRef = databaseRef(database, `${THREADS_DB_KEY}/${id}`);
            const cleanedComment = filter.isProfane(commentInput)
              ? filter.clean(commentInput)
              : commentInput;

            const newComment = {
              displayName: displayName,
              comment: cleanedComment,
              date: new Date().toLocaleString(),
              location: location,
            };

            const allComments = [...comments, newComment];

            update(threadRef, {
              comments: allComments,
            });

            setCommentInput("");
            setComments(allComments);
          });
      },
      // If user blocks location access
      () => {
        const threadRef = databaseRef(database, `${THREADS_DB_KEY}/${id}`);
        const cleanedComment = filter.isProfane(commentInput)
          ? filter.clean(commentInput)
          : commentInput;

        const newComment = {
          displayName: displayName,
          comment: cleanedComment,
          date: new Date().toLocaleString(),
          location: "Earth",
        };

        const allComments = [...comments, newComment];

        update(threadRef, {
          comments: allComments,
        });

        setCommentInput("");
        setComments(allComments);
      }
    );
  };

  const insertEmoji = (emojiData) => {
    setSelectedEmoji(emojiData.unified);
    const commentInputRef = textareaRef.current;

    if (commentInputRef) {
      const startPos = commentInputRef.selectionStart;
      const endPos = commentInputRef.selectionEnd;
      const commentValue = commentInputRef.value;
      const emoji = String.fromCodePoint(parseInt(emojiData.unified, 16));
      const updatedValue =
        commentValue.substring(0, startPos) +
        emoji +
        commentValue.substring(endPos);

      setCommentInput(updatedValue);
      commentInputRef.focus();
      commentInputRef.setSelectionRange(startPos + 2, startPos + 2);
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  return (
    <div>
      <ScrollToTop color="blue" width="15" height="15" />

      {post.key && (
        <Card>
          {post.val.url && post.val.fileType === "image" ? (
            <Card.Img
              variant="top"
              src={post.val.url}
              alt={post.val.title}
              className="thread-img"
            />
          ) : post.val.url && post.val.fileType === "video" ? (
            <video autoPlay controls className="post-video">
              <source src={post.val.url} />
            </video>
          ) : (
            <Card.Img
              variant="top"
              src={NoImage}
              alt={post.val.title}
              className="thread-img"
            />
          )}

          <Card.Body>
            <Card.Title>{post.val.title}</Card.Title>
            <Card.Text>{post.val.description}</Card.Text>
            <Card.Text>
              <strong>{post.val.displayName} </strong>- {post.val.date} -{" "}
              {post.val.location}
            </Card.Text>
            <Button variant="white" onClick={() => handleLikes(post.key)}>
              ❤️{post.val.likeCount}
            </Button>
            <hr />

            <Form onSubmit={writeData}>
              <Form.Group className="mb-3">
                <Form.Label>Comments</Form.Label>
                {/**Use comments state rather than post.val.comments so the comments will render immediately upon submission as Firebase will not return the data immediately due to its async nature */}
                {comments &&
                  comments.length > 0 &&
                  comments.map((comment) => (
                    <div key={comment.date}>
                      <Card.Text> {comment.comment}</Card.Text>
                      <Card.Text>
                        <strong>{comment.displayName} </strong>- {comment.date}-{" "}
                        {comment.location}
                      </Card.Text>
                    </div>
                  ))}

                <div className="position-relative">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Add comment"
                    value={commentInput}
                    onChange={({ target }) => setCommentInput(target.value)}
                    ref={textareaRef}
                  />

                  {showEmojiPicker && (
                    <EmojiPicker
                      onEmojiClick={insertEmoji}
                      emojiStyle={EmojiStyle.FACEBOOK}
                    />
                  )}

                  <Button
                    variant="light"
                    className="position-absolute top-0 end-0 me-2 mt-2"
                    onClick={toggleEmojiPicker}
                  >
                    😃
                  </Button>
                </div>
                <br />

                <Button variant="danger" type="submit">
                  Post Comment
                </Button>
              </Form.Group>
            </Form>

            <Button onClick={() => navigate(-1)}>Back</Button>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
