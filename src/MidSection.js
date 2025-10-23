import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import {
  GeoJSON,
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  ScaleControl,
  useMapEvent,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles.css";

import SearchFilters from "./SearchFilters";

// ---------- Icons ----------
const clinicIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/rahimiabdulrahmanab/Clinics-Dashboard/main/Marker.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -32],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [30, 30],
  shadowAnchor: [10, 30],
});

// ---------- Data sources ----------
const csvUrl =
  "https://raw.githubusercontent.com/rahimiabdulrahmanab/Clinics-Dashboard/main/Afghanistan%20Clinics.csv";

const geojsonUrl =
  "https://raw.githubusercontent.com/rahimiabdulrahmanab/ShapeFile_Project/main/afg_admin2.geojson";

// ---------- Helper (list ↔ map sync) ----------
function FlyToOnSelect({ target, zoom = 10 }) {
  // Get a stable map instance without needing a separate ref
  const map = useMapEvent("click", () => {});
  // Derive stable deps so hooks are always invoked in the same order
  const tLat = target?.[0];
  const tLon = target?.[1];

  useEffect(() => {
    if (tLat != null && tLon != null) {
      map.flyTo([tLat, tLon], zoom, { duration: 0.8 });
    }
  }, [map, tLat, tLon, zoom]);

  return null;
}

export default function MidSection() {
  const [allClinics, setAllClinics] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [geojson, setGeojson] = useState(null);

  const [loadingCsv, setLoadingCsv] = useState(true);
  const [loadingGeo, setLoadingGeo] = useState(true);
  const [errorCsv, setErrorCsv] = useState("");
  const [errorGeo, setErrorGeo] = useState("");

  const [zoomLevel, setZoomLevel] = useState(6);
  const [showClusters, setShowClusters] = useState(true);
  const [showBoundaries, setShowBoundaries] = useState(false);

  const [flyTo, setFlyTo] = useState(null);
  const mapRef = useRef(null);
  const markerRefs = useRef({}); // id -> Leaflet Marker

  const navigate = useNavigate();

  // ---------- Load GeoJSON ----------
  useEffect(() => {
    async function loadGeo() {
      try {
        setLoadingGeo(true);
        const res = await fetch(geojsonUrl);
        const data = await res.json();
        setGeojson(data);
      } catch (e) {
        setErrorGeo("Failed to load district boundaries.");
      } finally {
        setLoadingGeo(false);
      }
    }
    loadGeo();
  }, []);

  // ---------- Load CSV ----------
  useEffect(() => {
    setLoadingCsv(true);
    Papa.parse(csvUrl, {
      download: true,
      header: true,
      complete: (result) => {
        try {
          let rows = result.data;

          // De-duplicate by facility name (DHIS2)
          const seen = new Set();
          rows = rows.filter((clinic) => {
            const name = clinic["Facility Name (DHIS2)"];
            if (!name || seen.has(name)) return false;
            seen.add(name);
            return true;
          });

          // Keep only valid points inside Afghanistan range
          rows = rows.filter((clinic) => {
            const lat = parseFloat(clinic.Latitude);
            const lon = parseFloat(clinic.Longitude);
            if (isNaN(lat) || isNaN(lon)) return false;
            return lat >= 29.0 && lat <= 39.5 && lon >= 60.5 && lon <= 74.9;
          });

          setAllClinics(rows);
          setClinics(rows);
        } catch (e) {
          setErrorCsv("Failed to process clinics CSV.");
        } finally {
          setLoadingCsv(false);
        }
      },
      error: () => {
        setErrorCsv("Failed to download clinics CSV.");
        setLoadingCsv(false);
      },
    });
  }, []);

  // ---------- Derived stats ----------
  const totalClinics = allClinics.length;
  const filteredClinics = clinics.length;

  // ---------- Memoized markers ----------
  const markerItems = useMemo(
    () =>
      clinics
        .map((c, i) => {
          if (!c.Latitude || !c.Longitude) return null;
          const id = c.FacilityID || i;
          const lat = parseFloat(c.Latitude);
          const lon = parseFloat(c.Longitude);
          return { id, lat, lon, c };
        })
        .filter(Boolean),
    [clinics]
  );

  // ---------- Handlers ----------
  const handleListClick = (id, lat, lon) => {
    setSelectedId(id);
    setFlyTo([lat, lon]); // sync map camera
    // open popup shortly after flyTo
    setTimeout(() => {
      markerRefs.current[id]?.openPopup?.();
    }, 700);
    navigate(`/clinic/${id}`);
  };

  const headerBadge = (label, value, tone = "primary") => (
    <div className="d-flex align-items-center gap-2 header-badge">
      <span className={`badge-dot bg-${tone}`} />
      <div>
        <div className="text-uppercase small text-muted">{label}</div>
        <div className="fw-bold">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-3 px-3">
      {/* ---------- Page Header / Stats & Actions ---------- */}
      <div className="row g-3 align-items-center mb-3">
        <div className="col-lg-8">
          <div className="d-flex flex-wrap align-items-center gap-4">
            <h4 className="mb-0 fw-semibold">Afghanistan Clinics</h4>
            {headerBadge("Total Clinics", totalClinics || "—", "primary")}
            {headerBadge("Visible", filteredClinics || "—", "success")}
            {headerBadge("Zoom", `Z${zoomLevel}`, "info")}
          </div>
        </div>

        <div className="col-lg-4">
          {/* Quick toggles */}
          <div className="d-flex justify-content-lg-end gap-2">
            <button
              className={`btn btn-sm ${
                showClusters ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setShowClusters((s) => !s)}
              title="Toggle clustering"
            >
              {showClusters ? "Clustering: On" : "Clustering: Off"}
            </button>
            <button
              className={`btn btn-sm ${
                showBoundaries ? "btn-secondary" : "btn-outline-secondary"
              }`}
              onClick={() => setShowBoundaries((s) => !s)}
              title="Toggle district boundaries"
            >
              {showBoundaries ? "Boundaries: On" : "Boundaries: Off"}
            </button>
          </div>
        </div>
      </div>

      {/* ---------- Filters (top) ---------- */}
      <div className="mb-2">
        <SearchFilters clinics={allClinics} onFilter={setClinics} />
      </div>

      {/* ---------- Error / Loading banners ---------- */}
      {(loadingCsv || loadingGeo) && (
        <div className="alert alert-info py-2 mb-3">
          Loading data… {loadingCsv && "clinics"} {loadingGeo && "boundaries"}
        </div>
      )}
      {(errorCsv || errorGeo) && (
        <div className="alert alert-warning py-2 mb-3">
          {errorCsv && <span className="me-3">{errorCsv}</span>}
          {errorGeo && <span>{errorGeo}</span>}
        </div>
      )}

      {/* ---------- Main Content ---------- */}
      <div className="row g-0">
        {/* Left: Sticky List */}
        <div className="col-md-4 border-end">
          <div className="sticky-sidebar">
            <div className="d-flex align-items-center justify-content-between px-3 py-2">
              <h6 className="mb-0 text-secondary">Clinic List</h6>
              <span className="badge text-bg-light">{filteredClinics}</span>
            </div>

            <ul className="list-group list-group-flush clinic-list">
              {markerItems.map(({ id, lat, lon, c }) => (
                <li
                  key={id}
                  className={`list-group-item clinic-item ${
                    selectedId === id ? "active" : ""
                  }`}
                  onClick={() => handleListClick(id, lat, lon)}
                >
                  <div className="d-flex align-items-start">
                    <img
                      src="https://raw.githubusercontent.com/rahimiabdulrahmanab/Clinics-Dashboard/main/hospital.png"
                      alt="Clinic"
                      className="me-3 rounded object-cover"
                      width="64"
                      height="64"
                    />
                    <div className="flex-grow-1">
                      <div className="fw-semibold text-primary mb-1">
                        {c["Facility Name (DHIS2)"] || "Unnamed Facility"}
                      </div>
                      <div className="small text-muted">
                        {c["District Name"]} • {c["Province Name"]}
                      </div>
                      <div className="small mt-1">
                        <span className="badge text-bg-light me-1">
                          Lat {lat.toFixed(2)}
                        </span>
                        <span className="badge text-bg-light">
                          Lon {lon.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}

              {!loadingCsv && markerItems.length === 0 && (
                <li className="list-group-item text-muted">
                  No clinics match your filters.
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Right: Map */}
        <div className="col-md-8">
          <div className="map-wrap">
            <MapContainer
              center={[34.5, 69.2]}
              zoom={6}
              minZoom={5}
              style={{ width: "100%", height: "100%" }}
              whenCreated={(map) => {
                mapRef.current = map;
                map.on("zoomend", () => setZoomLevel(map.getZoom()));
              }}
              zoomControl={true}
            >
              {/* Keep map in sync with list selection */}
              <FlyToOnSelect target={flyTo} zoom={10} />

              <ScaleControl imperial={false} position="bottomleft" />

              <LayersControl position="topright">
                {/* Base layers */}
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

                {/* District boundaries */}
                <LayersControl.Overlay
                  name="District Boundaries"
                  checked={showBoundaries}
                >
                  <div style={{ display: showBoundaries ? "block" : "none" }}>
                    {geojson && (
                      <GeoJSON
                        key="afg-geojson"
                        data={geojson}
                        style={() => ({
                          color: "#FFD54F",
                          weight: 1,
                          fillOpacity: 0,
                        })}
                        onEachFeature={(feature, layer) => {
                          const { adm2_name } = feature.properties || {};
                          if (!adm2_name) return;

                          layer.bindTooltip(adm2_name, {
                            permanent: true,
                            direction: "center",
                            className: "district-label",
                          });

                          layer.on("add", (e) => {
                            const map = e.target._map;
                            if (!map) return;
                            if (map.getZoom() < 8) layer.closeTooltip();
                            else layer.openTooltip();

                            map.on("zoomend", () => {
                              if (map.getZoom() < 8) layer.closeTooltip();
                              else layer.openTooltip();
                            });
                          });
                        }}
                      />
                    )}
                  </div>
                </LayersControl.Overlay>
              </LayersControl>

              {/* Markers (cluster toggle) */}
              {showClusters ? (
                <MarkerClusterGroup
                  iconCreateFunction={(cluster) =>
                    L.divIcon({
                      html: `
                        <div class="cluster-pill">
                          <img 
                            src="https://cdn-icons-png.flaticon.com/512/684/684908.png" 
                            style="width:18px;height:18px;margin-right:4px;" 
                          />
                          <span>${cluster.getChildCount()}</span>
                        </div>
                      `,
                      className: "",
                      iconSize: [54, 28],
                    })
                  }
                >
                  {markerItems.map(({ id, lat, lon, c }) => (
                    <Marker
                      key={id}
                      position={[lat, lon]}
                      icon={clinicIcon}
                      eventHandlers={{
                        click: () => setSelectedId(id),
                      }}
                      ref={(marker) => {
                        // Store Leaflet Marker instance for programmatic openPopup()
                        if (marker && marker.leafletElement) {
                          // react-leaflet v3 pattern (but your deps show v5)
                          markerRefs.current[id] = marker.leafletElement;
                        } else if (marker) {
                          // react-leaflet v4/v5 pattern
                          markerRefs.current[id] = marker;
                        }
                      }}
                    >
                      <Popup>
                        <strong>{c["Facility Name (DHIS2)"]}</strong>
                        <br />
                        {c["District Name"]}, {c["Province Name"]}
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              ) : (
                markerItems.map(({ id, lat, lon, c }) => (
                  <Marker
                    key={id}
                    position={[lat, lon]}
                    icon={clinicIcon}
                    eventHandlers={{ click: () => setSelectedId(id) }}
                    ref={(marker) => {
                      if (marker && marker.leafletElement) {
                        markerRefs.current[id] = marker.leafletElement;
                      } else if (marker) {
                        markerRefs.current[id] = marker;
                      }
                    }}
                  >
                    <Popup>
                      <strong>{c["Facility Name (DHIS2)"]}</strong>
                      <br />
                      {c["District Name"]}, {c["Province Name"]}
                    </Popup>
                  </Marker>
                ))
              )}
            </MapContainer>

            {/* Map corner legend */}
            <div className="map-legend card shadow-sm">
              <div className="legend-row">
                <span className="legend-swatch border" />
                Clinic
              </div>
              <div className="legend-row">
                <span className="legend-line" />
                District boundary
              </div>
              <div className="legend-row small text-muted">
                <span className="me-1">🖱️</span> Click a list item to fly map
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
