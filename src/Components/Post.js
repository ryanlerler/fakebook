import React, { useEffect, useState, useRef, useContext } from "react";
import { database } from "../firebase";
import {
  ref as databaseRef,
  get,
  onChildAdded,
  update,
} from "firebase/database";
import { GOOGLE_MAPS_API_KEY, THREADS_DB_KEY } from "../constants";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import axios from "axios";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import NoImage from "../assets/Screenshot 2023-07-09 001928.png";
import ScrollToTop from "react-scroll-to-top";
import Filter from "bad-words";
import { formatDistance, formatRelative, subDays } from "date-fns";
import {
  faEdit,
  faTrash,
  faCheck,
  faTimes,
  faArrowLeft,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserContext } from "../App";
import "../App.css";

const filter = new Filter();

export default function Post() {
  const user = useContext(UserContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState({});
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const [likes, setLikes] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [updatedPost, setUpdatedPost] = useState({});
  const [editingComment, setEditingComment] = useState(null);

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
    const isLiked = likes[currentThreadKey]?.[user.uid] || false;
    const newLikes = {
      ...likes,
      [currentThreadKey]: {
        ...likes[currentThreadKey],
        [user.uid]: !isLiked,
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

    if (commentInput === "") return;

    if (editingComment) {
      // Update the edited comment
      updateComment();
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          axios
            .get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&result_type=country&key=${GOOGLE_MAPS_API_KEY}`
            )
            .then((data) => {
              const location = data.data.results[0].formatted_address;
              const threadRef = databaseRef(
                database,
                `${THREADS_DB_KEY}/${id}`
              );
              const cleanedComment = filter.isProfane(commentInput)
                ? filter.clean(commentInput)
                : commentInput;

              const newComment = {
                displayName: user.displayName,
                comment: cleanedComment,
                timeStamp: Date.now(),
                location: location,
                email: user.email,
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
            displayName: user.displayName,
            comment: cleanedComment,
            timeStamp: Date.now(),
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
    }
  };

  const insertEmoji = (emojiData) => {
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

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const updatePost = () => {
    const threadRef = databaseRef(database, `${THREADS_DB_KEY}/${id}`);
    const { title, description } = updatedPost;

    update(threadRef, {
      title: title || post.val.title,
      description: description || post.val.description,
    });

    setPost((prevPost) => ({
      ...prevPost,
      val: {
        ...prevPost.val,
        title: title || prevPost.val.title,
        description: description || prevPost.val.description,
      },
    }));

    setEditMode(false);
  };

  const deleteComment = (comment) => {
    const threadRef = databaseRef(database, `${THREADS_DB_KEY}/${id}`);
    const filteredComments = comments.filter(
      (c) => c.timeStamp !== comment.timeStamp
    );
    // Update the comments in the database
    update(threadRef, {
      comments: filteredComments,
    });
    // Update the comments in the state
    setComments(filteredComments);
  };

  const editComment = (comment) => {
    setEditingComment(comment);
    setCommentInput(comment.comment);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setCommentInput("");
  };

  const updateComment = () => {
    const threadRef = databaseRef(database, `${THREADS_DB_KEY}/${id}`);
    const updatedComments = comments.map((comment) => {
      if (comment === editingComment) {
        return {
          ...comment,
          comment: commentInput,
        };
      }
      return comment;
    });

    update(threadRef, {
      comments: updatedComments,
    });

    setEditingComment(null);
    setCommentInput("");
    setComments(updatedComments);
  };

  return (
    <Container>
      <ScrollToTop color="black" width="15" height="15" />

      {post.key && (
        <>
          <Row>
            <Col className="left-column">
              <Card>
                <Card.Text className="fs-2">
                  <strong>{post.val.displayName} </strong>
                </Card.Text>

                {post.val.url && post.val.fileType === "image" ? (
                  <Card.Img
                    variant="top"
                    src={post.val.url}
                    alt={post.val.title}
                    className="post-img"
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
                    className="post-img"
                  />
                )}

                <Card.Body>
                  {editMode ? (
                    <div>
                      <Form.Group className="mb-3">
                        <Form.Control
                          type="text"
                          value={updatedPost.title || post.val.title}
                          onChange={(e) =>
                            setUpdatedPost((prevPost) => ({
                              ...prevPost,
                              title: e.target.value,
                            }))
                          }
                          required
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={
                            updatedPost.description || post.val.description
                          }
                          onChange={(e) =>
                            setUpdatedPost((prevPost) => ({
                              ...prevPost,
                              description: e.target.value,
                            }))
                          }
                        />
                      </Form.Group>
                      <Button variant="primary" onClick={updatePost}>
                        Update
                      </Button>
                      <Button variant="secondary" onClick={toggleEditMode}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Card.Title className="fs-2">{post.val.title}</Card.Title>
                      <Card.Text className="fs-5">
                        {post.val.description}
                      </Card.Text>
                      <Card.Footer className="fs-6">
                        {formatRelative(
                          subDays(post.val.timeStamp, 0),
                          new Date()
                        )}{" "}
                        - {post.val.location}
                      </Card.Footer>
                      <Button
                        variant="white"
                        onClick={() => handleLikes(post.key)}
                      >
                        ❤️{post.val.likeCount || 0}
                      </Button>

                      <br />
                      {user.email === post.val.email && (
                        <Button variant="primary" onClick={toggleEditMode}>
                          <FontAwesomeIcon icon={faEdit} /> Edit
                        </Button>
                      )}
                    </div>
                  )}

                  <Button variant="danger" onClick={() => navigate(-1)}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col className="right-column">
              <Card>
                <Card.Body>
                  <Form onSubmit={writeData}>
                    <Form.Group className="mb-3">
                      {/**Use comments state rather than post.val.comments so the comments will render immediately upon submission as Firebase will not return the data immediately due to its async nature */}
                      {comments && comments.length > 0 ? (
                        comments.map((comment) => (
                          <div key={comment.timeStamp}>
                            <Card.Text className="fs-5 ">
                              <strong>{comment.displayName} </strong>
                            </Card.Text>

                            <Card.Text className="fs-5">
                              {comment.comment}
                            </Card.Text>

                            <Card.Footer className="fs-6">
                              {formatDistance(
                                new Date(comment.timeStamp),
                                new Date(),
                                {
                                  addSuffix: true,
                                }
                              )}
                              - {comment.location}
                            </Card.Footer>

                            {user.email === comment.email && (
                              <>
                                <Button
                                  variant="primary"
                                  onClick={() => editComment(comment)}
                                >
                                  <FontAwesomeIcon icon={faEdit} /> Edit
                                </Button>

                                <Button
                                  variant="danger"
                                  onClick={() => deleteComment(comment)}
                                >
                                  <FontAwesomeIcon icon={faTrash} /> Delete
                                </Button>
                              </>
                            )}
                            <hr />
                          </div>
                        ))
                      ) : (
                        <h2>Be the first to comment</h2>
                      )}

                      <div className="position-relative">
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Add comment"
                          value={commentInput}
                          onChange={({ target }) =>
                            setCommentInput(target.value)
                          }
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
                        {editingComment ? (
                          <>
                            Update Comment {""}
                            <FontAwesomeIcon icon={faCheck} />
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faEnvelope} /> Post Comment
                          </>
                        )}
                      </Button>

                      <Button
                        variant="danger"
                        onClick={() => cancelEditing()}
                        style={{
                          display: editingComment ? "inline-block" : "none",
                        }}
                      >
                        Cancel Edit {""}
                        <FontAwesomeIcon icon={faTimes} />
                      </Button>
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}
