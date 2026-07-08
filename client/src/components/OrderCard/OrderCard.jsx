import { Eye } from "lucide-react";
import "./module.css";

const statusColors = {
  Delivered: "delivered",
  Shipping: "shipping",
  Processing: "processing",
};

const OrderCard = ({ image, name, status, date, price, onViewDetails }) => {
  return (
    <div className="order-card" onClick={onViewDetails} style={{ cursor: "pointer" }}>
      <div className="order-card-img">
        <img src={image} alt={name} />
      </div>

      <div className="order-card-info">
        <h4 className="order-card-name">{name}</h4>
        <p className="order-card-price">₹{price}</p>
        <p className="order-card-date">{date}</p>
      </div>

      <div className="order-card-right">
        <span className={`order-status ${statusColors[status]}`}>
          {status}
        </span>
        <button className="order-view-btn" onClick={(e) => { e.stopPropagation(); onViewDetails(); }}>
          <Eye size={14} />
          View Details
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
