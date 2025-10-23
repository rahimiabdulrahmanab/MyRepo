import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Papa from "papaparse";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Carousel, Spinner, Badge, Table, ProgressBar } from "react-bootstrap";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const clinicIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/rahimiabdulrahmanab/Clinics-Dashboard/main/Marker.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -30],
});

const csvUrl =
  "https://raw.githubusercontent.com/rahimiabdulrahmanab/Clinics-Dashboard/main/Afghanistan%20Clinics.csv";

export default function ClinicDetail() {
  const { id } = useParams();
  const [clinic, setClinic] = useState(null);

  // ✅ Load clinic data
  useEffect(() => {
    Papa.parse(csvUrl, {
      download: true,
      header: true,
      complete: (result) => {
        const rows = result.data;
        const found = rows.find(
          (c, i) => String(c.FacilityID) === id || String(i) === id
        );
        setClinic(found);
      },
    });
  }, [id]);

  // ✅ Memoized static chart data (never changes)
  const barData = useMemo(
    () => ({
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Patients Served",
          data: [100, 150, 220, 180, 240, 300],
          backgroundColor: "#1CABE2",
          borderRadius: 4,
        },
      ],
    }),
    []
  );

  const barOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false, // ✅ stops re-animation each render
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
          barThickness: 20,
        },
        y: {
          beginAtZero: true,
          max: 300,
          grid: { color: "#e0e0e0" },
          ticks: { stepSize: 50, font: { size: 10 } },
        },
      },
      plugins: { legend: { display: false } },
    }),
    []
  );

  const pieData = useMemo(
    () => ({
      labels: ["Maternal Care", "Nutrition", "Vaccination", "Emergency"],
      datasets: [
        {
          data: [35, 25, 20, 20],
          backgroundColor: ["#1CABE2", "#4CAF50", "#FFB300", "#E53935"],
        },
      ],
    }),
    []
  );

  const lineData = useMemo(
    () => ({
      labels: ["2020", "2021", "2022", "2023", "2024"],
      datasets: [
        {
          label: "Annual Visits",
          data: [500, 650, 720, 800, 950],
          fill: false,
          borderColor: "#1976D2",
          tension: 0.3,
        },
      ],
    }),
    []
  );

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      animation: false, // ✅ prevents continuous re-render animation
      plugins: { legend: { position: "bottom" } },
    }),
    []
  );

  if (!clinic) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading clinic details...</p>
      </div>
    );
  }

  const lat = parseFloat(clinic.Latitude) || 34.5;
  const lon = parseFloat(clinic.Longitude) || 69.2;
  const condition = clinic["Building Condition"] || "Operational";
  const statusColor =
    condition === "Damaged"
      ? "danger"
      : condition === "Under Repair"
      ? "warning"
      : "success";

  return (
    <div className="container-fluid py-4 px-4">
      <Link to="/" className="btn btn-outline-primary mb-3">
        ← Back to Dashboard
      </Link>

      {/* HEADER */}
      <div
        className="p-4 mb-4 text-white rounded shadow"
        style={{
          background: "linear-gradient(to right, #1976D2, #42A5F5, #64B5F6)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h2 className="mb-1">{clinic["Facility Name (DHIS2)"]}</h2>
            <p className="mb-0">
              {clinic["District Name"]}, {clinic["Province Name"]}
            </p>
          </div>
          <div>
            <Badge bg={statusColor} className="fs-6 me-2">
              {condition}
            </Badge>
            <Badge bg="info" className="fs-6">
              Level: District
            </Badge>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* LEFT COLUMN */}
        <div className="col-lg-7">
          <Carousel className="mb-4 shadow-sm rounded overflow-hidden">
            {[
              "https://raw.githubusercontent.com/rahimiabdulrahmanab/Clinics-Dashboard/main/333.webp",
              "https://raw.githubusercontent.com/rahimiabdulrahmanab/Clinics-Dashboard/main/22.webp",
              "https://raw.githubusercontent.com/rahimiabdulrahmanab/Clinics-Dashboard/main/1.webp",
            ].map((img, i) => (
              <Carousel.Item key={i}>
                <img
                  src={img}
                  className="d-block w-100"
                  alt={`Clinic ${i}`}
                  style={{ height: "350px", objectFit: "cover" }}
                />
              </Carousel.Item>
            ))}
          </Carousel>

          {/* Clinic Info */}
          <div className="bg-light p-4 rounded shadow-sm mb-4">
            <h5 className="text-primary mb-3">🏥 Clinic Information</h5>
            <Table borderless responsive className="mb-0">
              <tbody>
                <tr>
                  <td>
                    <strong>Facility ID</strong>
                  </td>
                  <td>{clinic.FacilityID || "AF12345"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Facility Type</strong>
                  </td>
                  <td>{clinic["Facility Type"] || "Basic Health Center"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Accessibility</strong>
                  </td>
                  <td>{clinic["Accessibility"] || "Hard-to-Reach"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Staff Count</strong>
                  </td>
                  <td>25 (Doctors: 6, Nurses: 12, Midwives: 7)</td>
                </tr>
                <tr>
                  <td>
                    <strong>Electricity</strong>
                  </td>
                  <td>✅ Solar + Generator</td>
                </tr>
                <tr>
                  <td>
                    <strong>Water Source</strong>
                  </td>
                  <td>✅ Borehole (Safe)</td>
                </tr>
                <tr>
                  <td>
                    <strong>Last Renovated</strong>
                  </td>
                  <td>2023</td>
                </tr>
              </tbody>
            </Table>
          </div>

          {/* Resources */}
          <div className="bg-white p-4 rounded shadow-sm mb-4">
            <h5 className="text-primary mb-3">⚙️ Infrastructure & Resources</h5>
            <p>Power Availability</p>
            <ProgressBar
              now={85}
              label="85%"
              variant="success"
              className="mb-3"
            />
            <p>Water Supply</p>
            <ProgressBar now={70} label="70%" variant="info" className="mb-3" />
            <p>Medicine Stock</p>
            <ProgressBar now={50} label="50%" variant="warning" />
          </div>

          {/* Contact */}
          <div className="bg-light p-4 rounded shadow-sm">
            <h5 className="text-primary mb-3">📞 Contact Information</h5>
            <p>
              <strong>In-Charge:</strong> Dr. Ahmad Shah
            </p>
            <p>
              <strong>Phone:</strong> +93 700 123 456
            </p>
            <p>
              <strong>Email:</strong> clinic.logar@health.af
            </p>
            <p>
              <strong>Last Updated:</strong> June 2024
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-lg-5">
          {/* Map */}
          <div className="shadow-sm rounded mb-4" style={{ height: "320px" }}>
            <MapContainer
              center={[lat, lon]}
              zoom={13}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />
              <Marker position={[lat, lon]} icon={clinicIcon}>
                <Popup>
                  {clinic["Facility Name (DHIS2)"]}
                  <br />
                  {clinic["District Name"]}, {clinic["Province Name"]}
                </Popup>
              </Marker>
              <Circle
                center={[lat, lon]}
                radius={5000}
                pathOptions={{ color: "#42A5F5", fillOpacity: 0.1 }}
              />
            </MapContainer>
          </div>

          {/* Charts */}
          <div className="bg-white p-3 shadow-sm rounded mb-4">
            <h5 className="text-primary mb-3">📊 Monthly Workload</h5>
            <div style={{ height: "180px" }}>
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          <div className="bg-white p-3 shadow-sm rounded mb-4">
            <h5 className="text-primary mb-3">🧩 Service Distribution</h5>
            <Pie
              data={pieData}
              options={{
                responsive: true,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>

          <div className="bg-white p-3 shadow-sm rounded">
            <h5 className="text-primary mb-3">📈 Yearly Trends</h5>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center mt-5">
        <button
          onClick={() => window.print()}
          className="btn btn-outline-secondary me-2"
        >
          📄 Download Report (PDF)
        </button>
        <Link to="/" className="btn btn-primary">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
