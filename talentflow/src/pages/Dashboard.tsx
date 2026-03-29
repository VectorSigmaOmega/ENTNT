import { Link } from "react-router-dom";
import { Briefcase, Users, ArrowRight } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome back! Here is an overview of your hiring pipeline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Active Jobs</h3>
            <Briefcase className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">25</p>
          <div className="mt-4">
            <Link to="/jobs" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Manage Jobs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Total Candidates</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">1,000+</p>
          <div className="mt-4">
            <Link to="/candidates" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View Candidates <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}