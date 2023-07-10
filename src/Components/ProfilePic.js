import React, {useEffect, useState} from 'react'
import Container from "react-bootstrap/Container";
import { Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Components/ProfilePic.css"
import { updateProfile } from "firebase/auth";
import { auth,storage} from "../firebase";
import {
  ref as storageRef,
  
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

 export function ProfilePic() {
   const [photo, setPhoto] = useState(null);
   const [photoURL, setPhotoURL] = useState(
     "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKaiKiPcLJj7ufrj6M2KaPwyCT4lDSFA5oog&usqp=CAU"
   );

   const handleImageChange = (e) => {
     if (e.target.files[0]) {
       setPhoto(e.target.files[0]);
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
               <img src={photoURL} alt="Avatar" className="avatar" />

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
