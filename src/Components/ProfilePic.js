import React, { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import { Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import { updateProfile, reload } from "firebase/auth";
import { auth, storage } from "../firebase";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";


//By using URL.createObjectURL,  create a temporary URL that represents the selected image file and assign it to previewURL. This allows  display a preview of the image before uploading it to the server.
export function ProfilePic() {
  const currentUser = auth;
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [photoURL, setPhotoURL] = useState(
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKaiKiPcLJj7ufrj6M2KaPwyCT4lDSFA5oog&usqp=CAU"
  );
  const [previewURL, setPreviewURL] = useState(null);
//setPreviewURL(URL.createObjectURL(e.target.files[0])) sets the previewURL state variable with the generated temporary URL. This allows the component to display a preview of the selected image file.In summary, the handleImageChange function updates the photo state with the selected file and generates a preview URL using URL.createObjectURL. This enables  preview the selected image before uploading it.

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0]);
      setPreviewURL(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleClick = () => {
    const imageRef = storageRef(storage, "image");
    uploadBytes(imageRef, photo)
      .then(() => {
        getDownloadURL(imageRef)
          .then((photoURL) => {
            setPhotoURL(photoURL);
            updateProfile(auth.currentUser, { photoURL: photoURL });
            reload(auth.currentUser, { photoURL: photoURL });
            if (photoURL != null) {
              navigate("/threads");
            }
          })
          .catch((error) => {
            console.log("Error in getting the image URL");
          });
        setPhoto(null);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  // updating the photoURL state variable whenever the currentUser or its photoURL property changes.
  useEffect(() => {
    if (currentUser?.photoURL) {
      setPhotoURL(currentUser.photoURL);
    }
  }, [currentUser]);

  return (
    <>
      <Container
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="w-100" style={{ maxWidth: "400px" }}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Upload Profile Picture </h2>
              {/*If preview URL is true, render the preview URL else render PhotoURL  */}
              {previewURL ? (
                <img src={previewURL} alt="Avatar Preview" className="avatar" />
              ) : (
                <img src={photoURL} alt="Avatar" className="avatar" />
              )}

              <input
                className="fs-6"
                type="file"
                onChange={handleImageChange}
              />
              <Button
                onClick={() => {
                  handleClick();
                }}
              >
                upload
              </Button>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
}

export default ProfilePic;
