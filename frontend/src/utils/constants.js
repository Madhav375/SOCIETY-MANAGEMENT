export const CAT_ICON = {
  Maintenance: "wrench",
  Water: "droplet",
  Electricity: "bolt",
  Cleanliness: "sparkle",
  Security: "shield",
  Other: "circle_x",
};
export const CAT_DOT = {
  Maintenance: "#BF9552",
  Water: "#4C7EA8",
  Electricity: "#C9A63C",
  Cleanliness: "#3F9D82",
  Security: "#7C7CA0",
  Other: "#8A94A0",
};
export const CATEGORIES = ["Maintenance", "Water", "Electricity", "Cleanliness", "Security", "Other"];
export const URGENCIES = ["Low", "Medium", "High"];

export const STATUS_ORDER = ["Pending", "In progress", "Resolved"];
export const STATUS_CLASS = { Pending: "pending", "In progress": "progress", Resolved: "resolved" };
export const SERVICE_STATUS_ORDER = ["Requested", "In progress", "Provided", "Completed", "Cancelled"];
export const SERVICE_STATUS_CLASS = {
  Requested: "pending",
  "In progress": "progress",
  Provided: "resolved",
  Completed: "resolved",
  Cancelled: "pending",
};
export const OPEN_SERVICE_STATUSES = ["Requested", "In progress"];

// Catalogue shown on the Services page (content, not user data).
export const SERVICES = [
  { id: "gardening", ico: "leaf", color: "#3F9D82", name: "Gardening", desc: "Lawn mowing, plant care, potted garden setup and balcony greenery at your address.", ext: "RWA Approved Vendor · Ext. 26", hrs: "Book 1 day ahead", cat: "Maintenance" },
  { id: "plumbing", ico: "wrench", color: "#4C7EA8", name: "Plumbing", desc: "Tap and pipe leaks, blocked drains, flush tank and geyser fitting inside your home.", ext: "RWA Office · Ext. 21", hrs: "Same day, within 4 hrs", cat: "Water" },
  { id: "electricity", ico: "bolt", color: "#C9A63C", name: "Electricity", desc: "Switchboards, fans, wiring faults and appliance fittings inside your home.", ext: "RWA Office · Ext. 22", hrs: "Same day, within 4 hrs", cat: "Electricity" },
  { id: "househelp", ico: "sparkle", color: "#7C7CA0", name: "Househelp", desc: "Verified maid, cook or part-time help for daily housework, booked through the RWA.", ext: "RWA Approved Staff · Ext. 27", hrs: "Book 1 day ahead", cat: "Cleanliness" },
];

export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
