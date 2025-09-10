"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const CameraCapture = ({ point, onCapture, onClose }) => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // gunakan useCallback supaya bisa dipakai di dependency useEffect
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (!capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [capturedImage, startCamera, stopCamera]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error("Gagal membuat blob dari canvas");
          setIsCapturing(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        setCapturedImage({ blob, url });
        setIsCapturing(false);
      },
      "image/jpeg",
      0.9
    );
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture({
        blob: capturedImage.blob,
        url: capturedImage.url,
        timestamp: new Date().toISOString(),
        point,
      });
      stopCamera();
    }
  };

  const retakePhoto = () => {
    if (capturedImage?.url) {
      URL.revokeObjectURL(capturedImage.url);
    }
    setCapturedImage(null);
  };

  const handleClose = () => {
    stopCamera();
    if (capturedImage?.url) {
      URL.revokeObjectURL(capturedImage.url);
    }
    onClose();
  };

  return (
    <div className="camera-modal">
      <div className="camera-container">
        <div className="camera-header">
          <h3>
            Foto #{point.id}: {point.label}
          </h3>
          <button onClick={handleClose} className="btn-close">
            ×
          </button>
        </div>

        <div className="camera-content">
          {!capturedImage ? (
            <div className="camera-preview">
              <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
              <div className="camera-overlay">
                <div className="camera-frame"></div>
              </div>
            </div>
          ) : (
            <div className="photo-preview">
              <img src={capturedImage.url} alt="Captured" className="captured-image" />
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>

        <div className="camera-controls">
          {!capturedImage ? (
            <button onClick={capturePhoto} disabled={isCapturing} className="btn-capture">
              {isCapturing ? "Mengambil..." : "📷 Ambil Foto"}
            </button>
          ) : (
            <div className="capture-actions">
              <button onClick={retakePhoto} className="btn-secondary">
                🔄 Ambil Ulang
              </button>
              <button onClick={confirmCapture} className="btn-primary">
                ✓ Gunakan Foto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
