import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import ReactPaginate from 'react-paginate';

const ActiveClass = () => {
  const [classes, setClasses] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5);
  const [classToDelete, setClassToDelete] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      const q = query(collection(db, 'classes'), where('active', '==', true));
      const querySnapshot = await getDocs(q);
      const fetchedClasses = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setClasses(fetchedClasses);
    };

    fetchClasses();
  }, []);

  const handleStatusToggle = async (id, currentStatus) => {
    const classRef = doc(db, 'classes', id);
    await updateDoc(classRef, { active: !currentStatus });
    setClasses(classes.map(c => c.id === id ? { ...c, active: !currentStatus } : c));
  };

  const handleDeleteClass = async () => {
    if (classToDelete) {
      try {
        await deleteDoc(doc(db, 'classes', classToDelete));
        setClasses(classes.filter(c => c.id !== classToDelete));
        setClassToDelete(null);
        window.deleteClassModal.close();
      } catch (error) {
        console.error('Error deleting class: ', error);
      }
    }
  };

  const startIndex = currentPage * itemsPerPage;
  const selectedClasses = classes.slice(startIndex, startIndex + itemsPerPage);
  const pageCount = Math.ceil(classes.length / itemsPerPage);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  return (
    <div className='overflow-x-auto'>
      <table className="table table-zebra-zebra">
        <thead>
          <tr>
            <th>Name</th>
            <th>Created At</th>
            <th>Active</th>
            <th className='flex justify-center items-center'>Delete</th>
          </tr>
        </thead>
        <tbody>
          {selectedClasses.map((cls) => (
            <tr key={cls.id} className='hover cursor-pointer'>
              <td>{cls.name}</td>
              <td>{cls.createdAt?.toDate().toLocaleString()}</td>
              <td>
                <label className="cursor-pointer">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={cls.active}
                    onChange={() => handleStatusToggle(cls.id, cls.active)}
                  />
                </label>
              </td>
              <td className='flex justify-center items-center'>
                <button
                  className="btn btn-error"
                  onClick={() => {
                    setClassToDelete(cls.id);
                    window.deleteClassModal.showModal();
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination Controls */}
      <div className="flex justify-center my-4">
        <ReactPaginate
          previousLabel={'<'}
          nextLabel={'>'}
          breakLabel={'...'}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          containerClassName={'flex space-x-2'}
          pageClassName={'btn btn-sm'}
          pageLinkClassName={''}
          previousClassName={'btn btn-sm'}
          previousLinkClassName={''}
          nextClassName={'btn btn-sm'}
          nextLinkClassName={''}
          breakClassName={'btn btn-sm'}
          activeClassName={'btn-primary'}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <dialog id="deleteClassModal" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">Confirm Delete</h3>
          <p>Are you sure you want to delete this class?</p>
          <div className="modal-action">
            <button className="btn" onClick={handleDeleteClass}>Yes, Delete</button>
            <button className="btn" onClick={() => setClassToDelete(null)}>Cancel</button>
          </div>
        </form>
      </dialog>
    </div>
  );
};

export default ActiveClass;
