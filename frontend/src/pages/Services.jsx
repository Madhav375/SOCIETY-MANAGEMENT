import { useState } from "react";
import Badge from "../components/Badge.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import Icon from "../components/Icon.jsx";
import Loading from "../components/Loading.jsx";
import { useToast } from "../context/ToastContext.jsx";
import useFetch from "../hooks/useFetch.js";
import { api } from "../services/api.js";
import { OPEN_SERVICE_STATUSES, SERVICES } from "../utils/constants.js";
import { ago } from "../utils/format.js";

export default function Services() {
  const toast = useToast();
  const { data: booked, loading, error, reload, setData } = useFetch(api.services.mine);
  const [pending, setPending] = useState(""); // service id being requested

  if (loading && !booked) return <Loading />;

  const requests = booked || [];

  async function add(service) {
    setPending(service.id);
    try {
      const created = await api.services.create(service.id);
      setData((list) => [created, ...(list || [])]);
      toast(`${service.name} service added successfully.`);
    } catch (err) {
      toast(err.message);
      if (err.status === 409) reload(); // our list was out of date
    } finally {
      setPending("");
    }
  }

  return (
    <>
      <div className="pagehead">
        <p className="tagline">B Block &middot; Mayfield Gardens RWA</p>
        <h1>Book a Service</h1>
        <p className="lede">Trusted help for your own home — gardening, plumbing, electrical work and household support, arranged through RWA-approved staff and vendors.</p>
      </div>

      <ErrorBanner message={error} onRetry={reload} />

      <div className="svc-grid">
        {SERVICES.map((s) => {
          const latest = requests.find((x) => x.serviceId === s.id); // list is newest first
          const isOpen = latest && OPEN_SERVICE_STATUSES.includes(latest.status);
          const canRequestAgain = latest && !isOpen;
          const label = pending === s.id ? "ADDING…" : canRequestAgain ? "REQUEST AGAIN" : latest ? "SERVICE ADDED" : "ADD SERVICE";
          return (
            <article className="svc-card" key={s.id}>
              <span className="svc-ico" style={{ background: s.color }}><Icon name={s.ico} /></span>
              <h3>{s.name}</h3>
              <p>{s.desc}</p>
              <hr className="svc-divider" />
              <div className="svc-meta">
                <span><Icon name="phone" />{s.ext}</span>
                <span><Icon name="clock" />{s.hrs}</span>
              </div>
              {latest && <p className="muted" style={{ fontSize: ".82rem", margin: ".2rem 0 .6rem" }}>Status: <b>{latest.status}</b></p>}
              <button
                className={`svc-link svc-add-btn ${latest ? "service-added" : ""}`}
                type="button"
                disabled={Boolean(isOpen) || pending === s.id}
                onClick={() => add(s)}
              >
                {label} <Icon name={latest && !canRequestAgain ? "check" : "plus"} />
              </button>
            </article>
          );
        })}
      </div>

      <h2 style={{ fontSize: "1.15rem", margin: "2rem 0 .8rem" }}>Your Services &amp; Request History</h2>
      {requests.length ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Service</th><th>Status</th><th>Requested</th><th>Last update</th></tr>
            </thead>
            <tbody>
              {requests.map((x) => (
                <tr key={x.id}>
                  <td>{x.name}</td>
                  <td>
                    <Badge status={x.status} service />
                    {x.note && <div className="muted" style={{ fontSize: ".8rem", marginTop: ".3rem" }}>{x.note}</div>}
                  </td>
                  <td className="muted">{ago(x.addedAt)}</td>
                  <td className="muted">{ago(x.updatedAt || x.addedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted" style={{ fontSize: ".9rem" }}>You haven't added a service yet. Add one above and the RWA desk will pick it up.</p>
      )}
    </>
  );
}
