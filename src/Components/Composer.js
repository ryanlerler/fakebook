import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { ref as databaseRef, push, set } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { database, storage } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import { THREADS_DB_KEY, STORAGE_KEY } from "../constants";

export default function Composer({ displayName, loggedInUser }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileInputFile, setFileInputFile] = useState(null);
  const [fileInputValue, setFileInputValue] = useState("");

  const handleFileChange = ({ target }) => {
    const { files, value } = target;
    setFileInputFile(files[0]);
    setFileInputValue(value);
  };

  const clearInputFields = () => {
    setTitle("");
    setDescription("");
    setFileInputFile(null);
    setFileInputValue("");
  };

  const writeData = (url) => {
    const threadsRef = databaseRef(database, THREADS_DB_KEY);
    const postRef = push(threadsRef);
    // Initialize likes object with initial value of false while the key dynamically represents the current logged in user
    const likes = {
      [loggedInUser]: false,
    };

    set(postRef, {
      date: new Date().toLocaleString(),
      // displayName: displayName,
      title: title,
      description: description,
      url: url,
      likes: likes,
    });

    clearInputFields();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e);

    if (fileInputFile) {
      const uniqueFileName = fileInputFile.name + uuidv4();
      const fileRef = storageRef(storage, `${STORAGE_KEY}${uniqueFileName}`);

      uploadBytes(fileRef, fileInputFile).then(() => {
        getDownloadURL(fileRef).then((url) => writeData(url));
      });
    } else {
      writeData(null);
    }
  };

  return (
    <div>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Add A Title"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
            required
            minLength={3}
            maxLength={64}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Add A Description"
            value={description}
            onChange={({ target }) => setDescription(target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Optional</Form.Label>
          <Form.Control
            type="file"
            multiple
            value={fileInputValue}
            onChange={handleFileChange}
          />
        </Form.Group>

        <Button variant="danger" type="submit">
          POST
        </Button>
      </Form>
    </div>
  );
}
