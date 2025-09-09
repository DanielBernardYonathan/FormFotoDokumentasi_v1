"use client";

import { useState, useEffect } from "react";
import CameraCapture from "./CameraCapture";
import { saveToko } from "../api"; // ⬅️ panggil fungsi API.js

const FloorPlan = ({ formData, onPhotoComplete, onBackToForm, photos }) => {
  const [currentPhotoNumber, setCurrentPhotoNumber] = useState(1);
  const [capturedPhotos, setCapturedPhotos] = useState(photos);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // === state tambahan untuk loading & notif ===
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const ok = localStorage.getItem("saved_ok");
    if (ok === "1") {
      setToast({ type: "success", text: "Berhasil disimpan ke Spreadsheet ✅" });
      localStorage.removeItem("saved_ok");
      setTimeout(() => setToast(null), 3000);
    }
  }, []);

  const showToast = (type, text, ms = 3000) => {
    setToast({ type, text });
    if (ms) setTimeout(() => setToast(null), ms);
  };

  // === titik foto lengkap ===
  const photoPointsByPage = {
    1: [
      { id: 1, x: 68.5, y: 93, label: "DEPAN KANAN" },
      { id: 2, x: 63.7, y: 97.5, label: "DEPAN KIRI" },
      { id: 3, x: 50.5, y: 97.5, label: "DEPAN TENGAH" },
      // ... (lanjutkan sesuai data kamu)
    ],
    2: [
      { id: 27, x: 61.1, y: 57.5, label: "OREMOND DUDUKAN LISTPLANK" },
      { id: 28, x: 61, y: 53, label: "INSTALASI LISTRIK DIATAS PLAFOND" },
    ],
    3: [
      { id: 29, x: 50, y: 51.8, label: "INSTALASI LISTRIK SHOP SIGN" },
      { id: 31, x: 61.3, y: 24, label: "AREA DAG TORN" },
    ],
  };

  const allPhotoPoints = [
    ...photoPointsByPage[1],
    ...photoPointsByPage[2],
    ...photoPointsByPage[3],
  ];
  const currentPagePoints = photoPointsByPage[currentPage] || [];

  const getFloorPlanImage = () => {
    switch (currentPage) {
      case 1:
        return "/floor.png";
      case 2:
        return "/floor2.jpeg";
      case 3:
        return "/floor3.jpeg";
      default:
        return "/floor.png";
    }
  };

  const handlePointClick = (point) => {
    if (point.id !== currentPhotoNumber) {
      alert(
        `Harap ambil foto secara berurutan. Foto nomor ${currentPhotoNumber} harus diambil terlebih dahulu.`
      );
      return;
    }
    setSelectedPoint(point);
    setShowCamera(true);
  };

  const handlePhotoCapture = (photoData) => {
    const newPhotos = {
      ...capturedPhotos,
      [selectedPoint.id]: {
        ...photoData,
        point: selectedPoint,
        timestamp: new Date().toISOString(),
      },
    };
    setCapturedPhotos(newPhotos);
    setCurrentPhotoNumber((prev) => prev + 1);
    setShowCamera(false);
    setSelectedPoint(null);
    onPhotoComplete(newPhotos);
  };

  const handleCameraClose = () => {
    setShowCamera(false);
    setSelectedPoint(null);
  };

  const getPointStatus = (pointId) => {
    if (capturedPhotos[pointId]) return "completed";
    if (pointId === currentPhotoNumber) return "active";
    if (pointId < currentPhotoNumber) return "missed";
    return "pending";
  };

  const completedCount = Object.keys(capturedPhotos).length;
  const progress = (completedCount / 38) * 100;

  // === helper konversi blob → base64 ===
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // === generate PDF, return blob ===
  const generatePDFReport = async () => {
    const jsPDF = (await import("jspdf")).default;
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;

    const drawHeader = () => {
      pdf.setFillColor(185, 28, 28);
      pdf.rect(0, 0, pageWidth, 30, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        "FOTO DOKUMENTASI BANGUNAN TOKO BARU",
        pageWidth / 2,
        18,
        { align: "center" }
      );
    };
    const drawFooter = (pageNumber) => {
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Halaman ${pageNumber}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: "right" }
      );
    };

    let currentPageNumber = 1;
    drawHeader();
    drawFooter(currentPageNumber);
    let yPos = 40;

    // tabel info
    const infoData = [
      ["NOMOR ULOK", formData.nomorUlok || "", "CABANG", formData.cabang || ""],
      ["NAMA TOKO", formData.namaToko || "", "TANGGAL ST", formData.tanggalSt || ""],
      ["KODE TOKO", formData.kodeToko || "", "TANGGAL AMBIL FOTO", formData.tanggalAmbilFoto || ""],
      ["TANGGAL GO", formData.tanggalGo || "", "SPK AKHIR", formData.spkAkhir || ""],
      ["SPK AWAL", formData.spkAwal || "", "KONTRAKTOR ME", formData.kontraktorMe || ""],
      ["KONTRAKTOR SIPIL", formData.kontraktorSipil || "", "", ""],
    ];
    const cellWidth = (pageWidth - 2 * margin) / 4;
    const cellHeight = 7;
    pdf.setFontSize(8);

    infoData.forEach((row, rowIndex) => {
      const currentY = yPos + rowIndex * cellHeight;
      row.forEach((cell, colIndex) => {
        const currentX = margin + colIndex * cellWidth;
        if (colIndex % 2 === 0) {
          pdf.setFillColor(220, 38, 38);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(255, 255, 255);
        } else {
          pdf.setFillColor(255, 255, 255);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(0, 0, 0);
        }
        pdf.rect(currentX, currentY, cellWidth, cellHeight, "FD");
        pdf.text(cell, currentX + 2, currentY + 5);
      });
    });
    yPos += infoData.length * cellHeight + 10;

    // judul foto
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(185, 28, 28);
    pdf.text("DOKUMENTASI FOTO", margin, yPos);
    yPos += 8;

    // grid foto
    const photosPerRow = 3;
    const photoWidth =
      (pageWidth - 2 * margin - (photosPerRow - 1) * 4) / photosPerRow;
    const photoHeight = photoWidth * 0.75;
    const photoSpacing = 4;
    const captionHeight = 12;
    const rowHeight = photoHeight + captionHeight + photoSpacing;

    let currentCol = 0;
    const sortedPhotoPoints = allPhotoPoints.sort((a, b) => a.id - b.id);

    for (const point of sortedPhotoPoints) {
      if (yPos + rowHeight > pageHeight - 20) {
        currentPageNumber++;
        pdf.addPage();
        drawHeader();
        drawFooter(currentPageNumber);
        yPos = 40;
        currentCol = 0;
      }

      const startX = margin + currentCol * (photoWidth + photoSpacing);
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(startX, yPos, photoWidth, photoHeight);

      const photo = capturedPhotos[point.id];
      if (photo && photo.blob) {
        const reader = new FileReader();
        const imageData = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(photo.blob);
        });
        pdf.addImage(
          imageData,
          "JPEG",
          startX + 1,
          yPos + 1,
          photoWidth - 2,
          photoHeight - 2
        );
      } else {
        pdf.setFontSize(8);
        pdf.text("Foto belum diambil.", startX + 5, yPos + photoHeight / 2);
      }

      const captionY = yPos + photoHeight + 4;
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(185, 28, 28);
      const idText = `${point.id}. `;
      pdf.text(idText, startX, captionY);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);
      const labelText = pdf.splitTextToSize(
        point.label,
        photoWidth - pdf.getTextWidth(idText)
      );
      pdf.text(labelText, startX + pdf.getTextWidth(idText), captionY);

      currentCol++;
      if (currentCol >= photosPerRow) {
        currentCol = 0;
        yPos += rowHeight;
      }
    }

    return pdf.output("blob");
  };

  // === simpan PDF ke backend ===
  async function savePdfToSpreadsheet() {
    try {
      setIsSaving(true);

      // 1. generate PDF blob
      const pdfBlob = await generatePDFReport();

      // 2. download langsung di browser
      const fileName = `Dokumentasi_${formData.kodeToko || "Toko"}_${formData.tanggalAmbilFoto || ""}.pdf`;
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      // 3. convert blob ke base64 untuk simpan ke backend
      const pdfBase64 = await blobToBase64(pdfBlob);

      const payload = {
        ...formData,
        pdfBase64,
      };

      const json = await saveToko(payload); // ⬅️ panggil API.js

      if (!json.ok) throw new Error(json.error || json.raw || "Gagal simpan PDF");

      localStorage.setItem("saved_ok", "1");
      showToast("success", "Berhasil disimpan ✅", 1500);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      showToast("error", String(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="floor-plan-container">
      {/* header progress */}
      <div className="floor-plan-header">
        <button onClick={onBackToForm} className="btn-back">
          ← Kembali ke Form
        </button>
        <div className="store-info">
          <h2>
            {formData.namaToko} - {formData.kodeToko}
          </h2>
          <p>Tanggal: {formData.tanggalAmbilFoto}</p>
        </div>
        <div className="progress-info">
          <span>Progress: {completedCount}/38 foto</span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* floor plan image & pagination */}
      <div className="floor-plan-content">
        <div className="floor-plan-wrapper">
          <div className="floor-plan-image">
            <img
              src={getFloorPlanImage()}
              alt={`Floor Plan Halaman ${currentPage}`}
              className="floor-plan-bg"
            />
            {currentPagePoints.map((point) => (
              <button
                key={point.id}
                className={`photo-point ${getPointStatus(point.id)}`}
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  position: "absolute",
                  transform: "translate(-50%, -50%)",
                }}
                onClick={() => handlePointClick(point)}
                disabled={
                  point.id !== currentPhotoNumber && !capturedPhotos[point.id]
                }
                title={`${point.id}. ${point.label}`}
              >
                {point.id}
                {capturedPhotos[point.id] && (
                  <span className="check-mark">✓</span>
                )}
              </button>
            ))}
          </div>
          <div className="pagination-controls">
            <button
              className={`pagination-btn ${
                currentPage === 1 ? "active" : ""
              }`}
              onClick={() => setCurrentPage(1)}
            >
              1
            </button>
            <button
              className={`pagination-btn ${
                currentPage === 2 ? "active" : ""
              }`}
              onClick={() => setCurrentPage(2)}
            >
              2
            </button>
            <button
              className={`pagination-btn ${
                currentPage === 3 ? "active" : ""
              }`}
              onClick={() => setCurrentPage(3)}
            >
              3
            </button>
          </div>
        </div>

        {/* daftar foto */}
        <div className="photo-list-container">
          <h3>Daftar Foto ({completedCount}/38)</h3>
          <div className="photo-list">
            <div className="photo-grid">
              {allPhotoPoints.map((point) => (
                <div
                  key={point.id}
                  className={`photo-item ${getPointStatus(point.id)}`}
                >
                  <div className="photo-number">{point.id}</div>
                  <div className="photo-label">{point.label}</div>
                  {capturedPhotos[point.id] && (
                    <div className="photo-preview">
                      <img
                        src={capturedPhotos[point.id].url}
                        alt={`Foto ${point.id}`}
                        className="thumbnail"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showCamera && selectedPoint && (
        <CameraCapture
          point={selectedPoint}
          onCapture={handlePhotoCapture}
          onClose={handleCameraClose}
        />
      )}

      {/* modal selesai */}
      {completedCount === 38 && (
        <div className="completion-modal">
          <div className="modal-content">
            <h2>🎉 Semua Foto Berhasil Diambil!</h2>
            <p>38 foto dokumentasi telah berhasil dikumpulkan.</p>
            <button
              className="btn-primary"
              onClick={savePdfToSpreadsheet}
              disabled={isSaving}
            >
              {isSaving ? "Menyimpan..." : "📄 Simpan & Download PDF"}
            </button>
          </div>
        </div>
      )}

      {/* overlay & toast */}
      {isSaving && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "16px 20px",
              borderRadius: 8,
              fontWeight: 600,
            }}
          >
            Menyimpan...
          </div>
        </div>
      )}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 2001,
            background: toast.type === "success" ? "#16a34a" : "#dc2626",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
};

export default FloorPlan;
