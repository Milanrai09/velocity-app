'use client'

import SocketDebug from '@/components/socket/socketLog'
import { useState } from 'react'
import { useUser } from "@auth0/nextjs-auth0/client";
import { 
  Rocket, 
  Github, 
  Package, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Loader2,
  Sparkles
} from "lucide-react";
import Link from 'next/link';

export default function DeploymentPage() {
    const [gitURL, setGitURL] = useState('')
    const [deploymentType, setDeploymentType] = useState('react')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(null)
    const [name, setName] = useState('')
    const { user, isLoading } = useUser();
    const activeLogChannel = success?.data?.projectSlug || null;

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess(null)
        setLoading(true)

        try {
            const response = await fetch('/api/api-server', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    gitURL,
                    deploymentType,
                    projectId: user.name,
                    userId: user.sub,
                    deploymentName: name
                })
            })

            if (!response.ok) {
                throw new Error('Deployment failed')
            }

            const data = await response.json()
            setSuccess(data)
            setGitURL('')
            setName('')
            setDeploymentType('react')
        } catch (err) {
            setError(err.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Rocket className="w-6 h-6 text-blue-600" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    New Deployment
                                </h1>
                            </div>
                            <p className="text-gray-600">
                                Deploy your project to production in minutes
                            </p>
                        </div>
                        
                        <Link
                            href="/deployed"
                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            View all deployments →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Deployment Configuration Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-purple-50 rounded-lg">
                                        <Package className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Deployment Configuration
                                    </h2>
                                </div>

                                <div className="space-y-5">
                                    {/* Deployment Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Deployment Name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="My Awesome App"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                                        />
                                        <p className="mt-1.5 text-xs text-gray-500">
                                            A friendly name to identify your deployment
                                        </p>
                                    </div>

                                    {/* Git URL */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Repository URL
                                        </label>
                                        <div className="relative">
                                            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="url"
                                                placeholder="https://github.com/username/repo"
                                                value={gitURL}
                                                onChange={(e) => setGitURL(e.target.value)}
                                                required
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                                            />
                                        </div>
                                        <p className="mt-1.5 text-xs text-gray-500">
                                            GitHub repository URL for your project
                                        </p>
                                    </div>

                                    {/* Framework Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Framework
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setDeploymentType('react')}
                                                className={`p-4 rounded-lg border-2 transition-all ${
                                                    deploymentType === 'react'
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                        deploymentType === 'react' ? 'bg-blue-100' : 'bg-gray-100'
                                                    }`}>
                                                        <span className="text-xl">⚛️</span>
                                                    </div>
                                                    <span className={`font-semibold text-sm ${
                                                        deploymentType === 'react' ? 'text-blue-700' : 'text-gray-700'
                                                    }`}>
                                                        React
                                                    </span>
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setDeploymentType('nextjs')}
                                                className={`p-4 rounded-lg border-2 transition-all ${
                                                    deploymentType === 'nextjs'
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                        deploymentType === 'nextjs' ? 'bg-blue-100' : 'bg-gray-100'
                                                    }`}>
                                                        <span className="text-xl">▲</span>
                                                    </div>
                                                    <span className={`font-semibold text-sm ${
                                                        deploymentType === 'nextjs' ? 'text-blue-700' : 'text-gray-700'
                                                    }`}>
                                                        Next.js
                                                    </span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-semibold text-red-900 mb-1">
                                                Deployment Failed
                                            </h3>
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Success Message */}
                            {success && (
                                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                                    <div className="flex items-start gap-3 mb-4">
                                        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-bold text-green-900 text-lg mb-1">
                                                Deployment Queued Successfully!
                                            </h3>
                                            <p className="text-sm text-green-700">
                                                Your project is now in the deployment queue
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3 mt-4">
                                        <div className="bg-white rounded-lg p-3 border border-green-200">
                                            <p className="text-xs font-semibold text-gray-500 mb-1">PROJECT SLUG</p>
                                            <p className="font-mono text-sm text-gray-900">{success.data.projectSlug}</p>
                                        </div>
                                        
                                        <div className="bg-white rounded-lg p-3 border border-green-200">
                                            <p className="text-xs font-semibold text-gray-500 mb-1">DEPLOYMENT URL</p>
                                            <a 
                                                href={success.data.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-mono text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2 break-all"
                                            >
                                                {success.data.url}
                                                <ExternalLink className="w-4 h-4 shrink-0" />
                                            </a>
                                        </div>
                                    </div>

                                    <Link
                                        href="/deployed"
                                        className="mt-4 inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold text-sm"
                                    >
                                        View all deployments →
                                    </Link>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Deploying...</span>
                                    </>
                                ) : (
                                    <>
                                        <Rocket className="w-5 h-5" />
                                        <span>Deploy Now</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Info Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Tips Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-yellow-500" />
                                <h3 className="font-bold text-gray-900">Quick Tips</h3>
                            </div>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    <span>Make sure your repository is public or you have access configured</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    <span>The deployment process typically takes 2-5 minutes</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    <span>You'll receive real-time updates via WebSocket</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    <span>Check the logs below for detailed build information</span>
                                </li>
                            </ul>
                        </div>

                        {/* Supported Frameworks */}
                        <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-3">Supported Frameworks</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                    <span>React (CRA & Vite)</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                    <span>Next.js (App & Pages Router)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Socket Debug Logs */}
                {activeLogChannel && (
                    <div className="mt-6">
                        <SocketDebug channel={activeLogChannel} />
                    </div>
                )}
            </div>
        </div>
    )
}