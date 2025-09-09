"use client";
import { useState, useEffect } from "react";
import "./App.css";
import DataForm from "./components/DataForm";
import FloorPlan from "./components/FloorPlan";
import Login from "./components/Login";
import { getUser, logout } from "./api";

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    namaToko: "",
    kodeToko: "",
    tanggalGo: "",
    spkAwal: "",
    kontraktorSipil: "",
    cabang: "",
    tanggalSt: "",
    tanggalAmbilFoto: "",
    spkAkhir: "",
    kontraktorMe: "",
  });
  const [photos, setPhotos] = useState({});

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleFormSubmit = (data) => {
    setFormData(data);
    setCurrentStep(2);
  };

  const handlePhotoComplete = (photoData) => setPhotos(photoData);
  const handleBackToForm = () => setCurrentStep(1);

  if (!user) {
    return <Login onSuccess={() => setUser(getUser())} />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>FOTO DOKUMENTASI BANGUNAN TOKO BARU ALFAMART</h1>
          <p>Building & Maintenance</p>
          <div style={{ position: "absolute", right: 16, top: 12 }}>
            <button
              className="btn-secondary"
              onClick={() => {
                logout();
                window.location.reload();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {currentStep === 1 ? (
          <DataForm onSubmit={handleFormSubmit} initialData={formData} />
        ) : (
          <FloorPlan
            formData={formData}
            onPhotoComplete={handlePhotoComplete}
            onBackToForm={handleBackToForm}
            photos={photos}
          />
        )}
      </main>
    </div>
  );
}

export default App;
