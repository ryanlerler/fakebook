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
import { THREADS_DB_KEY, STORAGE_KEY, GOOGLE_MAPS_API_KEY } from "../constants";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Composer({ displayName, loggedInUser }) {
  const navigate = useNavigate("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileInputFile, setFileInputFile] = useState(null);
  const [fileInputValue, setFileInputValue] = useState("");
  const [fileType, setFileType] = useState("");

  const determineFileType = (file) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const videoExtensions = ["mp4", "mov", "mkv"];
    // Split the file name by dot to an array containing the file base name & the extension -> get the extension at the back by pop() -> convert the extension to lowercase to check against with the array of file extensions defined above in lowercase
    const extension = file.name.split(".").pop().toLowerCase();
    console.log("extension", extension);

    if (imageExtensions.includes(extension)) {
      return "image";
    } else if (videoExtensions.includes(extension)) {
      return "video";
    }

    // Read the file using FileReader and check its signature
    const reader = new FileReader();

    reader.onloadend = () => {
      const arr = new Uint8Array(reader.result).subarray(0, 4);
      let header = "";
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }
      if (header.startsWith("ffd8")) {
        return "image"; // JPEG file signature
      } else if (header.startsWith("89504e47")) {
        return "image"; // PNG file signature
      } else if (header.startsWith("47494638")) {
        return "image"; // GIF file signature
      } else if (header.startsWith("52494646") && header.endsWith("57454250")) {
        return "image"; // WebP file signature
      } else if (header.startsWith("66747970")) {
        return "video"; // MP4 file signature
      } else if (header.startsWith("00000018") && header.includes("6d6f6f76")) {
        return "video"; // QuickTime (MOV) file signature
      } else if (header.startsWith("1a45dfa3")) {
        return "video"; // MKV file signature
      }
      return "unknown";
    };
    reader.readAsArrayBuffer(file.slice(0, 4));
  };

  const handleFileChange = ({ target }) => {
    const { files, value } = target;
    const fileType = determineFileType(files[0]);
    console.log(fileType);
    setFileInputFile(files[0]);
    setFileInputValue(value);
    setFileType(fileType);
  };

  const clearInputFields = () => {
    setTitle("");
    setDescription("");
    setFileInputFile(null);
    setFileInputValue("");
  };

  const writeData = (url, location) => {
    const threadsRef = databaseRef(database, THREADS_DB_KEY);
    const postRef = push(threadsRef);
    // Initialize likes object with initial value of false while the key dynamically represents the current logged in user
    const likes = {
      [loggedInUser]: false,
    };

    set(postRef, {
      date: new Date().toLocaleString(),
      displayName: displayName,
      title: title,
      description: description,
      url: url,
      likes: likes,
      location: location,
      fileType: fileType,
    });

    clearInputFields();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e);

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      console.log(latitude, longitude);

      axios
        .get(
          ` https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&result_type=country&key=${GOOGLE_MAPS_API_KEY}`
        )
        .then((data) => {
          const location = data.data.results[0].formatted_address;
          if (fileInputFile) {
            const uniqueFileName = fileInputFile.name + uuidv4();
            const fileRef = storageRef(
              storage,
              `${STORAGE_KEY}${uniqueFileName}`
            );

            uploadBytes(fileRef, fileInputFile).then(() => {
              getDownloadURL(fileRef).then((url) => writeData(url, location));
            });
          } else {
            writeData(null, location);
          }
        })
        .then(() => navigate("/threads"));
    });
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
