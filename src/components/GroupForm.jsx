import React from "react";

const GroupForm = ({ groupName, setGroupName, handleCreateGroup }) => {
  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        className="input bg-white input-bordered w-full"
        placeholder="New Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <button className="btn btn-primary" onClick={handleCreateGroup}>
        Create Group
      </button>
    </div>
  );
};

export default GroupForm;
