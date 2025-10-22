import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Intro from "./Intro";
import MidSection from "./MidSection";
import BottomSection from "./BottomSection";
import ClinicDetail from "./ClinicDetail"; // 🆕 import your new page
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  return (
    <Router>
      <div>
        {/* Top part of the page */}
        <Header />
        <Intro />

        {/* Define routes */}
        <Routes>
          {/* Default Dashboard route */}
          <Route path="/" element={<MidSection />} />

          {/* New Clinic Detail route */}
          <Route path="/clinic/:id" element={<ClinicDetail />} />
        </Routes>

        {/* Bottom summary + footer */}
        <BottomSection />
      </div>
    </Router>
  );
}
