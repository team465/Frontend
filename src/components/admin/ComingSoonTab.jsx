export default function ComingSoonTab({ title, description, icon = '🚧' }) {
  return (
    <div className="adm-tab-body">
      <div className="adm-tab-header">
        <div>
          <h2 className="adm-page-title">{title}</h2>
        </div>
      </div>
      <div className="adm-coming-soon">
        <span className="adm-coming-icon">{icon}</span>
        <h3>{title}</h3>
        <p>{description}</p>
        <span className="adm-coming-badge">In Development</span>
      </div>
    </div>
  );
}
