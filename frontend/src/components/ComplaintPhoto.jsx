import { useEffect, useState } from "react";
import { api } from "../services/api.js";

/** Loads an attached photo on demand (auth-protected endpoint, so it is fetched with the session cookie). */
export default function ComplaintPhoto({ complaintId }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => url && URL.revokeObjectURL(url), [url]);

  async function show() {
    setBusy(true);
    setError("");
    try {
      setUrl(await api.complaints.photoUrl(complaintId));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (url) return <img className="photo-full" src={url} alt={`Attached to ${complaintId}`} />;
  return (
    <div style={{ marginTop: ".4rem" }}>
      <button type="button" className="link-btn" onClick={show} disabled={busy}>
        {busy ? "Loading photo…" : "View attached photo"}
      </button>
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}
