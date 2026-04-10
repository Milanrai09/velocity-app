import Link from "next/link";
import { notFound } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";
import { 
  Rocket, 
  ExternalLink, 
  Calendar, 
  Package, 
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers
} from "lucide-react";
import DeployedSearch from "@/components/features/search/debounceSearch";

async function getUserDeployments() {
  const session = await auth0.getSession();

  const userId = session?.user?.sub;
  if (!userId) notFound();

  const deployments = await prisma.deployment.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return deployments;
}

function DeploymentCard({ deployment }) {
  // Mock status - replace with actual status from your DB
  const status = "active"; // or "building", "failed", etc.

  const statusConfig = {
    active: {
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      label: "Active"
    },
    building: {
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      label: "Building"
    },
    failed: {
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      label: "Failed"
    }
  };

  const StatusIcon = statusConfig[status]?.icon || CheckCircle2;
  const config = statusConfig[status] || statusConfig.active;

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return 'Just now';
  };

  return (
    <Link href={`/deployed/${deployment.id}`}>
      <div className="group bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {deployment.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="w-4 h-4" />
              <span className="font-medium">{deployment.projectSlug}</span>
            </div>
          </div>
          
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${config.border} ${config.bg}`}>
            <StatusIcon className={`w-3.5 h-3.5 ${config.color}`} />
            <span className={`text-xs font-semibold ${config.color}`}>
              {config.label}
            </span>
          </div>
        </div>

        {/* URL Preview */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-blue-600 font-mono truncate group-hover:text-blue-700">
              {deployment.proxyUrl}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{timeAgo(deployment.createdAt)}</span>
          </div>
          
          <div className="text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View details →
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-full p-6 mb-6">
        <Rocket className="w-16 h-16 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        No deployments yet
      </h2>
      <p className="text-gray-600 text-center max-w-md mb-8">
        Start by creating your first deployment. Deploy your projects and manage them all in one place.
      </p>
      <Link
        href="/deploy"
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
      >
        <Rocket className="w-5 h-5" />
        Create your first deployment
      </Link>
    </div>
  );
}

export default async function DeployedPage() {
  const deployments = await getUserDeployments();

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Deployments
              </h1>
              <p className="text-gray-600">
                Manage and monitor all your deployed projects
              </p>
            </div>

            <DeployedSearch/>
            
            {deployments.length > 0 && (
              <Link
                href="/deployment"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <Rocket className="w-4 h-4" />
                New Deployment
              </Link>
            )}
          </div>

          {/* Stats Bar */}
          {deployments.length > 0 && (
            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{deployments.length}</span> total deployment{deployments.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {!deployments.length ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deployments.map((deployment) => (
              <DeploymentCard key={deployment.id} deployment={deployment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}