import React from "react";

function Breadcrumbs({links}) {
  return (
    <div className="breadcrumbs text-sm">
        <ul>
            {links.map((link, index) => (
            <li key={index}>
                <a href={link.value}>{link.label}</a>
            </li>
            ))}
        </ul>
    </div>
  );
}

export default Breadcrumbs;
