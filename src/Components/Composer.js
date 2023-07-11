import React, { useContext, useState } from "react";
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
import { UserContext } from "../App";
import "../App.css";
import { faEnvelope, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Composer() {
  const user = useContext(UserContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileInputFile, setFileInputFile] = useState(null);
  const [fileInputValue, setFileInputValue] = useState("");
  const [fileType, setFileType] = useState("");

  const determineFileType = (file) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "avif"];
    const videoExtensions = ["mp4", "mov", "mkv"];
    // Split the file name by dot to an array containing the file base name & the extension -> get the extension at the back by pop() -> convert the extension to lowercase to check against with the array of file extensions defined above in lowercase
    const extension = file.name.split(".").pop().toLowerCase();
    console.log("extension", extension);

    if (imageExtensions.includes(extension)) {
      return "image";
    } else if (videoExtensions.includes(extension)) {
      return "video";
    }

    // Read the file using FileReader and check the file signature
    const reader = new FileReader();

    // Initiate the asynchronous reading of the file data. It reads the first four bytes of the file.
    reader.readAsArrayBuffer(file.slice(0, 4));

    // When file read is complete
    reader.onloadend = () => {
      // Reader.result is an ArrayBuffer object which contains the file data that has been read. It is converted to a Uint8Array to access individual bytes. The subarray(0, 4) method is used to extract the first four elements (bytes) from the Uint8Array.
      const arr = new Uint8Array(reader.result).subarray(0, 4);

      // To store the hexadecimal representation of the bytes
      let header = "";
      // To iterate over arr, which contains the first four bytes of the file. The toString(16) method converts each byte to its hexadecimal representation
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }
      // Identify file type by checking file signature
      if (header.startsWith("ffd8")) {
        return "image"; // JPEG file signature
      } else if (header.startsWith("89504e47")) {
        return "image"; // PNG file signature
      } else if (header.startsWith("47494638")) {
        return "image"; // GIF file signature
      } else if (header.startsWith("52494646") && header.endsWith("57454250")) {
        return "image"; // WebP file signature
      } else if (header.startsWith("000000206674797033677035")) {
        return "image"; // AVIF file signature
      } else if (header.startsWith("66747970")) {
        return "video"; // MP4 file signature
      } else if (header.startsWith("00000018") && header.includes("6d6f6f76")) {
        return "video"; // QuickTime (MOV) file signature
      } else if (header.startsWith("1a45dfa3")) {
        return "video"; // MKV file signature
      }
      return "unknown";
    };
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

  const writeData = (url, location, fileRef) => {
    const threadsRef = databaseRef(database, THREADS_DB_KEY);
    const postRef = push(threadsRef);
    // Initialize likes object with initial value of false while the key dynamically represents the current logged in user
    const likes = {
      [user.uid]: false,
    };

    set(postRef, {
      timeStamp: Date.now(),
      displayName: user.displayName,
      title: title,
      description: description,
      url: url,
      likes: likes,
      location: location,
      fileType: fileType ? fileType : "Unsupported format",
      fileRef: String(fileRef),
      email: user.email,
    });

    clearInputFields();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
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
                  getDownloadURL(fileRef).then((url) =>
                    writeData(url, location, fileRef)
                  );
                });
              } else {
                writeData(null, location, "");
              }
            })
            .then(() => navigate("/threads"));
        },
        // If user blocks location access
        () => {
          const uniqueFileName = fileInputFile.name + uuidv4();
          const fileRef = storageRef(
            storage,
            `${STORAGE_KEY}${uniqueFileName}`
          );
          if (fileInputFile && fileType) {
            uploadBytes(fileRef, fileInputFile)
              .then(() => {
                getDownloadURL(fileRef).then((url) =>
                  writeData(url, "Earth", fileRef)
                );
              })
              .then(() => navigate("/threads"));
          } else {
            writeData(null, "Earth", "");
            navigate("/threads");
          }
        }
      );
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
            minLength={3}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fs-5">
            Optional: <br />
            Accepts <strong> ONE image </strong>(jpg, jpeg, png, gif, webp,
            avif) OR <br />
            <strong> ONE </strong>video (mp4, mov, mkv)
          </Form.Label>
          <Form.Control
            type="file"
            value={fileInputValue}
            onChange={handleFileChange}
          />
        </Form.Group>

        <Button variant="danger" type="submit">
          <FontAwesomeIcon
            icon={faEnvelope}
            style={{ marginRight: "0.5rem" }}
          />
          Post
        </Button>
        <br />

        <Button onClick={() => navigate(-1)}>
          <FontAwesomeIcon
            icon={faArrowLeft}
            style={{ marginRight: "0.5rem" }}
          />
          Back
        </Button>
      </Form>
    </div>
  );
}
