import React from "react";
import { motion } from "framer-motion";
import { Users, HeartPulse, Globe, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold"
        >
          About Our Project
        </motion.h1>
        <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
          Bridging healthcare gaps for migrant workers through multilingual,
          inclusive, and digital health solutions.
        </p>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto py-12 px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mission Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow p-6"
        >
          <Target className="text-blue-600 w-10 h-10 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
          <p className="text-gray-600">
            To empower every migrant worker with accessible and secure digital
            health records, ensuring continuity of care across regions and
            languages.
          </p>
        </motion.div>

        {/* Vision Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow p-6"
        >
          <Globe className="text-green-600 w-10 h-10 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Our Vision</h2>
          <p className="text-gray-600">
            A healthier and more inclusive India where healthcare services are
            equally accessible to all, regardless of language or origin.
          </p>
        </motion.div>

        {/* Team Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow p-6"
        >
          <Users className="text-purple-600 w-10 h-10 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Our Team</h2>
          <p className="text-gray-600">
            A passionate group of innovators skilled in MERN, AI/ML, and DevOps,
            working together to create solutions for Smart India Hackathon.
          </p>
        </motion.div>

        {/* SDG Alignment Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl shadow p-6"
        >
          <HeartPulse className="text-red-600 w-10 h-10 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Aligned with SDGs</h2>
          <p className="text-gray-600">
            Our solution contributes to{" "}
            <span className="font-medium">SDG 3 (Good Health)</span> and{" "}
            <span className="font-medium">SDG 10 (Reduced Inequalities)</span>,
            ensuring better health access for all.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
