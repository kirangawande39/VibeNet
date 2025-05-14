import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Spinner = ({ size = "md", text = "Loading..." }) => {
  const sizeClass = size === "sm" ? "spinner-border-sm" : size === "lg" ? "spinner-border-lg" : "";

  return (
    <div className="d-flex flex-column align-items-center justify-content-center my-3">
      <div className={`spinner-border text-primary ${sizeClass}`} role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      {text && <div className="mt-2 text-muted">{text}</div>}
    </div>
  );
};

export default Spinner;
