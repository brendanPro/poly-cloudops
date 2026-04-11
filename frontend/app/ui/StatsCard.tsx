interface StatsCardProps {
  value: number | string;
  label: string;
  gradient?: 'primary' | 'secondary' | 'accent';
  icon?: React.ReactNode;
}

export default function StatsCard({value, label, gradient = 'primary', icon}: StatsCardProps) {
  const gradients = {
    primary: 'gradient-primary-bg',
    secondary: 'gradient-secondary-bg',
    accent: 'gradient-accent-bg'
  };

  return (
    <div className={`${gradients[gradient]} rounded-2xl p-6 text-white shadow-glow transform hover:scale-105 transition-all duration-300 animate-fade-in`}>
      {icon && <div className="mb-2 text-2xl">{icon}</div>}
      <div className="text-4xl font-bold mb-2">{value}</div>
      <div className="text-sm opacity-90 font-medium uppercase tracking-wider">{label}</div>
    </div>
  );
}
