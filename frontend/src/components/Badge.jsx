import { STATUS_CLASS, SERVICE_STATUS_CLASS } from "../utils/constants.js";

export default function Badge({ status, service = false }) {
  const cls = (service ? SERVICE_STATUS_CLASS : STATUS_CLASS)[status] || "pending";
  return <span className={`badge b-${cls}`}>{String(status).toUpperCase()}</span>;
}
