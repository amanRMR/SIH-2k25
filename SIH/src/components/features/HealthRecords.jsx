import React, { useState, useMemo, useEffect } from "react";
import { Search, Filter, Edit, Eye, Flag, Download, ChevronDown, Plus } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";

const backendUrl = String(import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");

const statesList = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const statesAndDistricts = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley", "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"],
  "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan", "Kamrup", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Dima Hasao", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
  "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
  "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariyaband", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udepur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
  "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
  "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
  "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
  "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
  "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
  "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
  "Mizoram": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"],
  "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
  "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Nawanshahr", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Tarn Taran"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
  "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
  "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal", "Nagarkurnool", "Nalgonda", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
  "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
  "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],
  "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Jammu and Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
  "Ladakh": ["Kargil", "Leh"],
  "Lakshadweep": ["Lakshadweep"],
  "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"]
};

const chronicConditionOptions = [
  "Hypertension",
  "Diabetes",
  "Asthma",
  "COPD",
  "Heart Disease",
  "Thyroid Disorders",
  "Chronic Kidney Disease (CKD)",
  "Other"
];

const allergyOptions = [
  "Penicillin",
  "Peanuts",
  "Dust Mites",
  "Pollen",
  "Milk",
  "Eggs",
  "Wheat",
  "Insect Stings",
  "Other"
];

const emptyForm = {
  id: null,
  aadhaar: "",
  password: "",
  name: "",
  age: "",
  dob: "",
  gender: "",
  bloodGroup: "",
  heightCm: "",
  weightKg: "",
  contact: { phone: "", email: "" },
  originState: "",
  currentState: "",
  address: { local: "", district: "", pincode: "" },
  emergencyContact: [],
  appointment: [],
  healthRecords: {
    prescriptions: [],
    labReports: [],
    immunizations: [],
    allergies: [],
    chronicConditions: [],
  },
  illnesses: [],
  languagePreference: "English",
  occupation: "",
  consentGiven: true,
};

const calculateAge = (dob) => {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Simple inline editors for arrays
// Simple inline editors for arrays
const ArrayChips = ({ items = [], onChange, placeholder, options }) => {
  const [val, setVal] = useState("");
  const [isOther, setIsOther] = useState(false);

  const handleAdd = (value) => {
    const trimmed = value?.trim();
    if (!trimmed) return;
    if (!items.includes(trimmed)) {
      onChange([...items, trimmed]);
    }
    setVal("");
    setIsOther(false);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((x, idx) => (
          <span key={idx} className="px-3 py-1 bg-teal-50 text-teal-800 rounded-full text-sm font-medium flex items-center shadow-sm border border-teal-100">
            {x}
            <button className="ml-2 text-teal-600 hover:text-teal-800 font-bold focus:outline-none" onClick={() => onChange(items.filter((_, i) => i !== idx))}>×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        {options && !isOther ? (
          <select
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder-gray-400 text-sm bg-white"
            value={val}
            onChange={(e) => {
              if (e.target.value === "Other") {
                setIsOther(true);
                setVal("");
              } else {
                handleAdd(e.target.value);
              }
            }}
          >
            <option value="">{placeholder || "Select..."}</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <>
            <input
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder-gray-400 text-sm"
              placeholder={isOther ? "Specify condition..." : placeholder}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd(val);
                }
              }}
              autoFocus={isOther}
            />
            <button
              type="button"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-900/10 text-sm font-medium transition-all"
              onClick={() => handleAdd(val)}
            >
              Add
            </button>
            {isOther && (
              <button
                type="button"
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all"
                onClick={() => {
                  setIsOther(false);
                  setVal("");
                }}
                title="Cancel"
              >
                ✕
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const ListEditor = ({ title, items, fields, onChange }) => {
  const emptyItem = Object.fromEntries(fields.map((f) => [f.name, ""]));
  const addItem = () => onChange([...(items || []), emptyItem]);
  const update = (i, key, value) => onChange(items.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div className="md:col-span-2 border border-gray-200 rounded-2xl p-5 bg-gray-50/50">
      <div className="flex justify-between items-center mb-4">
        <div className="font-semibold text-gray-700">{title}</div>
        <button type="button" className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-all" onClick={addItem}>
          + Add Entry
        </button>
      </div>
      {(items || []).length === 0 && <div className="text-sm text-gray-400 italic text-center py-2">No entries added yet</div>}
      {(items || []).map((it, i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm relative group">
          {fields.map((f) => (
            <div key={f.name} className="w-full">
              <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">{f.placeholder}</label>
              {f.type === "select" ? (
                <select
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-gray-50 focus:bg-white transition-all"
                  value={it[f.name] || ""}
                  onChange={(e) => update(i, f.name, e.target.value)}
                >
                  <option value="">Select {f.placeholder}</option>
                  {f.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type || "text"}
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-gray-50 focus:bg-white transition-all"
                  placeholder={f.placeholder || f.name}
                  value={f.type === "date" && it[f.name] ? String(it[f.name]).slice(0, 10) : it[f.name] || ""}
                  onChange={(e) => update(i, f.name, f.type === "number" ? Number(e.target.value) : e.target.value)}
                />
              )}
            </div>
          ))}
          <button
            type="button"
            className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
            onClick={() => remove(i)}
            title="Remove Entry"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default function HealthRecords() {
  const { fetchWithAuth } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({ state: "", gender: "", bloodGroup: "" });
  const [sortBy, setSortBy] = useState("age");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(25);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [viewData, setViewData] = useState(null);
  const [editData, setEditData] = useState(null);

  const [flaggedRows, setFlaggedRows] = useState([]);

  const [addForm, setAddForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetchWithAuth(`${backendUrl}/api/users`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();

        if (result.success && result.data && result.data.users) {
          setData(result.data.users);
        } else if (Array.isArray(result.data)) {
          setData(result.data);
        } else if (Array.isArray(result)) {
          setData(result);
        } else {
          setData([]);
        }
      } catch (err) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [fetchWithAuth]);

  // Helpers to update nested form state
  const setNested = (setter) => (path, value) => {
    if (path.includes(".")) {
      const parts = path.split(".");
      setter((prev) => {
        const next = { ...prev };
        let ref = next;
        for (let i = 0; i < parts.length - 1; i++) {
          const k = parts[i];
          ref[k] = Array.isArray(ref[k]) ? [...ref[k]] : { ...(ref[k] || {}) };
          ref = ref[k];
        }
        ref[parts[parts.length - 1]] = value;
        return next;
      });
    } else {
      setter((f) => ({ ...f, [path]: value }));
    }
  };

  const handleAddChange = setNested(setAddForm);
  const handleEditChange = setNested(setEditForm);

  // Add
  const handleAddSave = async () => {
    if (!addForm.name || !addForm.aadhaar) {
      alert("Please fill Aadhaar and Name.");
      return;
    }
    if (addForm.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.contact.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (addForm.contact.phone && addForm.contact.phone.length !== 10) {
      alert("Phone number must be 10 digits.");
      return;
    }
    try {
      const payload = {
        aadhaar: addForm.aadhaar,
        password: addForm.password || undefined,
        name: addForm.name,
        age: addForm.age ? parseInt(addForm.age, 10) : undefined,
        dob: addForm.dob ? new Date(addForm.dob) : undefined,
        gender: addForm.gender || undefined,
        bloodGroup: addForm.bloodGroup || undefined,
        heightCm: addForm.heightCm ? parseFloat(addForm.heightCm) : undefined,
        weightKg: addForm.weightKg ? parseFloat(addForm.weightKg) : undefined,
        contact: addForm.contact,
        originState: addForm.originState || undefined,
        currentState: addForm.currentState || undefined,
        address: addForm.address,
        emergencyContact: addForm.emergencyContact,
        appointment: addForm.appointment,
        healthRecords: addForm.healthRecords,
        illnesses: addForm.illnesses,
        languagePreference: addForm.languagePreference,
        occupation: addForm.occupation,
        consentGiven: !!addForm.consentGiven,
      };
      const response = await fetchWithAuth(`${backendUrl}/api/users/create`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        setData((prev) => [result.data || result, ...prev]);
        setAddForm(emptyForm);
        setShowAddForm(false);
        setCurrentPage(1);
        alert("User added successfully!");
      } else {
        alert(`Error: ${result.message || "Failed"}`);
      }
    } catch (error) {
      alert("Failed to add user. Please try again.");
    }
  };

  // Edit
  const handleOpenEdit = (person) => {
    setEditData(person);
    setEditForm({
      aadhaar: person.aadhaar || "",
      password: "", // never prefill
      name: person.name || "",
      age: person.age ?? "",
      dob: person.dob ? new Date(person.dob).toISOString().slice(0, 10) : "",
      gender: person.gender || "",
      bloodGroup: person.bloodGroup || "",
      heightCm: person.heightCm ?? "",
      weightKg: person.weightKg ?? "",
      contact: person.contact || { phone: "", email: "" },
      originState: person.originState || "",
      currentState: person.currentState || "",
      address: person.address || { local: "", district: "", pincode: "" },
      emergencyContact: person.emergencyContact || [],
      appointment: person.appointment || [],
      healthRecords: person.healthRecords || {
        prescriptions: [],
        labReports: [],
        immunizations: [],
        allergies: [],
        chronicConditions: [],
      },
      illnesses: person.illnesses || [],
      languagePreference: person.languagePreference || "English",
      occupation: person.occupation || "",
      consentGiven: person.consentGiven !== undefined ? person.consentGiven : true,
    });
  };

  const handleEditSave = async () => {
    if (!editForm.aadhaar) return;
    if (editForm.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.contact.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (editForm.contact.phone && editForm.contact.phone.length !== 10) {
      alert("Phone number must be 10 digits.");
      return;
    }
    try {
      const payload = {
        name: editForm.name,
        age: editForm.age ? parseInt(editForm.age, 10) : undefined,
        dob: editForm.dob ? new Date(editForm.dob) : undefined,
        gender: editForm.gender || undefined,
        bloodGroup: editForm.bloodGroup || undefined,
        heightCm: editForm.heightCm ? parseFloat(editForm.heightCm) : undefined,
        weightKg: editForm.weightKg ? parseFloat(editForm.weightKg) : undefined,
        contact: editForm.contact,
        originState: editForm.originState || undefined,
        currentState: editForm.currentState || undefined,
        address: editForm.address,
        emergencyContact: editForm.emergencyContact,
        appointment: editForm.appointment,
        healthRecords: editForm.healthRecords,
        illnesses: editForm.illnesses,
        languagePreference: editForm.languagePreference,
        occupation: editForm.occupation,
        consentGiven: !!editForm.consentGiven,
      };
      if (editForm.password) payload.password = editForm.password;

      const response = await fetchWithAuth(`${backendUrl}/api/users/${editForm.aadhaar}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        const updated = result.data || result;
        setData((prev) => prev.map((u) => (u.aadhaar === editForm.aadhaar ? updated : u)));
        setEditData(null);
        setEditForm(emptyForm);
        alert("User updated successfully!");
      } else {
        alert(`Error: ${result.message || "Failed"}`);
      }
    } catch {
      alert("Failed to update user. Please try again.");
    }
  };

  // Delete
  const handleDeleteSelected = async () => {
    if (!selectedRows.length) return;
    if (!confirm(`Delete ${selectedRows.length} selected user(s)?`)) return;
    try {
      await Promise.all(
        selectedRows.map((aadhaar) =>
          fetchWithAuth(`${backendUrl}/api/users/${aadhaar}`, {
            method: "DELETE",
          })
        )
      );
      setData((prev) => prev.filter((p) => !selectedRows.includes(p.aadhaar)));
      setSelectedRows([]);
      alert("Selected users deleted successfully!");
    } catch {
      alert("Failed to delete users. Please try again.");
    }
  };

  // Search/sort reset page
  useEffect(() => setCurrentPage(1), [searchTerm, selectedFilters, sortBy]);

  // Filter/sort
  const filteredData = useMemo(() => {
    let filtered = data.filter((item) => {
      const q = searchTerm.trim().toLowerCase();
      const searchMatch =
        !q ||
        (item.name || "").toLowerCase().includes(q) ||
        (item.aadhaar || "").toLowerCase().includes(q) ||
        (item.contact?.phone || "").includes(q) ||
        (item.contact?.email || "").toLowerCase().includes(q);
      const stateMatch =
        !selectedFilters.state ||
        item.currentState === selectedFilters.state ||
        item.originState === selectedFilters.state;
      const genderMatch = !selectedFilters.gender || item.gender === selectedFilters.gender;
      const bloodGroupMatch = !selectedFilters.bloodGroup || item.bloodGroup === selectedFilters.bloodGroup;
      return searchMatch && stateMatch && genderMatch && bloodGroupMatch;
    });
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "age":
          return (a.age || 0) - (b.age || 0);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "currentState":
          return (a.currentState || "").localeCompare(b.currentState || "");
        case "originState":
          return (a.originState || "").localeCompare(b.originState || "");
        default:
          return 0;
      }
    });
    return filtered;
  }, [data, searchTerm, selectedFilters, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // selection
  const handleRowSelect = (aadhaar) =>
    setSelectedRows((prev) => (prev.includes(aadhaar) ? prev.filter((r) => r !== aadhaar) : [...prev, aadhaar]));
  const handleSelectAll = () => {
    if (paginatedData.length === 0) return;
    const allIds = paginatedData.map((p) => p.aadhaar);
    const allSelected = allIds.every((id) => selectedRows.includes(id));
    setSelectedRows(allSelected ? selectedRows.filter((id) => !allIds.includes(id)) : [...new Set([...selectedRows, ...allIds])]);
  };

  // view/edit/flag
  const handleView = (person) => setViewData(person);
  const handleFlag = (aadhaar) => setFlaggedRows((prev) => (prev.includes(aadhaar) ? prev.filter((x) => x !== aadhaar) : [...prev, aadhaar]));

  // CSV flatten helpers
  const escapeCsv = (val) => {
    const s = String(val ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const flattenObject = (obj, parent = "", res = {}) => {
    if (obj === null || obj === undefined) return res;
    if (Array.isArray(obj)) {
      obj.forEach((v, i) => {
        const key = parent ? `${parent}[${i}]` : `[${i}]`;
        if (typeof v === "object" && v !== null) flattenObject(v, key, res);
        else res[key] = v;
      });
    } else if (typeof obj === "object") {
      Object.entries(obj).forEach(([k, v]) => {
        const key = parent ? `${parent}.${k}` : k;
        if (typeof v === "object" && v !== null) flattenObject(v, key, res);
        else res[key] = v;
      });
    } else {
      res[parent] = obj;
    }
    return res;
  };
  const handleDownload = (person) => {
    const flat = flattenObject(person);
    const headers = Object.keys(flat);
    const values = headers.map((h) => escapeCsv(flat[h]));
    const csvContent = `${headers.join(",")}\n${values.join(",")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${person.aadhaar || "user"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading health records...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow">
          <div className="text-red-600 text-6xl mb-4">⚠</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">Failed to connect to the server: {error}</p>
          <p className="text-sm text-gray-500">Make sure your backend server is running on {backendUrl}</p>
          <button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Simple inline editors for arrays


  return (
    <div className="min-h-screen bg-gray-50/50 p-4 font-sans text-gray-800">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg shadow-teal-900/5 rounded-3xl p-6 mb-8 border border-white/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-700 to-blue-600 bg-clip-text text-transparent">Health Records Portal</h1>
            <p className="text-gray-500 mt-1">Manage patient records and medical history efficiently</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">Total Records: {data.length}</span>
            <button
              className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              onClick={handleDeleteSelected}
              disabled={selectedRows.length === 0}
            >
              Delete Selected ({selectedRows.length})
            </button>
            <button
              className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-teal-900/20 flex items-center justify-center space-x-2 text-sm font-medium transition-all duration-200 transform hover:-translate-y-0.5"
              onClick={() => {
                setShowAddForm((s) => !s);
                setAddForm(emptyForm);
              }}
            >
              <Plus className="w-5 h-5" /> <span>Add New Record</span>
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white p-6 rounded-3xl mb-8 border border-gray-100 shadow-xl shadow-teal-900/5 animate-in slide-in-from-top-4 duration-300">
            <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Add New Health Record</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={addForm.aadhaar}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                  handleAddChange("aadhaar", val);
                }}
                type="text"
                placeholder="Aadhaar Number (12 digits)"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder-gray-400"
                maxLength={12}
              />
              <input value={addForm.password} onChange={(e) => handleAddChange("password", e.target.value)} type="password" placeholder="Password (required)" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder-gray-400" />
              <input value={addForm.name} onChange={(e) => handleAddChange("name", e.target.value)} type="text" placeholder="Full Name (required)" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder-gray-400" />
              <select value={addForm.occupation} onChange={(e) => handleAddChange("occupation", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white">
                <option value="">Select Occupation</option>
                {[
                  "Construction",
                  "Manufacturing & Industry",
                  "Agriculture & Plantation",
                  "Domestic & Household Services",
                  "Hospitality, Food & Retail",
                  "Transportation & Logistics",
                  "Platform Work",
                  "Mining & Quarrying",
                  "Waste Management & Sanitation",
                  "Skilled Trades",
                  "Other"
                ].map((occ) => <option key={occ} value={occ}>{occ}</option>)}
              </select>
              <input value={addForm.age} readOnly type="number" placeholder="Age (Auto-calculated)" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500" />
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Date of Birth</label>
                <input
                  value={addForm.dob}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleAddChange("dob", val);
                    handleAddChange("age", calculateAge(val));
                  }}
                  type="date"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Gender</label>
                <select value={addForm.gender} onChange={(e) => handleAddChange("gender", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white">
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <select value={addForm.bloodGroup} onChange={(e) => handleAddChange("bloodGroup", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white">
                <option value="">Blood Group</option>
                <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
              </select>
              <input value={addForm.heightCm} onChange={(e) => handleAddChange("heightCm", e.target.value)} type="number" placeholder="Height (cm)" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder-gray-400" />
              <input value={addForm.weightKg} onChange={(e) => handleAddChange("weightKg", e.target.value)} type="number" placeholder="Weight (kg)" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder-gray-400" />
              <input
                value={addForm.contact.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  handleAddChange("contact.phone", val);
                }}
                type="text"
                placeholder="Phone Number (10 digits)"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder-gray-400"
                maxLength={10}
              />
              <input value={addForm.contact.email} onChange={(e) => handleAddChange("contact.email", e.target.value)} type="email" placeholder="Email Address" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder-gray-400" />
              <select value={addForm.originState} onChange={(e) => handleAddChange("originState", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white">
                <option value="">Origin State</option>
                {statesList.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={addForm.currentState} onChange={(e) => handleAddChange("currentState", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white">
                <option value="">Current State</option>
                {statesList.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input value={addForm.address.local} onChange={(e) => handleAddChange("address.local", e.target.value)} placeholder="Local Address" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder-gray-400" />
              <select value={addForm.address.district} onChange={(e) => handleAddChange("address.district", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white">
                <option value="">Select District</option>
                {(statesAndDistricts[addForm.currentState] || []).map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <input value={addForm.address.pincode} onChange={(e) => handleAddChange("address.pincode", e.target.value)} placeholder="Pincode" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder-gray-400" />
              <div className="md:col-span-2">
                <ListEditor
                  title="Emergency Contacts"
                  items={addForm.emergencyContact}
                  onChange={(items) => handleAddChange("emergencyContact", items)}
                  fields={[
                    { name: "phone", placeholder: "Phone Number" }
                  ]}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Allergies</label>
                <ArrayChips
                  items={addForm.healthRecords.allergies}
                  onChange={(items) => handleAddChange("healthRecords.allergies", items)}
                  placeholder="Select Allergy"
                  options={allergyOptions}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Chronic Conditions</label>
                <ArrayChips
                  items={addForm.healthRecords.chronicConditions}
                  onChange={(items) => handleAddChange("healthRecords.chronicConditions", items)}
                  placeholder="Select Condition"
                  options={chronicConditionOptions}
                />
              </div>

              <ListEditor
                title="Illnesses"
                items={addForm.illnesses}
                onChange={(items) => handleAddChange("illnesses", items)}
                fields={[
                  {
                    name: "illnessName",
                    type: "select",
                    placeholder: "Illness Name",
                    options: [
                      "Tuberculosis", "HIV/AIDS", "Malaria", "Dengue Fever", "Influenza",
                      "COVID-19", "Hepatitis", "Typhoid", "Measles", "Chickenpox",
                      "Cholera", "Other"
                    ]
                  },
                  { name: "diagnosisDate", type: "date", placeholder: "Diagnosis Date" },
                  { name: "recoveryDate", type: "date", placeholder: "Recovery Date" },
                ]}
              />
              <select value={addForm.languagePreference} onChange={(e) => handleAddChange("languagePreference", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white">
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Bengali">Bengali</option>
                <option value="Telugu">Telugu</option>
                <option value="Marathi">Marathi</option>
                <option value="Tamil">Tamil</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Kannada">Kannada</option>
                <option value="Odia">Odia</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Punjabi">Punjabi</option>
              </select>
              <select value={String(addForm.consentGiven)} onChange={(e) => handleAddChange("consentGiven", e.target.value === "true")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white">
                <option value="true">Consent Given: Yes</option>
                <option value="false">Consent Given: No</option>
              </select>
            </div>
            <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-gray-50">
              <button onClick={() => { setShowAddForm(false); setAddForm(emptyForm); }} className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleAddSave} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2.5 rounded-xl font-medium shadow-lg shadow-teal-900/20 transition-all transform hover:-translate-y-0.5">Save Record</button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by Name, Aadhaar, Phone, or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/50 transition-all outline-none text-gray-700 placeholder-gray-400 shadow-sm"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <button className="flex items-center space-x-2" onClick={() => setShowFilters((s) => !s)}>
            <Filter className="w-4 h-4" /> <span>Filters & Sorting</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select className="bg-white border border-gray-200 p-2.5 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none shadow-sm" value={selectedFilters.state} onChange={(e) => setSelectedFilters((s) => ({ ...s, state: e.target.value }))}>
              <option value="">All States</option>
              {statesList.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="bg-white border border-gray-200 p-2.5 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none shadow-sm" value={selectedFilters.gender} onChange={(e) => setSelectedFilters((s) => ({ ...s, gender: e.target.value }))}>
              <option value="">All Genders</option>
              {/* ... options ... */}
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            <select className="bg-white border border-gray-200 p-2.5 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none shadow-sm" value={selectedFilters.bloodGroup} onChange={(e) => setSelectedFilters((s) => ({ ...s, bloodGroup: e.target.value }))}>
              <option value="">All Blood Groups</option>
              <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
            </select>
            <select className="border-gray-200 p-2.5 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="age">Sort by Age</option>
              <option value="name">Sort by Name</option>
              <option value="currentState">Sort by Current State</option>
              <option value="originState">Sort by Origin State</option>
            </select>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl transition-colors font-medium" onClick={() => setSelectedFilters({ state: "", gender: "", bloodGroup: "" })}>
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {paginatedData.map((p) => (
          <div key={p.aadhaar} className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 ${flaggedRows.includes(p.aadhaar) ? "ring-2 ring-red-100 bg-red-50/50" : ""}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-bold text-lg text-gray-900">{p.name}</div>
                <div className="text-sm text-teal-600 font-medium">Aadhaar: {p.aadhaar}</div>
              </div>
              <input type="checkbox" checked={selectedRows.includes(p.aadhaar)} onChange={() => handleRowSelect(p.aadhaar)} className="rounded-md border-gray-300 text-teal-600 w-5 h-5 focus:ring-teal-500" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div className="bg-gray-50 px-3 py-2 rounded-lg"><span className="text-gray-500 block text-xs uppercase tracking-wide">Age</span> <span className="font-medium">{p.age ? `${p.age} yrs` : "N/A"}</span></div>
              <div className="bg-gray-50 px-3 py-2 rounded-lg"><span className="text-gray-500 block text-xs uppercase tracking-wide">Gender</span> <span className="font-medium">{p.gender || "N/A"}</span></div>
              <div className="bg-gray-50 px-3 py-2 rounded-lg"><span className="text-gray-500 block text-xs uppercase tracking-wide">Blood</span> <span className="font-medium">{p.bloodGroup || "N/A"}</span></div>
              <div className="bg-gray-50 px-3 py-2 rounded-lg"><span className="text-gray-500 block text-xs uppercase tracking-wide">State</span> <span className="font-medium truncate">{p.currentState || "N/A"}</span></div>
            </div>

            <div className="text-sm mb-4 pl-1">
              <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Contact</div>
              <div className="font-medium">{p.contact?.phone || "N/A"}</div>
              <div className="text-gray-500 truncate">{p.contact?.email || ""}</div>
            </div>

            <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-2">
              <div className="flex space-x-2 w-full justify-between">
                <button onClick={() => handleView(p)} className="flex-1 flex items-center justify-center py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"><Eye className="w-5 h-5" /></button>
                <button onClick={() => handleOpenEdit(p)} className="flex-1 flex items-center justify-center py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"><Edit className="w-5 h-5" /></button>
                <button onClick={() => handleDownload(p)} className="flex-1 flex items-center justify-center py-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors"><Download className="w-5 h-5" /></button>
                <button onClick={() => handleFlag(p.aadhaar)} className="flex-1 flex items-center justify-center py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><Flag className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        ))}
        {paginatedData.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="mb-2 text-4xl">🔍</div>
            <p>No records found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-teal-50/50 text-teal-900">
              <th className="px-6 py-4 w-12">
                <input type="checkbox" checked={paginatedData.length > 0 && paginatedData.every((p) => selectedRows.includes(p.aadhaar))} onChange={handleSelectAll} className="rounded-md border-gray-300 text-teal-600 w-4 h-4 focus:ring-teal-500" />
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-teal-800/70">Aadhaar</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-teal-800/70">Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-teal-800/70">Age/Gender</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-teal-800/70">Blood</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-teal-800/70">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-teal-800/70">State (Curr/Orig)</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-teal-800/70">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {paginatedData.map((p) => (
              <tr key={p.aadhaar} className={`group hover:bg-teal-50/30 transition-colors duration-150 ${flaggedRows.includes(p.aadhaar) ? "bg-red-50 hover:bg-red-100/50" : ""}`}>
                <td className="px-6 py-4">
                  <input type="checkbox" checked={selectedRows.includes(p.aadhaar)} onChange={() => handleRowSelect(p.aadhaar)} className="rounded-md border-gray-300 text-teal-600 w-4 h-4 focus:ring-teal-500" />
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 font-mono text-sm bg-gray-50 px-2 py-1 rounded inline-block">{p.aadhaar}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-800">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.occupation || "Unemployed"}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.age ? `${p.age} yr` : ""}, {p.gender ? p.gender.charAt(0) : ""}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${["A+", "B+", "O+", "AB+"].includes(p.bloodGroup) ? "bg-teal-100 text-teal-800" : "bg-red-100 text-red-800"}`}>
                    {p.bloodGroup || "-"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-700">{p.contact?.phone || "N/A"}</div>
                  <div className="text-xs text-gray-500 max-w-[120px] truncate" title={p.contact?.email}>{p.contact?.email || ""}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div>{p.currentState || "-"}</div>
                  <div className="text-xs text-gray-400">from {p.originState}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleView(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View"><Eye className="w-5 h-5" /></button>
                    <button onClick={() => handleOpenEdit(p)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Edit"><Edit className="w-5 h-5" /></button>
                    <button onClick={() => handleDownload(p)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Download CSV"><Download className="w-5 h-5" /></button>
                    <button onClick={() => handleFlag(p.aadhaar)} className={`p-1.5 rounded-lg transition-colors ${flaggedRows.includes(p.aadhaar) ? "text-red-600 bg-red-100" : "text-gray-400 hover:text-red-600 hover:bg-red-50"}`} title="Flag"><Flag className="w-5 h-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-4xl mb-3">📭</span>
                    <span>No health records found matching your search.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-6">
        <span className="text-sm font-medium text-gray-500">Page {currentPage} of {totalPages} | Showing {paginatedData.length} of {filteredData.length} records</span>
        <div className="flex space-x-3">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-5 py-2.5 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors shadow-sm">Previous</button>
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-5 py-2.5 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors shadow-sm">Next</button>
        </div>
      </div>

      {/* View Modal */}
      {
        viewData && (
          <div className="fixed inset-0 bg-teal-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 border border-white/50">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Health Record Details</h2>
                  <div className="text-sm text-gray-500">Record ID: {viewData.aadhaar}</div>
                </div>
                <button onClick={() => setViewData(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
                  <ChevronDown className="w-5 h-5 transform rotate-180" /> {/* leveraging existing icon as close, or just generic X */}
                </button>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Aadhaar:</strong><div>{viewData.aadhaar}</div></div>
                <div><strong>Name:</strong><div>{viewData.name}</div></div>
                <div><strong>Occupation:</strong><div>{viewData.occupation || "N/A"}</div></div>
                <div><strong>Age:</strong><div>{viewData.age ?? "N/A"}</div></div>
                <div><strong>DOB:</strong><div>{viewData.dob ? String(viewData.dob).slice(0, 10) : "N/A"}</div></div>
                <div><strong>Gender:</strong><div>{viewData.gender || "N/A"}</div></div>
                <div><strong>Blood Group:</strong><div>{viewData.bloodGroup || "N/A"}</div></div>
                <div><strong>Height:</strong><div>{viewData.heightCm ? `${viewData.heightCm} cm` : "N/A"}</div></div>
                <div><strong>Weight:</strong><div>{viewData.weightKg ? `${viewData.weightKg} kg` : "N/A"}</div></div>
                <div><strong>Phone:</strong><div>{viewData.contact?.phone || "N/A"}</div></div>
                <div><strong>Email:</strong><div>{viewData.contact?.email || "N/A"}</div></div>
                <div><strong>Origin State:</strong><div>{viewData.originState || "N/A"}</div></div>
                <div><strong>Current State:</strong><div>{viewData.currentState || "N/A"}</div></div>
                <div className="md:col-span-2"><strong>Language:</strong><div>{viewData.languagePreference || "N/A"}</div></div>


                <div className="md:col-span-2">
                  <strong>Allergies:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(viewData.healthRecords?.allergies || []).map((a, i) => (
                      <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">{a}</span>
                    ))}
                    {!(viewData.healthRecords?.allergies || []).length && <span className="text-xs text-gray-500">None</span>}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <strong>Chronic Conditions:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(viewData.healthRecords?.chronicConditions || []).map((c, i) => (
                      <span key={i} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">{c}</span>
                    ))}
                    {!(viewData.healthRecords?.chronicConditions || []).length && <span className="text-xs text-gray-500">None</span>}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <strong>Illnesses:</strong>
                  <div className="text-xs">
                    {(viewData.illnesses || []).map((r, i) => (
                      <div key={i} className="py-1 border-b last:border-b-0">
                        {r.illnessName || "—"} | Dx: {r.diagnosisDate ? String(r.diagnosisDate).slice(0, 10) : "—"} | Rx: {r.recoveryDate ? String(r.recoveryDate).slice(0, 10) : "—"}
                      </div>
                    ))}
                    {!(viewData.illnesses || []).length && "None"}
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                <button onClick={() => setViewData(null)} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">Close</button>
              </div>
            </div>
          </div>
        )
      }

      {/* Edit Modal */}
      {
        editData && (
          <div className="fixed inset-0 bg-teal-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 border border-white/50">
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">Edit Health Record</h2>
                <button onClick={() => { setEditData(null); setEditForm(emptyForm); }} className="p-2 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-gray-500">
                  <ChevronDown className="w-5 h-5 transform rotate-180" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Aadhaar Number</label>
                  <input value={editForm.aadhaar} onChange={(e) => handleEditChange("aadhaar", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500" placeholder="Aadhaar Number (12 digits)" disabled />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Password (set new)</label>
                  <input value={editForm.password} onChange={(e) => handleEditChange("password", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder-gray-400" type="password" placeholder="Leave blank to keep unchanged" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Full Name</label>
                  <input value={editForm.name} onChange={(e) => handleEditChange("name", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder-gray-400" placeholder="Full Name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Occupation</label>
                  <select value={editForm.occupation} onChange={(e) => handleEditChange("occupation", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white">
                    <option value="">Select Occupation</option>
                    {[
                      "Construction",
                      "Manufacturing & Industry",
                      "Agriculture & Plantation",
                      "Domestic & Household Services",
                      "Hospitality, Food & Retail",
                      "Transportation & Logistics",
                      "Platform Work",
                      "Mining & Quarrying",
                      "Waste Management & Sanitation",
                      "Skilled Trades",
                      "Other"
                    ].map((occ) => <option key={occ} value={occ}>{occ}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Age</label>
                  <input value={editForm.age} readOnly type="number" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500" placeholder="Age (Auto-calculated)" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">DOB</label>
                  <input
                    value={editForm.dob}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleEditChange("dob", val);
                      handleEditChange("age", calculateAge(val));
                    }}
                    type="date"
                    placeholder="Date of Birth"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Gender</label>
                  <select value={editForm.gender} onChange={(e) => handleEditChange("gender", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white">
                    <option value="">Select Gender</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Blood Group</label>
                  <select value={editForm.bloodGroup} onChange={(e) => handleEditChange("bloodGroup", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white">
                    <option value="">Select Blood Group</option>
                    <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Height (cm)</label>
                  <input value={editForm.heightCm} onChange={(e) => handleEditChange("heightCm", e.target.value)} type="number" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder-gray-400" placeholder="Height" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Weight (kg)</label>
                  <input value={editForm.weightKg} onChange={(e) => handleEditChange("weightKg", e.target.value)} type="number" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder-gray-400" placeholder="Weight" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Phone Number</label>
                  <input
                    value={editForm.contact.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      handleEditChange("contact.phone", val);
                    }}
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder-gray-400"
                    placeholder="Phone Number (10 digits)"
                    maxLength={10}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Email Address</label>
                  <input value={editForm.contact.email} onChange={(e) => handleEditChange("contact.email", e.target.value)} type="email" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder-gray-400" placeholder="Email Address" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Origin State</label>
                  <select value={editForm.originState} onChange={(e) => handleEditChange("originState", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white">
                    <option value="">Select Origin State</option>
                    {statesList.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Current State</label>
                  <select value={editForm.currentState} onChange={(e) => handleEditChange("currentState", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white">
                    <option value="">Select Current State</option>
                    {statesList.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Local Address</label>
                  <input value={editForm.address.local} onChange={(e) => handleEditChange("address.local", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder-gray-400" placeholder="Local Address" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">District</label>
                  <select value={editForm.address.district} onChange={(e) => handleEditChange("address.district", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white">
                    <option value="">Select District</option>
                    {(statesAndDistricts[editForm.currentState] || []).map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Pincode</label>
                  <input value={editForm.address.pincode} onChange={(e) => handleEditChange("address.pincode", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder-gray-400" placeholder="Pincode" />
                </div>

                <div className="md:col-span-2">
                  <ListEditor
                    title="Emergency Contacts"
                    items={editForm.emergencyContact}
                    onChange={(items) => handleEditChange("emergencyContact", items)}
                    fields={[
                      { name: "phone", placeholder: "Phone Number" }
                    ]}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Allergies</label>
                  <ArrayChips
                    items={editForm.healthRecords.allergies}
                    onChange={(items) => handleEditChange("healthRecords.allergies", items)}
                    placeholder="Add Allergy"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Chronic Conditions</label>
                  <ArrayChips
                    items={editForm.healthRecords.chronicConditions}
                    onChange={(items) => handleEditChange("healthRecords.chronicConditions", items)}
                    placeholder="Add Condition"
                  />
                </div>

                <ListEditor
                  title="Illnesses"
                  items={editForm.illnesses}
                  onChange={(items) => handleEditChange("illnesses", items)}
                  fields={[
                    {
                      name: "illnessName",
                      type: "select",
                      placeholder: "Illness Name",
                      options: [
                        "Tuberculosis",
                        "HIV/AIDS",
                        "Malaria",
                        "Dengue Fever",
                        "Influenza",
                        "COVID-19",
                        "Hepatitis",
                        "Typhoid",
                        "Measles",
                        "Chickenpox",
                        "Cholera",
                        "Other"
                      ]
                    },
                    { name: "diagnosisDate", type: "date", placeholder: "Diagnosis Date" },
                    { name: "recoveryDate", type: "date", placeholder: "Recovery Date" },
                  ]}
                />

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Language Preference</label>
                  <select value={editForm.languagePreference} onChange={(e) => handleEditChange("languagePreference", e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white">
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Odia">Odia</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Punjabi">Punjabi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Consent Given</label>
                  <select value={String(editForm.consentGiven)} onChange={(e) => handleEditChange("consentGiven", e.target.value === "true")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all bg-white">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end space-x-3">
                <button onClick={() => { setEditData(null); setEditForm(emptyForm); }} className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleEditSave} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2.5 rounded-xl font-medium shadow-lg shadow-teal-900/20 transition-all transform hover:-translate-y-0.5">Save Changes</button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
