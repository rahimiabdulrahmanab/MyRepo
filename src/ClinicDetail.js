import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Carousel } from "react-bootstrap";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

// Clinic marker icon
const clinicIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/rahimiabdulrahmanab/Clinics-Dashboard/main/Marker.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -30],
});

// CSV source
const csvUrl =
  "https://raw.githubusercontent.com/rahimiabdulrahmanab/Clinics-Dashboard/main/Afghanistan%20Clinics.csv";

export default function ClinicDetail() {
  const { id } = useParams();
  const [clinic, setClinic] = useState(null);

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

  if (!clinic) {
    return <p className="text-center mt-5">Loading clinic details...</p>;
  }

  const lat = parseFloat(clinic.Latitude);
  const lon = parseFloat(clinic.Longitude);

  // Dummy data for the charts
  const workloadData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Patients Served",
        data: [120, 200, 150, 180, 220, 260],
        backgroundColor: "#1CABE2",
      },
    ],
  };

  const pieData = {
    labels: ["Health", "Nutrition", "Maternal Care", "Emergency"],
    datasets: [
      {
        data: [40, 25, 20, 15],
        backgroundColor: ["#1CABE2", "#4CAF50", "#FFB300", "#E53935"],
      },
    ],
  };

  return (
    <div className="container py-4">
      <Link to="/" className="btn btn-outline-primary mb-3">
        ← Back to Dashboard
      </Link>

      <h2 className="text-primary mb-4">{clinic["Facility Name (DHIS2)"]}</h2>

      {/* 📸 Cover Photo Carousel */}
      <Carousel className="mb-4 shadow-sm rounded overflow-hidden">
        {[
          "https://raw.githubusercontent.com/rahimiabdulrahmanab/Clinics-Dashboard/main/333.webp",
          "https://raw.githubusercontent.com/rahimiabdulrahmanab/Clinics-Dashboard/main/22.webp",
          "https://raw.githubusercontent.com/rahimiabdulrahmanab/Clinics-Dashboard/main/1.webp",
        ].map((img, index) => (
          <Carousel.Item key={index}>
            <img
              src={img}
              className="d-block w-100"
              alt={`Slide ${index}`}
              style={{ height: "400px", objectFit: "cover" }}
            />
          </Carousel.Item>
        ))}
      </Carousel>

      {/* Clinic Info */}
      <div className="mb-4 p-3 bg-light shadow-sm rounded">
        <h5>📍 Location</h5>
        <p>
          <strong>Province:</strong> {clinic["Province Name"]}
        </p>
        <p>
          <strong>District:</strong> {clinic["District Name"]}
        </p>
        <p>
          <strong>Facility Type:</strong> {clinic["Facility Type"]}
        </p>
        <p>
          <strong>Facility ID:</strong> {clinic.FacilityID}
        </p>
      </div>

      {/* Zoomed Map */}
      <div className="mb-4 shadow rounded" style={{ height: "400px" }}>
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
        </MapContainer>
      </div>

      {/* Statistics Section */}
      <div className="row text-center">
        <div className="col-md-6 mb-4">
          <div className="bg-white p-3 shadow-sm rounded">
            <h5>📈 Clinic Workload</h5>
            <Bar
              data={workloadData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="bg-white p-3 shadow-sm rounded">
            <h5>🧩 Service Distribution</h5>
            <Pie
              data={pieData}
              options={{
                responsive: true,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
