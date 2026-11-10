import React from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ShieldCheck, ArrowRight, Briefcase } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-[#006B61] flex items-center justify-center p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {/* Hospital Portal Card */}
        <div
          onClick={() => navigate("/hospitallogin")}
          className="bg-white rounded-3xl p-8 cursor-pointer hover:scale-[1.02] transition-transform duration-300 relative group"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center border border-teal-100">
              <Building2 className="w-7 h-7 text-[#006B61]" />
            </div>
            <span className="px-4 py-1.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
              For Healthcare Providers
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Hospital Portal
          </h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Access patient records, manage appointments, and upload medical reports securely.
          </p>
          <div className="flex items-center text-[#006B61] font-bold text-sm group-hover:gap-2 transition-all">
            Enter Portal <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Employer Portal Card */}
        <div
          onClick={() => navigate("/employer")}
          className="bg-white rounded-3xl p-8 cursor-pointer hover:scale-[1.02] transition-transform duration-300 relative group"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100">
              <Briefcase className="w-7 h-7 text-purple-600" />
            </div>
            <span className="px-4 py-1.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
              For Employers
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Employer Portal
          </h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Manage workforce, search for workers, and monitor health compliance.
          </p>
          <div className="flex items-center text-purple-600 font-bold text-sm group-hover:gap-2 transition-all">
            Enter Portal <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Admin Portal Card */}
        <div
          onClick={() => navigate("/adminlogin")}
          className="bg-white rounded-3xl p-8 cursor-pointer hover:scale-[1.02] transition-transform duration-300 relative group"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
              <ShieldCheck className="w-7 h-7 text-[#0F172A]" />
            </div>
            <span className="px-4 py-1.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
              For Administrators
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Admin Portal
          </h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Monitor system health, manage registrations, and analyze comprehensive health data.
          </p>
          <div className="flex items-center text-[#0F172A] font-bold text-sm group-hover:gap-2 transition-all">
            Enter Portal <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
