import React, { useState,useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../FirebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useOutletContext } from 'react-router-dom';

function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [user,setUser] = useOutletContext();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Logged in successfully');
    } catch (error) {
      console.error('Error logging in:', error);
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      alert(error.message);
    }
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Upload profile image to Firebase Storage
      let profileImageUrl = '';
      if (profileImage) {
        const storage = getStorage();
        const storageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(storageRef, profileImage);
        profileImageUrl = await getDownloadURL(storageRef);
      }

      // Add additional fields to Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: name,
        role: role,
        profileImageUrl: profileImageUrl,
        createdAt: new Date()
      });

      alert('Registered successfully');
    } catch (error) {
      console.error('Error registering:', error);
      alert(error.message);
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  useEffect(() => {
       if(user){
           window.location.href = '/dashboard';
       }
   }, [user]);

  return (
    <div className="container mx-auto px-20 pt-40 pb-20 min-h-screen text-slate-900">
      <div className="mb-16 flex flex-col justify-center items-center">
        <h1 className="text-6xl font-opunbold text-sky-800">ระบบประเมินนักศึกษาแพทย์</h1>
        <h2 className='text-4xl text-red-600'>สาขาวิชาเวชศาสตร์ฉุกเฉิน</h2>
        <h3 className='text-2xl text-slate-600'>คณะแพทยศาสตร์ มหาวิทยาลัยขอนแก่น</h3>
      </div>
      <div className='md:px-60'>
      <h1 className="text-xl font-bold mb-4">
        {isRegistering ? "ลงทะเบียน" : "เข้าสู่ระบบ"}
      </h1>
      {isRegistering && (
        <>
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
              required
            />

          </div>
        </>
      )}
      <div className="form-control mb-4">
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          id="email"
          className="input input-bordered"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-control mb-4">
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          type="password"
          id="password"
          className="input input-bordered"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="md:px-28">
        <div className="form-control mb-4">
          {isRegistering ? (
            <button className="btn btn-primary" onClick={handleRegister}>
              Register
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleLogin}>
              Login
            </button>
          )}
        </div>
        {user && (
          <div className="form-control mb-4">
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
        <div className="form-control mb-4">
          <button
            className="btn btn-ghost text-blue-700"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? "เข้าสู่ระบบ" : "ลงทะเบียน"}
          </button>
        </div>
      </div>
      </div>

    </div>
  );
}

export default Home;