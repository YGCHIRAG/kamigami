import "./module.css";

const StatCard = ({ icon: Icon, label, value }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrapper">
        <Icon size={22} />
      </div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-glow"></div>
    </div>
  );
};

export default StatCard;
