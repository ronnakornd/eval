import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import ReactPaginate from 'react-paginate';

const ActiveClass = () => {
  const [classes, setClasses] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(5); // Adjust the number of items per page as needed

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

  // Pagination logic
  const startIndex = currentPage * itemsPerPage;
  const selectedClasses = classes.slice(startIndex, startIndex + itemsPerPage);
  const pageCount = Math.ceil(classes.length / itemsPerPage);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  return (
    <div>
      <table className="table w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Created At</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {selectedClasses.map((cls) => (
            <tr key={cls.id}>
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
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination Controls */}
      <ReactPaginate
        previousLabel={'Previous'}
        nextLabel={'Next'}
        breakLabel={'...'}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={'pagination'}
        activeClassName={'active'}
        pageClassName={'page-item'}
        pageLinkClassName={'page-link'}
        previousClassName={'page-item'}
        previousLinkClassName={'page-link'}
        nextClassName={'page-item'}
        nextLinkClassName={'page-link'}
        breakClassName={'page-item'}
        breakLinkClassName={'page-link'}
      />
    </div>
  );
};

export default ActiveClass;
