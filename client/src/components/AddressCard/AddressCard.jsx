import { MapPin, Pencil, Trash2 } from "lucide-react";
import "./module.css";

const AddressCard = ({ id, label, address, isDefault, onDelete, onEdit }) => {
  return (
    <div className={`address-card ${isDefault ? "default" : ""}`}>
      <div className="address-card-header">
        <div className="address-label-row">
          <MapPin size={16} className="address-icon" />
          <span className="address-label">{label}</span>
        </div>
        {isDefault && <span className="address-badge">Default</span>}
      </div>

      <p className="address-text">{address}</p>

      <div className="address-actions">
        <button className="address-btn edit" onClick={() => onEdit && onEdit(id)}>
          <Pencil size={14} />
          Edit
        </button>
        <button className="address-btn delete" onClick={() => onDelete && onDelete(id)}>
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  );
};

export default AddressCard;
