import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";

export default function EmptyState({ title, text, actionTo, actionLabel }) {
  return (
    <div className="empty">
      <div className="ic-wrap"><Icon name="inbox" strokeWidth={1.6} /></div>
      <h3>{title}</h3>
      <p>{text}</p>
      {actionTo && (
        <Link className="btn btn-lime" to={actionTo}>
          <Icon name="plus" strokeWidth={2.2} /> {actionLabel}
        </Link>
      )}
    </div>
  );
}
