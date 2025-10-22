import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function BottomSection() {
  return (
    <div
      className="container-fluid"
      style={{
        backgroundColor: "#1CABE2",
        color: "white",
        position: "relative",
        overflow: "hidden", // keeps contours inside
      }}
    >
      {/* Contour overlay - covers whole section */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,100 C100,300 300,-100 400,100' stroke='white' stroke-width='5' fill='none' opacity='0.9'/%3E%3Cpath d='M0,200 C100,400 300,0 400,200' stroke='white' stroke-width='5' fill='none' opacity='0.7'/%3E%3Cpath d='M0,300 C100,500 300,100 400,300' stroke='white' stroke-width='5' fill='none' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "400px 400px",
        }}
      ></div>

      {/* Summary Cards */}
      <div
        className="row text-center p-4"
        style={{ position: "relative", zIndex: 1 }} // keep above contour
      >
        <div className="col-md-3 mb-3">
          <div
            className="card shadow-sm"
            style={{ backgroundColor: "white", color: "#1CABE2" }}
          >
            <div className="card-body">
              <h5 className="card-title">Total Clinics</h5>
              <p className="card-text display-6">4,200</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div
            className="card shadow-sm"
            style={{ backgroundColor: "white", color: "#1CABE2" }}
          >
            <div className="card-body">
              <h5 className="card-title">Hospitals</h5>
              <p className="card-text display-6">350</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div
            className="card shadow-sm"
            style={{ backgroundColor: "white", color: "#1CABE2" }}
          >
            <div className="card-body">
              <h5 className="card-title">Clinics w/ Clean Water</h5>
              <p className="card-text display-6">2,900</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div
            className="card shadow-sm"
            style={{ backgroundColor: "white", color: "#1CABE2" }}
          >
            <div className="card-body">
              <h5 className="card-title">Supported by Donors</h5>
              <p className="card-text display-6">3,100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="row"
        style={{ position: "relative", zIndex: 1 }} // keep footer above contour
      >
        <div className="col text-center">
          <p className="mt-3" style={{ fontSize: "14px", opacity: "0.9" }}>
            UNICEF Afghanistan © {new Date().getFullYear()} | Contact:
            info@unicef.org
          </p>
        </div>
      </div>
    </div>
  );
}
