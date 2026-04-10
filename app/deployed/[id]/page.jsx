import Link from "next/link";
import { notFound } from "next/navigation";
import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ExternalLink, Calendar, Package, Globe, CheckCircle2 } from "lucide-react";
import CopyButton from "./CopyButton";

async function getDeploymentForCurrentUser(deploymentId) {
  const session = await auth0.getSession();
  const userId = session?.user?.sub;

  if (!userId) notFound();

  const deployment = await prisma.deployment.findFirst({
    where: {
      id: deploymentId,
      userId,
    },
  });

  if (!deployment) {
    notFound();
  }

  return deployment;
}

export default async function DeploymentDetailPage({ params }) {
  const { id } = await params;
  const deployment = await getDeploymentForCurrentUser(id);

  // Mock status - you can replace this with actual deployment status from your DB
  const status = "active"; // or "building", "failed", etc.

  const statusStyles = {
    active: "bg-green-100 text-green-800 border-green-200",
    building: "bg-yellow-100 text-yellow-800 border-yellow-200",
    failed: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link
            href="/deployed"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Deployments</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {deployment.name}
              </h1>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${
                    statusStyles[status] || statusStyles.active
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Project Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Project
              </h2>
            </div>
            <p className="text-xl font-semibold text-gray-900">
              {deployment.projectSlug}
            </p>
          </div>

          {/* Created Date Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Created
              </h2>
            </div>
            <p className="text-xl font-semibold text-gray-900">
              {new Date(deployment.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(deployment.createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* URL Card - Full Width */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Deployment URL
            </h2>
          </div>
          
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
            <a
              href={deployment.proxyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-blue-600 hover:text-blue-700 font-mono text-sm break-all group"
            >
              {deployment.proxyUrl}
            </a>
            <div className="flex items-center gap-2 shrink-0">
              <CopyButton text={deployment.proxyUrl} />
              <a
                href={deployment.proxyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-100 rounded-md transition-colors group"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </a>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Deployment Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Deployment ID</span>
              <span className="text-gray-900 font-mono text-sm">{deployment.id}</span>
            </div>
            {/* Add more deployment details here as needed */}
          </div>
        </div>
      </div>
    </div>
  );
}