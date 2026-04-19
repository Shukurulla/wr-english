export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon className="w-12 h-12 text-faint mb-4" />}
      <h3 className="text-lg font-medium text-ink">{title}</h3>
      {description && <p className="text-sm text-muted mt-1 max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
