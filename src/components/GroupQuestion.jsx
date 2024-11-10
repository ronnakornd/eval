import React, { useState } from 'react'
import {
    collection,
    getDocs,
    orderBy,
    query,
    where,
    doc,
    getDoc
} from 'firebase/firestore'

function GroupQuestion({ questionId, onSave, setting}) {
  
  return (
    <div className="bg-white p-4 rounded-lg  space-y-4">
        <label htmlFor="groupQuestion" className="label">
            กลุ่ม
        </label>
        <input
            id="groupQuestion"
            type="text"
            className="input input-bordered w-full"
            placeholder="Enter group question"
        />
    </div>
  )
}

export default GroupQuestion