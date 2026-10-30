import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Badge from "../components/Badge.jsx";
import ComplaintPhoto from "../components/ComplaintPhoto.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import Icon from "../components/Icon.jsx";
import Loading from "../components/Loading.jsx";
import { useToast } from "../context/ToastContext.jsx";
import useFetch from "../hooks/useFetch.js";
import { api } from "../services/api.js";
import { STATUS_ORDER } from "../utils/constants.js";
import { ago, formatDate } from "../utils/format.js";

function Timeline({ t }) {
  const idx = STATUS_ORDER.indexOf(t.status);
  const rows = [
    { h: "Complaint submitted", p: `Logged by ${t.address} · ${ago(t.ts)}` },
    { h: "Work in progress", p: t.note || (idx >= 1 ? "Being looked into." : "Not started yet.") },
    { h: "Resolved", p: t.status === "Resolved" ? "Closed by the RWA desk. Raise a new complaint if the issue is still there." : "Pending." },
  ];
  return (
    <div className="timeline">
      {rows.map((c, i) => (
        <div key={c.h} className={`tl-item ${i < idx ? "done" : i === idx ? "current" : ""}`}>
          <h5>{c.h}</h5>
          <p>{c.p}</p>
        </div>
      ))}
    </div>
  );
}

export default function Complaints() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState("all");
  const { data, loading, error, reload } = useFetch(() => api.complaints.list("mine"));

  // Success feedback after submitting a new complaint (?id=MG-B-0147)
  const freshId = params.get("id");
  useEffect(() => {
    if (!freshId) return;
    toast(`Complaint logged. Your ticket is ${freshId}.`);
    setParams({}, { replace: true });
  }, [freshId, toast, setParams]);

  if (loading && !data) return <Loading />;

  const mine = data || [];
  const count = (s) => mine.filter((t) => t.status === s).length;
  const list = filter === "all" ? mine : mine.filter((t) => t.status === filter);
  const pills = [
    ["all", "ALL", mine.length],
    ["Pending", "PENDING", count("Pending")],
    ["In progress", "IN PROGRESS", count("In progress")],
    ["Resolved", "RESOLVED", count("Resolved")],
  ];

  return (
    <>
      <div className="pagehead">
        <div className="pagehead-row">
          <div>
            <p className="tagline">Track every request</p>
            <h1>Your Complaints</h1>
          </div>
          <Link className="btn btn-lime" to="/new-complaint"><Icon name="plus" strokeWidth={2.2} /> NEW COMPLAINT</Link>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={reload} />

      <div className="pills">
        {pills.map(([key, label, n]) => (
          <button key={key} type="button" className={`pill ${filter === key ? "is-on" : ""}`} onClick={() => setFilter(key)}>
            {label} <span>{n}</span>
          </button>
        ))}
      </div>

      {list.length ? (
        list.map((t) => (
          <article className="ticket" key={t.id}>
            <div className="ticket-top">
              <div>
                <h4>{t.title}</h4>
                <div className="meta">
                  {t.id} · {t.cat} · {t.address} · raised {formatDate(t.ts)} · updated {formatDate(t.updatedTs)} · {t.urgency} priority
                </div>
              </div>
              <Badge status={t.status} />
            </div>
            {t.details && <p className="muted" style={{ fontSize: ".88rem" }}>{t.details}</p>}
            {t.hasPhoto && <ComplaintPhoto complaintId={t.id} />}
            <Timeline t={t} />
          </article>
        ))
      ) : (
        <EmptyState
          title={mine.length ? "Nothing in this filter" : "No complaints yet"}
          text={mine.length ? "Try another status filter." : "Raise a complaint and track it here from pending to resolved."}
          actionTo={mine.length ? undefined : "/new-complaint"}
          actionLabel="ADD COMPLAINT"
        />
      )}
    </>
  );
}
