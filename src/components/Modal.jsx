export default function Modal({ title, subtitle, children, onClose, actions }) {
  return (
    <div className="cyp-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="cyp-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="cyp-modal-title">{title}</h3>
        {subtitle && <p className="cyp-modal-sub">{subtitle}</p>}
        {children}
        {actions && <div className="cyp-modal-actions">{actions}</div>}
      </div>
    </div>
  );
}
