import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../FirebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useOutletContext } from 'react-router-dom';

function ProfileUpdate() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [user, setUser] = useOutletContext();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setEmail(userData.email);
          setName(userData.name);
          setRole(userData.role);
          setProfileImagePreview(userData.profileImageUrl);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleUpdateProfile = async () => {
    try {
      let profileImageUrl = profileImagePreview;

      // Upload new profile image to Firebase Storage if a new image is selected
      if (profileImage) {
        const storage = getStorage();
        const storageRef = ref(storage, `profileImages/${user.uid}`);

        // Delete the old profile image if it exists
        if (profileImagePreview) {
          const oldImageRef = ref(storage, profileImagePreview);
          await deleteObject(oldImageRef);
        }

        await uploadBytes(storageRef, profileImage);
        profileImageUrl = await getDownloadURL(storageRef);
      }

      // Update user data in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        name: name,
        role: role,
        profileImageUrl: profileImageUrl,
        updatedAt: new Date()
      });

      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.message);
    }
  };

  return (
    <div className="container md:mx-auto md:px-20 pt-10 px-4 md:pt-40 pb-20 min-h-screen text-slate-900">
      <div className="mb-16 flex flex-col justify-center items-center">
        <h1 className="text-3xl md:text-6xl font-opunbold text-sky-800">Update Profile</h1>
      </div>
      <div className='md:px-60'>
        <div className="form-control mb-4">
          <div className="flex justify-center">
            {profileImagePreview && (
              <img src={profileImagePreview} alt="Profile Preview" className="mt-4 w-64 h-64 object-cover rounded-full" />
            )}
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
        <div className="form-control mb-4">
          <label className="label" htmlFor="role">
            Role
          </label>
          <select
            id="role"
            className="select select-bordered"
            value={role}
            onChange={handleRoleChange}
            required
          >
            <option value="" disabled>Select Role</option>
            <option value="instructor">ผู้สอน</option>
            <option value="student">ผู้เรียน</option>
          </select>
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
          />
        </div>
        <div className="form-control mb-4">
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="input input-bordered"
            value={email}
            disabled
          />
        </div>
        <div className="md:px-28">
          <div className="form-control mb-4">
            <button className="btn btn-primary" onClick={handleUpdateProfile}>
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileUpdate;