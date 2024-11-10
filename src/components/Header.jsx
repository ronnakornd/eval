import React from "react";

function Header({ logout, user }) {
  return (
    <div className="w-full h-14 bg-blue-900 flex justify-between items-center px-5">
      <a href="/">
      <img src="/favicon.ico" alt="" className="w-10 h-10 invert"  />
      </a>
      {user && (
        <div className="flex items-center justify-center gap-2">
          <div className="drawer drawer-end">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
              {/* Page content here */}
              <label htmlFor="my-drawer-4" className="text-white">
                <div className="flex justify-center items-center gap-3">
                {user.profileImageUrl && (
                <img className="w-8 h-8 rounded-full bg-slate-300" src={user.profileImageUrl} alt="" />
                )}
                <span className="text-lg">{user.name}</span>
                </div>
              </label>
            </div>
            <div className="drawer-side z-30">
              <label
                htmlFor="my-drawer-4"
                aria-label="close sidebar"
                className="drawer-overlay"
              ></label>
              <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
                {/* Sidebar content here */}
                <li>
                  <a className="" >Edit Profile</a>
                </li>
                <li>
                  <button className="btn btn-error" onClick={logout}>logout</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;
