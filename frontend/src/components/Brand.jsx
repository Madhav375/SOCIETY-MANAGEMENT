import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";

export default function Brand({ to }) {
  const inner = (
    <>
      <span className="brand-ico"><Icon name="building" /></span>
      <span>
        <b>Smart Society</b>
        <small>B Block &middot; Mayfield Gardens RWA</small>
      </span>
    </>
  );
  return to ? <Link className="brand" to={to}>{inner}</Link> : <div className="brand">{inner}</div>;
}
