import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "../components/Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { api } from "../services/api.js";
import { CATEGORIES, CAT_ICON, MAX_PHOTO_BYTES, SERVICES, URGENCIES } from "../utils/constants.js";

export default function NewComplaint() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // ?service=plumbing pre-fills the form (carried over from the original app)
  const preset = SERVICES.find((s) => s.id === params.get("service"));
  const [form, setForm] = useState({
    category: preset ? preset.cat : "Maintenance",
    title: preset ? `${preset.name} booking` : "",
    details: preset ? preset.desc : "",
    urgency: "Medium",
    address: user.address || "",
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!photo) return setPreview("");
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function pickPhoto(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return setPhoto(null);
    if (!file.type.startsWith("image/")) {
      toast("Please choose an image file.");
      e.target.value = "";
      return setPhoto(null);
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast("Photo must be under 2 MB.");
      e.target.value = "";
      return setPhoto(null);
    }
    setPhoto(file);
  }

  async function submit(e) {
    e.preventDefault();
    const address = form.address.trim();
    const title = form.title.trim();
    if (!address) return toast("Add your address so the caretaker knows where to go.");
    if (!title) return toast("Add a complaint title.");

    const fd = new FormData();
    fd.append("category", form.category);
    fd.append("title", title);
    fd.append("details", form.details.trim());
    fd.append("urgency", form.urgency);
    fd.append("address", address);
    if (photo) fd.append("photo", photo);

    setBusy(true);
    try {
      const created = await api.complaints.create(fd);
      navigate(`/complaints?id=${encodeURIComponent(created.id)}`); // list refetches on mount
    } catch (err) {
      toast(err.message);
      setBusy(false);
    }
  }

  return (
    <>
      <div className="pagehead">
        <p className="tagline">Takes less than a minute</p>
        <h1>Add New Complaint</h1>
      </div>
      <div className="card pad">
        {preset && <p className="tagline" style={{ marginBottom: "1rem" }}>Booking service: {preset.name}</p>}
        <form onSubmit={submit} noValidate>
          <div className="field">
            <label>Category</label>
            <div className="cats">
              {CATEGORIES.map((c) => (
                <label className="cat" key={c}>
                  <input type="radio" name="category" value={c} checked={form.category === c} onChange={set("category")} />
                  <Icon name={CAT_ICON[c]} />
                  {c}
                </label>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="title">Complaint title</label>
            <input type="text" id="title" value={form.title} onChange={set("title")} maxLength={180} placeholder="e.g. Water leakage in basement parking" />
          </div>
          <div className="field">
            <label htmlFor="details">Description</label>
            <textarea id="details" value={form.details} onChange={set("details")} maxLength={4000} placeholder="Describe the issue — where it is, since when, and how urgent it feels." />
          </div>
          <div className="field">
            <label htmlFor="photo">Attach a photo (optional)</label>
            <input type="file" id="photo" accept="image/png,image/jpeg,image/gif,image/webp" onChange={pickPhoto} />
            <small className="muted">Choose an image under 2 MB to help explain the issue.</small>
            {preview && <img className="photo-preview" src={preview} alt="Selected attachment preview" />}
          </div>
          <div className="field">
            <label>Priority</label>
            <div className="pri">
              {URGENCIES.map((u) => (
                <label key={u}>
                  <input type="radio" name="urgency" value={u} checked={form.urgency === u} onChange={set("urgency")} />
                  {u}
                </label>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="address">Address</label>
            <input type="text" id="address" value={form.address} onChange={set("address")} maxLength={180} placeholder="B-10, Mayfield Gardens" autoComplete="street-address" />
          </div>
          <button className="btn btn-lime wide" type="submit" disabled={busy}>
            <Icon name="send" /> {busy ? "SUBMITTING…" : "SUBMIT COMPLAINT"}
          </button>
        </form>
      </div>
    </>
  );
}
