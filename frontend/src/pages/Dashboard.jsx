import { Link } from "react-router-dom";
import Badge from "../components/Badge.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import Icon from "../components/Icon.jsx";
import Loading from "../components/Loading.jsx";
import StatCard from "../components/StatCard.jsx";
import useFetch from "../hooks/useFetch.js";
import { api } from "../services/api.js";
import { CAT_ICON } from "../utils/constants.js";
import { ago } from "../utils/format.js";

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch(api.dashboard);

  if (loading && !data) return <Loading />;
  if (!data) return <ErrorBanner message={error} onRetry={reload} />;

  const { resident, complaints, services, recentComplaints, activity } = data;
  return (
    <>
      <div className="pagehead">
        <div className="pagehead-row">
          <div>
            <p className="tagline">Welcome back,</p>
            <h1>{resident.name.split(" ")[0] || "Resident"}</h1>
            <p className="lede">Here is what is happening in B Block today.</p>
          </div>
          <Link className="btn btn-lime" to="/new-complaint"><Icon name="plus" strokeWidth={2.2} /> NEW COMPLAINT</Link>
        </div>
      </div>

      <ErrorBanner message={error} onRetry={reload} />

      <div className="stats">
        <StatCard variant="pending" value={complaints.pending} label="Pending" />
        <StatCard variant="progress" value={complaints.inProgress} label="In progress" />
        <StatCard variant="resolved" value={complaints.resolved} label="Resolved" />
        <StatCard variant="total" value={complaints.total} label="Total" />
      </div>

      <div className="sdg">
        <span className="sdg-ico"><Icon name="globe" /></span>
        <p><b>SDG 11 &mdash; Sustainable Cities &amp; Communities.</b> Every resolved complaint makes Mayfield Gardens a better place to live.</p>
      </div>

      <div className="sec-head">
        <h2>Recent complaints</h2>
        <Link className="view-all" to="/complaints">View all <Icon name="arrow_right" strokeWidth={2} /></Link>
      </div>
      {recentComplaints.length ? (
        recentComplaints.map((t) => (
          <div className="ticket-row" key={t.id}>
            <div className="t-left">
              <span className="t-ico"><Icon name={CAT_ICON[t.cat]} /></span>
              <div>
                <h4>{t.title}</h4>
                <div className="t-meta">{t.id} · {t.cat} · {ago(t.ts)}</div>
              </div>
            </div>
            <Badge status={t.status} />
          </div>
        ))
      ) : (
        <EmptyState title="No complaints yet" text="Spotted an issue in the society? Raise your first complaint." actionTo="/new-complaint" actionLabel="ADD COMPLAINT" />
      )}

      <div className="section">
        <div className="sec-head">
          <h2>Service requests</h2>
          <Link className="view-all" to="/services">
            {services.open} open of {services.total} <Icon name="arrow_right" strokeWidth={2} />
          </Link>
        </div>
        {services.recent.length ? (
          services.recent.map((s) => (
            <div className="ticket-row" key={s.id}>
              <div className="t-left">
                <span className="t-ico"><Icon name="wrench" /></span>
                <div>
                  <h4>{s.name}</h4>
                  <div className="t-meta">{s.category} · requested {ago(s.addedAt)}</div>
                </div>
              </div>
              <Badge status={s.status} service />
            </div>
          ))
        ) : (
          <p className="muted" style={{ fontSize: ".9rem" }}>No service requests yet. <Link to="/services" style={{ textDecoration: "underline", fontWeight: 700 }}>Browse services</Link></p>
        )}
      </div>

      <div className="section">
        <div className="sec-head"><h2>Recent activity</h2></div>
        {activity.length ? (
          <div className="card pad activity">
            {activity.map((a) => (
              <div className="activity-row" key={a.id}>
                <span>{a.message}</span>
                <span>{ago(a.ts)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted" style={{ fontSize: ".9rem" }}>Nothing yet. Updates on your complaints and services will show up here.</p>
        )}
      </div>
    </>
  );
}
