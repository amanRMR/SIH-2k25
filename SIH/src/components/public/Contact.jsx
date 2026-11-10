import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <section className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        
        {/* Page Heading */}
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-10">
          Contact Us
        </h2>

        {/* Contact Info + Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-6 flex items-start space-x-4">
              <Mail className="text-blue-600 w-8 h-8" />
              <div>
                <h3 className="font-semibold text-lg">Email</h3>
                <p className="text-gray-600">support@migranthealth.org</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 flex items-start space-x-4">
              <Phone className="text-green-600 w-8 h-8" />
              <div>
                <h3 className="font-semibold text-lg">Phone</h3>
                <p className="text-gray-600">+91 98765 43210</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 flex items-start space-x-4">
              <MapPin className="text-red-600 w-8 h-8" />
              <div>
                <h3 className="font-semibold text-lg">Address</h3>
                <p className="text-gray-600">
                  Migrant Health HQ,<br />
                  New Delhi, India
                </p>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="bg-white rounded-2xl shadow p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Send us a message
            </h3>
            <form className="space-y-5">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none p-3"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block  text-gray-700 text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none p-3"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Message
                </label>
                <textarea
                  rows="4"
                  className="w-full rounded-lg border border-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none p-3"
                  placeholder="Write your message..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
