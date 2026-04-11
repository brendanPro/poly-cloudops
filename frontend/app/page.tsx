import Link from 'next/link';
import { getActiveWorkflows } from '@/lib/workflows';
import WorkflowCard from '@/app/ui/WorkflowCard';

export default function HomePage() {
  const workflows = getActiveWorkflows();

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Hero */}
      <section className="gradient-hero-bg py-24 px-4">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <p className="section-label text-slate-400 mb-4">Polytech Angers — Cloud Native DevOps</p>
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-5 leading-tight">
            Workflow Automation Hub
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Cloud-native automation powered by n8n and serverless infrastructure on GCP.
          </p>
        </div>
      </section>

      {/* Workflows grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
            Available Workflows
          </h2>
          <p style={{ color: 'var(--foreground-muted)' }}>
            {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} ready to use
          </p>
        </div>

        {workflows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-20 rounded-2xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p style={{ color: 'var(--foreground-muted)' }}>No active workflows found.</p>
          </div>
        )}
      </section>
    </div>
  );
}
