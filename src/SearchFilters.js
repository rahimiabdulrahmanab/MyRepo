import { useState, useEffect } from "react";

export default function SearchFilters({ clinics = [], onFilter }) {
  const [name, setName] = useState("");
  const [facilityType, setFacilityType] = useState("");
  const [district, setDistrict] = useState("");

  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [districtSuggestions, setDistrictSuggestions] = useState([]);

  // Unique facility types & districts
  const facilityTypes = [
    ...new Set(clinics.map((c) => c["Facility Type"]).filter(Boolean)),
  ];
  const districts = [
    ...new Set(clinics.map((c) => c["District Name"]).filter(Boolean)),
  ];

  // Apply filters
  useEffect(() => {
    if (!onFilter) return;
    let filtered = clinics;

    if (name) {
      filtered = filtered.filter((c) =>
        c["Facility Name (DHIS2)"]?.toLowerCase().includes(name.toLowerCase())
      );
    }
    if (facilityType) {
      filtered = filtered.filter((c) => c["Facility Type"] === facilityType);
    }
    if (district) {
      filtered = filtered.filter((c) =>
        c["District Name"]?.toLowerCase().includes(district.toLowerCase())
      );
    }

    onFilter(filtered);
  }, [name, facilityType, district, clinics, onFilter]);

  // Handle suggestions
  function handleNameChange(value) {
    setName(value);
    if (value.length > 1) {
      setNameSuggestions(
        clinics
          .map((c) => c["Facility Name (DHIS2)"])
          .filter((n) => n && n.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 5)
      );
    } else setNameSuggestions([]);
  }

  function handleDistrictChange(value) {
    setDistrict(value);
    if (value.length > 1) {
      setDistrictSuggestions(
        districts
          .filter((d) => d && d.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 5)
      );
    } else setDistrictSuggestions([]);
  }

  return (
    <div className="container mb-4">
      <div className="row g-2">
        {/* Facility Name */}
        <div className="col-md-3 position-relative">
          <input
            type="text"
            className="form-control"
            placeholder="Search By Facility Name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
          {nameSuggestions.length > 0 && (
            <ul
              className="list-group position-absolute w-100"
              style={{ zIndex: 1000 }}
            >
              {nameSuggestions.map((s, i) => (
                <li
                  key={i}
                  className="list-group-item list-group-item-action"
                  onClick={() => {
                    setName(s);
                    setNameSuggestions([]);
                  }}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Service (placeholder) */}
        <div className="col-md-3">
          <select className="form-select" disabled>
            <option>Search By Service (coming soon)</option>
          </select>
        </div>

        {/* Facility Type */}
        <div className="col-md-3">
          <select
            className="form-select"
            value={facilityType}
            onChange={(e) => setFacilityType(e.target.value)}
          >
            <option value="">Facility Type</option>
            {facilityTypes.map((ft, i) => (
              <option key={i} value={ft}>
                {ft}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div className="col-md-3 position-relative">
          <input
            type="text"
            className="form-control"
            placeholder="Search By District"
            value={district}
            onChange={(e) => handleDistrictChange(e.target.value)}
          />
          {districtSuggestions.length > 0 && (
            <ul
              className="list-group position-absolute w-100"
              style={{ zIndex: 1000 }}
            >
              {districtSuggestions.map((d, i) => (
                <li
                  key={i}
                  className="list-group-item list-group-item-action"
                  onClick={() => {
                    setDistrict(d);
                    setDistrictSuggestions([]);
                  }}
                >
                  {d}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
