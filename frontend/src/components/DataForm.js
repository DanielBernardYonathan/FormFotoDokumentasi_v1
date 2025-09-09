"use client"
import { useState, useEffect } from "react";
import { getUser, getSpkData } from "../api";

const DataForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState(initialData);
  const [spkOptions, setSpkOptions] = useState([]);
  const user = getUser(); // hasil login

  // Ambil data SPK sesuai cabang user
  useEffect(() => {
    async function fetchSpk() {
      if (user?.cabang) {
        try {
          const res = await getSpkData(user.cabang);
          if (res.ok) setSpkOptions(res.data);
        } catch (err) {
          console.error("Error fetch SPK_DATA:", err);
        }
      }
    }
    fetchSpk();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "nomorUlok") {
      const found = spkOptions.find((o) => o.nomorUlok === value);
      if (found) {
        setFormData((prev) => ({
          ...prev,
          nomorUlok: found.nomorUlok,
          cabang: found.cabang,
          kontraktorSipil: found.kontraktorSipil,
          kontraktorMe: found.kontraktorMe,
          spkAwal: found.spkAwal,
          spkAkhir: found.spkAkhir,
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="data-form-container">
      <div className="form-header">
        <h2>Form Input Dokumentasi</h2>
        <p>Lengkapi data berikut sebelum mengambil foto dokumentasi</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* CABANG */}
          <div className="form-group">
            <label>Cabang *</label>
            <select
              name="cabang"
              value={formData.cabang || user?.cabang || ""}
              onChange={handleChange}
              required
            >
              <option value={user?.cabang}>{user?.cabang}</option>
            </select>
          </div>

          {/* NOMOR ULOK */}
          <div className="form-group">
            <label>Nomor Ulok *</label>
            <select
              name="nomorUlok"
              value={formData.nomorUlok || ""}
              onChange={handleChange}
              required
            >
              <option value="">-- pilih --</option>
              {spkOptions.map((o) => (
                <option key={o.nomorUlok} value={o.nomorUlok}>
                  {o.nomorUlok}
                </option>
              ))}
            </select>
          </div>

          {/* AUTO-FILL */}
          <div className="form-group">
            <label>Kontraktor Sipil</label>
            <input type="text" value={formData.kontraktorSipil || ""} readOnly />
          </div>

          <div className="form-group">
            <label>Kontraktor ME</label>
            <input type="text" value={formData.kontraktorMe || ""} readOnly />
          </div>

          <div className="form-group">
            <label>SPK Awal</label>
            <input type="text" value={formData.spkAwal || ""} readOnly />
          </div>

          <div className="form-group">
            <label>SPK Akhir</label>
            <input type="text" value={formData.spkAkhir || ""} readOnly />
          </div>

          {/* INPUT MANUAL */}
          <div className="form-group">
            <label>Nama Toko *</label>
            <input
              type="text"
              name="namaToko"
              value={formData.namaToko || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Kode Toko *</label>
            <input
              type="text"
              name="kodeToko"
              value={formData.kodeToko || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Tanggal GO *</label>
            <input
              type="date"
              name="tanggalGo"
              value={formData.tanggalGo || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Tanggal ST *</label>
            <input
              type="date"
              name="tanggalSt"
              value={formData.tanggalSt || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Tanggal Ambil Foto *</label>
            <input
              type="date"
              name="tanggalAmbilFoto"
              value={formData.tanggalAmbilFoto || ""}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Lanjut ke Foto
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataForm;
