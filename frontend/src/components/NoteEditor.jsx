import { useEffect, useState } from "react";

/** Small inline staff-note editor. */
export default function NoteEditor({ value, onSave, placeholder = "Add staff note" }) {
  const [text, setText] = useState(value || "");
  const [busy, setBusy] = useState(false);
  useEffect(() => setText(value || ""), [value]);
  const dirty = text.trim() !== (value || "").trim();

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave(text.trim());
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="note-edit" onSubmit={save}>
      <input type="text" value={text} maxLength={2000} placeholder={placeholder} aria-label={placeholder} onChange={(e) => setText(e.target.value)} />
      <button className="btn btn-sm btn-dark" type="submit" disabled={!dirty || busy}>
        {busy ? "…" : "Save"}
      </button>
    </form>
  );
}
