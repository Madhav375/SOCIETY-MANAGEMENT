import { useState } from "react";
import ComplaintPhoto from "../components/ComplaintPhoto.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import Loading from "../components/Loading.jsx";
import NoteEditor from "../components/NoteEditor.jsx";
import StatCard from "../components/StatCard.jsx";
import { useToast } from "../context/ToastContext.jsx";
import useFetch from "../hooks/useFetch.js";
import { api } from "../services/api.js";
import { CAT_DOT, SERVICE_STATUS_ORDER, STATUS_ORDER } from "../utils/constants.js";
import { ago, formatDate } from "../utils/format.js";

// One request loads everything the desk needs.
const loadDesk = async () => {
  const [stats, complaints, services, users] = await Promise.all([
    api.admin.dashboard(),
    api.complaints.list("all"),
    api.services.all(),
    api.admin.users(),
  ]);
  return { stats, complaints, services, users };
};

export default function AdminDashboard() {
  const toast = useToast();
  const { data, loading, error, reload, setData } = useFetch(loadDesk);
  const [fStatus, setFStatus] = useState("all");
  const [fCat, setFCat] = useState("all");
  const [sStatus, setSStatus] = useState("all");
  const [sCat, setSCat] = useState("all");

  if (loading && !data) return <Loading />;
  if (!data) return <ErrorBanner message={error} onRetry={reload} />;

  const { stats, complaints, services, users } = data;

  // Replace one record locally, then refresh the aggregate numbers from the server.
  const refreshStats = () => api.admin.dashboard().then((s) => setData((d) => ({ ...d, stats: s }))).catch(() => {});
  const patchComplaint = (c) => setData((d) => ({ ...d, complaints: d.complaints.map((x) => (x.id === c.id ? c : x)) }));
  const patchService = (s) => setData((d) => ({ ...d, services: d.services.map((x) => (x.id === s.id ? s : x)) }));

  async function updateComplaint(id, patch, okMessage) {
    try {
      const c = await api.complaints.update(id, patch);
      patchComplaint(c);
      refreshStats();
      toast(okMessage(c));
    } catch (err) {
      toast(err.message);
      reload();
    }
  }
  async function updateService(id, patch, okMessage) {
    try {
      const s = await api.services.update(id, patch);
      patchService(s);
      refreshStats();
      toast(okMessage(s));
    } catch (err) {
      toast(err.message);
      reload();
    }
  }

  async function resetDemo() {
    if (!window.confirm("Add the sample demo complaints that are missing? Existing complaints are kept.")) return;
    try {
      const r = await api.admin.resetDemo();
      toast(r.added ? `${r.added} demo records added.` : "Demo data is already loaded.");
      reload();
    } catch (err) {
      toast(err.message);
    }
  }

  const cats = [...new Set(complaints.map((t) => t.cat))];
  const rows = complaints.filter((t) => (fStatus === "all" || t.status === fStatus) && (fCat === "all" || t.cat === fCat));
  const svcCats = [...new Set(services.map((s) => s.category))];
  const svcRows = services.filter((s) => (sStatus === "all" || s.status === sStatus) && (sCat === "all" || s.category === sCat));

  const c = stats.complaints;
  const sv = stats.services;
  const maxCat = Math.max(1, ...c.byCategory.map((x) => x.count));

  return (
    <>
      <div className="pagehead">
        <p className="tagline">RWA staff desk</p>
        <h1>Admin</h1>
        <p className="lede">Every complaint for B Block, plus the services members have added. Change a status and the resident sees it update on their side. Only members can add services; the desk provides them.</p>
      </div>

      <ErrorBanner message={error} onRetry={reload} />

      <div className="stats">
        <StatCard variant="pending" value={c.pending} label="Pending" />
        <StatCard variant="progress" value={c.inProgress} label="In progress" />
        <StatCard variant="resolved" value={c.resolved} label="Resolved" />
        <StatCard variant="total" value={c.total} label="Total" />
      </div>

      <div className="two-col">
        <div>
          <div className="table-toolbar">
            <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} aria-label="Filter complaints by status">
              <option value="all">All statuses</option>
              {STATUS_ORDER.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={fCat} onChange={(e) => setFCat(e.target.value)} aria-label="Filter complaints by category">
              <option value="all">All categories</option>
              {cats.map((x) => <option key={x}>{x}</option>)}
            </select>
            <button className="btn btn-outline btn-sm" type="button" onClick={resetDemo}>Reset demo data</button>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Ticket</th><th>Issue</th><th>Address</th><th>Status</th></tr>
              </thead>
              <tbody>
                {rows.length ? rows.map((t) => (
                  <tr key={t.id}>
                    <td className="idcell"><span className="catdot" style={{ background: CAT_DOT[t.cat] }} />{t.id}</td>
                    <td>
                      {t.title}
                      <div className="muted" style={{ fontSize: ".8rem" }}>
                        {t.cat} · {t.urgency} · {t.resident} · {formatDate(t.ts)}
                      </div>
                      {t.details && <div className="muted" style={{ fontSize: ".8rem", marginTop: ".2rem" }}>{t.details}</div>}
                      {t.hasPhoto && <ComplaintPhoto complaintId={t.id} />}
                      <NoteEditor value={t.note} onSave={(note) => updateComplaint(t.id, { note }, () => `Note saved on ${t.id}.`)} />
                    </td>
                    <td>{t.address}</td>
                    <td>
                      <select
                        value={t.status}
                        aria-label={`Status of ${t.id}`}
                        onChange={(e) => updateComplaint(t.id, { status: e.target.value }, (u) => `${u.id} marked ${u.status.toLowerCase()}.`)}
                      >
                        {STATUS_ORDER.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4"><div className="empty" style={{ border: 0 }}><h3>Nothing here</h3><p>{complaints.length ? "Clear a filter to see other complaints." : "No complaints have been raised yet."}</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>

          <h2 style={{ fontSize: "1.15rem", margin: "1.8rem 0 .8rem" }}>Service requests</h2>
          <p className="muted" style={{ fontSize: ".88rem", marginBottom: ".8rem" }}>Added by members. The desk can only provide them &mdash; it cannot add services.</p>
          <div className="stats">
            <StatCard variant="pending" value={sv.requested} label="Requested" />
            <StatCard variant="progress" value={sv.inProgress} label="In progress" />
            <StatCard variant="resolved" value={sv.provided} label="Provided" />
            <StatCard variant="total" value={sv.total} label="Total" />
          </div>
          <div className="table-toolbar">
            <select value={sStatus} onChange={(e) => setSStatus(e.target.value)} aria-label="Filter services by status">
              <option value="all">All statuses</option>
              {SERVICE_STATUS_ORDER.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={sCat} onChange={(e) => setSCat(e.target.value)} aria-label="Filter services by category">
              <option value="all">All categories</option>
              {svcCats.map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Service</th><th>Added by</th><th>Address</th><th>Added</th><th>Updated</th><th>Status</th></tr>
              </thead>
              <tbody>
                {svcRows.length ? svcRows.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.name}
                      <div className="muted" style={{ fontSize: ".8rem" }}>{s.category}</div>
                      <NoteEditor value={s.note} onSave={(note) => updateService(s.id, { note }, () => `Note saved on ${s.name} request.`)} />
                    </td>
                    <td>{s.addedBy}</td>
                    <td>{s.address}</td>
                    <td className="muted">{ago(s.addedAt)}</td>
                    <td className="muted">{ago(s.updatedAt || s.addedAt)}</td>
                    <td>
                      <select
                        value={s.status}
                        aria-label={`Status of ${s.name} for ${s.addedBy}`}
                        onChange={(e) => updateService(s.id, { status: e.target.value }, (u) => `${u.name} for ${u.addedBy} marked ${u.status.toLowerCase()}.`)}
                      >
                        {SERVICE_STATUS_ORDER.map((x) => <option key={x}>{x}</option>)}
                      </select>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6"><div className="empty" style={{ border: 0 }}><h3>No service requests</h3><p>Services added by members will appear here.</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>

          <h2 style={{ fontSize: "1.15rem", margin: "1.8rem 0 .8rem" }}>Residents</h2>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Name</th><th>Address</th><th>Phone</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {users.length ? users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.address}</td>
                    <td className="muted">{u.phone || "—"}</td>
                    <td className="muted">{formatDate(u.joinedAt)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4"><div className="empty" style={{ border: 0 }}><h3>No residents yet</h3></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside>
          <div className="card pad" style={{ marginBottom: "1.1rem" }}>
            <h3 style={{ fontSize: "1.02rem", marginBottom: "1rem" }}>Where complaints come from</h3>
            <div className="bars">
              {c.byCategory.length ? c.byCategory.map((x) => (
                <div className="bar-row" key={x.category}>
                  <span>{x.category}</span>
                  <span className="bar-track"><span className="bar-fill" style={{ width: `${Math.round((x.count / maxCat) * 100)}%`, background: CAT_DOT[x.category] }} /></span>
                  <b>{x.count}</b>
                </div>
              )) : <p className="muted" style={{ fontSize: ".88rem" }}>No complaints yet.</p>}
            </div>
          </div>
          <div className="card pad" style={{ marginBottom: "1.1rem" }}>
            <h3 style={{ fontSize: "1.02rem", marginBottom: ".6rem" }}>Oldest still open</h3>
            <p className="muted" style={{ fontSize: ".88rem" }}>
              {c.oldestOpen ? (
                <>
                  <b style={{ color: "var(--ink)" }}>{c.oldestOpen.id}</b> — {c.oldestOpen.title}<br />
                  Open since {ago(c.oldestOpen.ts)}, at {c.oldestOpen.address}.
                </>
              ) : "Nothing pending. The block is clear."}
            </p>
          </div>
          <div className="card pad">
            <h3 style={{ fontSize: "1.02rem", marginBottom: ".6rem" }}>Residents registered</h3>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "2rem", fontWeight: 700 }}>{stats.residents}</p>
          </div>
        </aside>
      </div>
    </>
  );
}
