import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Tooltip,
  useMap,
} from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import { MapPin, Menu, X, Navigation, Loader } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import SearchBar from "../common/SearchBar.jsx";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// --- DISTRICT COORDINATES MAPPING ---
const DISTRICT_COORDINATES = {
  "Ernakulam": { lat: 9.9816, lng: 76.2999 },
  "Alappuzha": { lat: 9.4981, lng: 76.3388 },
  "Kollam": { lat: 8.8932, lng: 76.6141 },
  "Kozhikode": { lat: 11.2588, lng: 75.7804 },
  "Kannur": { lat: 11.8745, lng: 75.3704 },
  "Thrissur": { lat: 10.5276, lng: 76.2144 },
  "Bhopal": { lat: 23.2599, lng: 77.4126 },
  "Indore": { lat: 22.7196, lng: 75.8577 },
  "Jabalpur": { lat: 23.1815, lng: 79.9864 },
  "Gwalior": { lat: 26.2183, lng: 78.1828 },
  "Ujjain": { lat: 23.1765, lng: 75.7885 },
  "Sagar": { lat: 23.8388, lng: 78.7378 },
  "Dewas": { lat: 22.9676, lng: 76.0534 },
  "Satna": { lat: 24.6005, lng: 80.8322 },
  "Ratlam": { lat: 23.3315, lng: 75.0367 },
  "Rewa": { lat: 24.5362, lng: 81.3037 },
};



import { useAuth } from "../../contexts/AuthContext.jsx";

// ... (keep imports)

// ... (keep DISTRICT_COORDINATES)

// Helper to update map center
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const MapPage = () => {
  const { fetchWithAuth } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState([10.8505, 76.2711]); // Default Kerala center
  const [mapZoom, setMapZoom] = useState(7);
  const [userLocation, setUserLocation] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetchWithAuth(`${import.meta.env.VITE_BACKEND_URL || ''}/api/illnesses/count/district-wise`);
        if (!response.ok) {
          console.warn("API response not ok, using empty list");
          return [];
        }
        const data = await response.json();

        // Group by district
        const groupedData = {};
        data.forEach(item => {
          const district = item.district;
          if (!groupedData[district]) {
            groupedData[district] = {
              name: district,
              illnesses: [],
              totalCount: 0,
              hasHighCount: false
            };
          }
          groupedData[district].illnesses.push({
            name: item.illnessName,
            count: item.count
          });
          groupedData[district].totalCount += item.count;
          if (item.count >= 5) {
            groupedData[district].hasHighCount = true;
          }
        });

        // Map to locations with coordinates
        const locations = Object.values(groupedData).map((item, index) => {
          const coords = DISTRICT_COORDINATES[item.name];
          if (!coords) return null; // Skip if no coordinates found

          return {
            id: index + 1,
            name: item.name,
            description: item.illnesses.map(i => `${i.name}: ${i.count}`).join(', '),
            latitude: coords.lat,
            longitude: coords.lng,
            illnesses: item.illnesses,
            hasHighCount: item.hasHighCount
          };
        }).filter(Boolean);

        return locations;
      } catch (error) {
        console.error("Failed to fetch locations:", error);
        return [];
      }
    };

    const loadLocations = async () => {
      setLoading(true);
      const data = await fetchLocations();
      setLocations(data);
      // Center map on the first location initially
      if (data.length > 0) {
        setMapCenter([data[0].latitude, data[0].longitude]);
      }
      setLoading(false);
    };
    loadLocations();
  }, [fetchWithAuth]);

  const zoomToLocation = (location) => {
    setMapCenter([location.latitude, location.longitude]);
    setMapZoom(12);
    setSidebarOpen(false);
  };

  const locateUser = () => {
    setLocatingUser(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          setMapZoom(13);
          setLocatingUser(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocatingUser(false);
          alert("Unable to get your location. Check browser permissions.");
        }
      );
    } else {
      setLocatingUser(false);
      alert("Geolocation not supported.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading district data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col relative">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-lg border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="ml-4 flex items-center">
                <MapPin className="w-8 h-8 text-blue-600" />
                <h1 className="ml-2 text-xl font-bold text-gray-900">
                  District Disease Explorer
                </h1>
              </div>
            </div>
            <span className="text-sm text-gray-600">
              {locations.length} districts found
            </span>
          </div>
        </div>
      </nav>

      <div className="flex-1 relative">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Districts
                  </h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 mb-1">
                        {location.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {location.description}
                      </p>
                      <button
                        onClick={() => zoomToLocation(location)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700"
                      >
                        Zoom to Location
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "100%", width: "100%" }}
          className="z-10"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <ChangeMapView center={mapCenter} zoom={mapZoom} />

          <SearchBar onLocationSelect={zoomToLocation} locations={locations} />

          {locations.map((location) => (
            <React.Fragment key={location.id}>
              <Marker
                position={[location.latitude, location.longitude]}
              >
                <Popup>
                  <h3 className="font-semibold">{location.name}</h3>
                  <div className="text-sm mt-2">
                    {location.illnesses.map((illness, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{illness.name}:</span>
                        <span className="font-medium">{illness.count}</span>
                      </div>
                    ))}
                  </div>
                </Popup>
              </Marker>
              {/* Concentric circles for high disease count */}
              {location.hasHighCount && (
                <>
                  <Circle
                    center={[location.latitude, location.longitude]}
                    radius={2000}
                    pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.4, weight: 0 }}
                  >
                    <Tooltip sticky>
                      <div className="text-center">
                        <div className="font-bold text-red-600 mb-1">High Spread Zone</div>
                        {location.illnesses.map((illness, idx) => (
                          <div key={idx} className="text-xs text-gray-700">
                            {illness.name}: {illness.count}
                          </div>
                        ))}
                      </div>
                    </Tooltip>
                  </Circle>
                  <Circle
                    center={[location.latitude, location.longitude]}
                    radius={4000}
                    pathOptions={{ color: "orange", fillColor: "orange", fillOpacity: 0.2, weight: 0 }}
                  >
                    <Tooltip sticky>
                      <div className="text-center">
                        <div className="font-bold text-orange-600 mb-1">Medium Spread Zone</div>
                        {location.illnesses.map((illness, idx) => (
                          <div key={idx} className="text-xs text-gray-700">
                            {illness.name}: {illness.count}
                          </div>
                        ))}
                      </div>
                    </Tooltip>
                  </Circle>
                  <Circle
                    center={[location.latitude, location.longitude]}
                    radius={6000}
                    pathOptions={{ color: "yellow", fillColor: "yellow", fillOpacity: 0.1, weight: 0 }}
                  >
                    <Tooltip sticky>
                      <div className="text-center">
                        <div className="font-bold text-yellow-600 mb-1">Low Spread Zone</div>
                        {location.illnesses.map((illness, idx) => (
                          <div key={idx} className="text-xs text-gray-700">
                            {illness.name}: {illness.count}
                          </div>
                        ))}
                      </div>
                    </Tooltip>
                  </Circle>
                </>
              )}
            </React.Fragment>
          ))}

          {userLocation && (
            <Marker position={userLocation}>
              <Popup>You are here</Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Floating Button: Locate User */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={locateUser}
          disabled={locatingUser}
          className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-4 rounded-full shadow-lg"
        >
          {locatingUser ? (
            <Loader className="w-6 h-6 animate-spin" />
          ) : (
            <Navigation className="w-6 h-6" />
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default MapPage;
