import React, { useState,useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../FirebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useOutletContext } from 'react-router-dom';

function Profile() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [profileImageToUpload, setProfileImageToUpload] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [user,setUser] = useOutletContext();
  const [studentToEdit, setStudentToEdit] = useState(null);

 
  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const updateProfilePic = async () => {
    if (profileImageToUpload) {
      if(studentToEdit.profileImageUrl){
        const oldImageRef = ref(getStorage(), studentToEdit.profileImageUrl);
        await deleteObject(oldImageRef);
      }     
      const storageRef = ref(getStorage(), `profileImages/${studentToEdit.id}`);
      await uploadBytes(storageRef, profileImageToUpload);
      const profileImageUrl = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "users", studentToEdit.id), {
        profileImageUrl,
      });
      setProfileImageToUpload(null);
      setProfileImagePreview(null);
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImageToUpload(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const fetchUserData = async () => {
    const userDoc = doc(db, "users", user.id);
    const userSnap = await getDoc(userDoc);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      setStudentToEdit({id: userSnap.id, ...userData});
      setEmail(userData.email);
      setName(userData.name);
      setProfileImagePreview(userData.profileImageUrl);
    } else {
      console.log("No such document!");
    }
  }

  const updateUser = async () => {
    const userDoc = doc(db, "users", user.id);
    await updateDoc(userDoc, {
      name
    });
    await updateProfilePic();
    alert('Profile Updated Successfully');
    fetchUserData();
  }
  
  useEffect(() => {
    fetchUserData();
  }
  , [user]);


  return (
    <div className="container md:mx-auto md:px-20 pt-10 px-4 md:pt-40 pb-20 min-h-screen text-slate-900">
        <div className='flex flex-col justify-center'>
          <div className="form-control mb-4">
            <div className="flex justify-center">
            {profileImagePreview && (
              <img src={profileImagePreview} alt="Profile Preview" className="mt-4 w-64 h-64 object-cover rounded-full" />
            )}
            </div>
            <div className="form-control mb-4">
            <label className="label" htmlFor="profileImage">
              Profile Image
            </label>
            <input
              type="file"
              id="profileImage"
              className="input input-bordered"
              onChange={handleProfileImageChange}
              required
            />
          </div>
            <label className="label" htmlFor="username">
              Name
            </label>
            <input
              type="text"
              id="username"
              className="input input-bordered"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>    
           <button className='btn btn-neutral ' onClick={updateUser}>
            Update Profile
           </button>
        </div>
    </div>
  );
}

export default Profile;