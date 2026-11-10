import React from "react";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <div>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-6 w-6" />
                <span className="font-bold">Swaasth Setu</span>
              </div>
              <p className="text-gray-400 text-sm">
                Government of India initiative for migrant worker health records
                management.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/about" className="hover:text-white">
                    About Portal
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white">
                    Terms of Use
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link to="/guide" className="hover:text-white">
                    User Guide
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="hover:text-white">
                    Technical Support
                  </Link>
                </li>

              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Helpline: 1800-XXX-XXXX</p>
                <p>Email: support@Swaasthsetu.gov.in</p>
                <p>Available 24/7</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-4 text-center text-sm text-gray-400">
            © 2024 Government of India. All rights reserved. | Powered by
            National Health Authority
          </div>
        </div>
      </footer>
    </div>
  );
}
