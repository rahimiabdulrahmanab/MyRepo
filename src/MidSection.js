import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import {
  GeoJSON,
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles.css";

import SearchFilters from "./SearchFilters"; // ✅ connected correctly

// Custom icon for clinics
const clinicIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/rahimiabdulrahmanab/Clinics-Dashboard/main/Marker.png",
  iconSize: [40, 40],
  iconAnchor: [10, 20],
  popupAnchor: [0, -20],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [30, 30],
  shadowAnchor: [10, 30],
});

// CSV source
const csvUrl =
  "https://raw.githubusercontent.com/rahimiabdulrahmanab/Clinics-Dashboard/main/Afghanistan%20Clinics.csv";

export default function MidSection() {
  const [allClinics, setAllClinics] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const itemRefs = useRef({});
  const [geojson, setGeojson] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(6);

  const navigate = useNavigate();

  // ✅ Load GeoJSON data
  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/rahimiabdulrahmanab/ShapeFile_Project/main/afg_admin2.geojson"
    )
      .then((res) => res.json())
      .then((data) => setGeojson(data))
      .catch((err) => console.error("Failed to load GeoJSON:", err));
  }, []);

  // ✅ Load CSV data
  useEffect(() => {
    Papa.parse(csvUrl, {
      download: true,
      header: true,
      complete: (result) => {
        let rows = result.data;

        // Remove duplicates
        const seen = new Set();
        rows = rows.filter((clinic) => {
          const name = clinic["Facility Name (DHIS2)"];
          if (!name || seen.has(name)) return false;
          seen.add(name);
          return true;
        });

        // Filter coordinates within Afghanistan
        rows = rows.filter((clinic) => {
          const lat = parseFloat(clinic.Latitude);
          const lon = parseFloat(clinic.Longitude);
          if (isNaN(lat) || isNaN(lon)) return false;
          return lat >= 29.0 && lat <= 39.5 && lon >= 60.5 && lon <= 74.9;
        });

        setAllClinics(rows);
        setClinics(rows);
      },
    });
  }, []);

  // ✅ Auto-scroll to selected clinic
  useEffect(() => {
    if (selectedClinic && itemRefs.current[selectedClinic]) {
      itemRefs.current[selectedClinic].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedClinic]);

  return (
    <div className="container-fluid">
      {/* ✅ Filters connected */}
      <SearchFilters clinics={allClinics} onFilter={setClinics} />

      <div className="row g-0">
        {/* Left Sidebar */}
        <div
          className="col-md-4 bg-light border-end"
          style={{ height: "80vh", overflowY: "scroll" }}
        >
          <h5 className="p-3">Clinic List</h5>
          <ul className="list-group list-group-flush">
            {clinics.map((clinic, index) => {
              const id = clinic.FacilityID || index;
              return (
                <li
                  key={id}
                  ref={(el) => (itemRefs.current[id] = el)}
                  className={`list-group-item ${
                    selectedClinic === id ? "bg-info text-white" : ""
                  }`}
                  onClick={() => navigate(`/clinic/${id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex align-items-start">
                    <img
                      src="https://raw.githubusercontent.com/rahimiabdulrahmanab/Clinics-Dashboard/main/hospital.png"
                      alt="Clinic"
                      className="me-3 rounded"
                      style={{
                        width: "70px",
                        height: "80px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <h6 className="mb-1 text-primary">
                        {clinic["Facility Name (DHIS2)"]}
                      </h6>
                      <p
                        className="mb-0 text-muted"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {clinic["District Name"]}
                      </p>
                      <p
                        className="mb-0 text-muted"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {clinic["Province Name"]}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Map */}
        <div className="col-md-8" style={{ height: "80vh" }}>
          <MapContainer
            center={[34.5, 69.2]}
            zoom={6}
            style={{ width: "100%", height: "100%" }}
            whenCreated={(map) => {
              map.on("zoomend", () => setZoomLevel(map.getZoom()));
            }}
          >
            <LayersControl position="topright">
              {/* 🗺️ Base Layers */}
              <LayersControl.BaseLayer checked name="Street Map">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap"
                />
              </LayersControl.BaseLayer>

              <LayersControl.BaseLayer name="Satellite">
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution="&copy; Esri, Earthstar Geographics"
                />
              </LayersControl.BaseLayer>

              {/* ✅ Always show District Boundaries in layers list */}
              <LayersControl.Overlay name="District Boundaries">
                {geojson && (
                  <GeoJSON
                    key="afg-geojson"
                    data={geojson}
                    style={() => ({
                      color: "yellow",
                      weight: 1,
                      fillOpacity: 0,
                    })}
                    onEachFeature={(feature, layer) => {
                      const { adm2_name } = feature.properties;
                      if (!adm2_name) return;

                      // Add tooltip (district name)
                      layer.bindTooltip(adm2_name, {
                        permanent: true,
                        direction: "center",
                        className: "district-label",
                      });

                      // Control label visibility based on zoom level
                      layer.on("add", (e) => {
                        const map = e.target._map;
                        if (!map) return;
                        if (map.getZoom() < 7) layer.closeTooltip();
                        else layer.openTooltip();

                        map.on("zoomend", () => {
                          if (map.getZoom() < 8) layer.closeTooltip();
                          else layer.openTooltip();
                        });
                      });
                    }}
                  />
                )}
              </LayersControl.Overlay>
            </LayersControl>

            {/* ✅ Cluster markers */}
            <MarkerClusterGroup
              iconCreateFunction={(cluster) =>
                L.divIcon({
                  html: `
                    <div style="
                      background: #1976d2;
                      color: white;
                      border-radius: 50%;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      flex-direction: column;
                      width: 50px;
                      height: 50px;
                      box-shadow: 0 0 6px rgba(0,0,0,0.5);
                      font-size: 14px;
                      font-weight: bold;
                    ">
                      <img 
                        src="https://cdn-icons-png.flaticon.com/512/684/684908.png" 
                        style="width:18px;height:18px;margin-bottom:2px;" 
                      />
                      <span>${cluster.getChildCount()}</span>
                    </div>
                  `,
                  className: "",
                  iconSize: [50, 50],
                })
              }
            >
              {clinics.map((clinic, index) => {
                if (clinic.Latitude && clinic.Longitude) {
                  const id = clinic.FacilityID || index;
                  return (
                    <Marker
                      key={id}
                      position={[
                        parseFloat(clinic.Latitude),
                        parseFloat(clinic.Longitude),
                      ]}
                      icon={clinicIcon}
                      eventHandlers={{ click: () => setSelectedClinic(id) }}
                    >
                      <Popup>
                        <strong>{clinic["Facility Name (DHIS2)"]}</strong>
                        <br />
                        {clinic["District Name"]}, {clinic["Province Name"]}
                      </Popup>
                    </Marker>
                  );
                }
                return null;
              })}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
