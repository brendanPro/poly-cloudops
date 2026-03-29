import TopNavbar from '@/app/ui/TopNavbar';
import StatsCard from '@/app/ui/StatsCard';
import WorkflowCard from '@/app/ui/WorkflowCard';
import {getStats, getActiveWorkflows} from '@/lib/workflows';

export default function HomePage() {
  const stats = getStats();
  const activeWorkflows = getActiveWorkflows();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Hero Section */}
      <section className="gradient-hero-bg py-20 px-4">
        <div className="max-w-7xl mx-auto text-center text-white animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            Workflow Automation Hub
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Cloud native automation with n8n, serverless, and Dagger.io
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <StatsCard
            value={stats.total}
            label="Total Workflows"
            gradient="primary"
          />
          <StatsCard
            value={stats.active}
            label="Active Workflows"
            gradient="secondary"
          />
          <StatsCard
            value={stats.totalRuns}
            label="Total Runs"
            gradient="accent"
          />
        </div>
      </section>

      {/* Workflows Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Available Workflows
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          Choose a workflow to get started
        </p>

        {activeWorkflows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeWorkflows.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-100 dark:bg-gray-800 rounded-2xl">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No active workflows found.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
