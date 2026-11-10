import React, { useState } from "react";
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  Stethoscope,
  FileText,
  Shield,
  Save,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Briefcase,
} from "lucide-react";
import { buildApiUrl } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext.jsx";
import HospitalHeader from "./HospitalHeader.jsx";
// Sample States and Districts (expand as needed)
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
          <span key={idx} className="px-3 py-1 bg-[#006B61]/10 text-[#006B61] rounded-full text-sm font-medium flex items-center shadow-sm border border-[#006B61]/20">
            {x}
            <button
              type="button"
              className="ml-2 text-[#006B61] hover:text-[#004d46] font-bold focus:outline-none"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="relative flex gap-2">
        {options && !isOther ? (
          <select
            className="w-full pl-3 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#006B61] focus:border-[#006B61] border-gray-300 bg-white"
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
              className="flex-1 pl-3 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#006B61] focus:border-[#006B61] border-gray-300 bg-white"
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
              className="px-4 py-2 bg-[#006B61] hover:bg-[#005a52] text-white rounded-lg shadow-md text-sm font-medium transition-all"
              onClick={() => handleAdd(val)}
            >
              Add
            </button>
            {isOther && (
              <button
                type="button"
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all"
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

const FormSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
    <div className="flex items-center mb-4">
      <Icon className="w-5 h-5 text-[#006B61] mr-2" />
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    {children}
  </div>
);

const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  options = null,
  error = null,
  icon: Icon = null,
  placeholder = "",
  required = false,
  className = "",
  ...props
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />}
      {type === "select" ? (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${Icon ? "pl-10" : "pl-3"} pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#006B61] focus:border-[#006B61] ${error ? "border-red-500" : "border-gray-300"
            }`}
        >
          <option value="">{placeholder}</option>
          {options && options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : type === "checkbox" ? (
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 text-[#006B61] border-gray-300 rounded focus:ring-[#006B61]"
          />
          <span className="ml-2 text-sm text-gray-600">{placeholder}</span>
        </label>
      ) : (
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${Icon ? "pl-10" : "pl-3"} pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#006B61] focus:border-[#006B61] ${error ? "border-red-500" : "border-gray-300"
            } ${className}`}
          {...props}
        />
      )}
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600 flex items-center">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </p>
    )}
  </div>
);


const PatientRegistrationForm = () => {
  const { fetchWithAuth } = useAuth();
  const [formData, setFormData] = useState({
    aadhaar: "",
    password: "",
    name: "",
    occupation: "",
    age: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    heightCm: "",
    weightKg: "",
    phone: "",
    email: "",
    emergencyContactPhone: "",
    originState: "",
    currentState: "",
    district: "",
    local: "",
    pincode: "",
    pincode: "",
    allergies: [],
    chronicConditions: [],
    illnesses: [],
    languagePreference: "English",
    consentGiven: true,
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleIllnessChange = (index, field, value) => {
    const newIllnesses = [...formData.illnesses];
    newIllnesses[index][field] = value;
    setFormData(prev => ({ ...prev, illnesses: newIllnesses }));
  };

  const addIllness = () => {
    setFormData(prev => ({
      ...prev,
      illnesses: [...prev.illnesses, { illnessName: "", diagnosisDate: "", recoveryDate: "" }]
    }));
  };

  const removeIllness = (index) => {
    const newIllnesses = formData.illnesses.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, illnesses: newIllnesses }));
  };

  const handleInputChange = (field, value) => {
    if (field === "dob") {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        age: age >= 0 ? age.toString() : "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        ...(field === "currentState"
          ? { district: "" } // reset district if current state changes
          : {}),
      }));
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.aadhaar.trim()) {
      newErrors.aadhaar = "Aadhaar number is required";
    } else if (!/^\d{12}$/.test(formData.aadhaar.replace(/\s/g, ""))) {
      newErrors.aadhaar = "Aadhaar must be 12 digits";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (formData.age && (Number(formData.age) < 0 || Number(formData.age) > 120)) {
      newErrors.age = "Age must be between 0 and 120";
    }

    if (formData.weightKg && (Number(formData.weightKg) < 0 || Number(formData.weightKg) > 300)) {
      newErrors.weightKg = "Weight must be between 0 and 300";
    }

    if (formData.heightCm && (Number(formData.heightCm) < 0 || Number(formData.heightCm) > 300)) {
      newErrors.heightCm = "Height must be between 0 and 300";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("");

    try {
      // Transform data to match backend schema
      const payload = {
        contact: {
          phone: formData.phone,
          email: formData.email,
        },
        address: {
          local: formData.local,
          district: formData.district,
          pincode: formData.pincode,
        },
        aadhaar: formData.aadhaar,
        password: formData.password,
        name: formData.name,
        occupation: formData.occupation,
        age: Number(formData.age),
        dob: formData.dob ? new Date(formData.dob) : null,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        heightCm: Number(formData.heightCm),
        weightKg: Number(formData.weightKg),
        originState: formData.originState,
        currentState: formData.currentState,
        emergencyContact: formData.emergencyContactPhone ? [{ phone: formData.emergencyContactPhone }] : [],
        healthRecords: {
          prescriptions: [],
          labReports: [],
          immunizations: [],
          allergies: Array.isArray(formData.allergies) ? formData.allergies : [],
          chronicConditions: Array.isArray(formData.chronicConditions) ? formData.chronicConditions : [],
        },
        illnesses: formData.illnesses.map((illness) => ({
          illnessName: illness.illnessName,
          diagnosisDate: illness.diagnosisDate ? new Date(illness.diagnosisDate).toISOString() : new Date().toISOString(),
          recoveryDate: illness.recoveryDate ? new Date(illness.recoveryDate).toISOString() : null,
        })),
        appointment: [],
        languagePreference: formData.languagePreference,
        consentGiven: formData.consentGiven,
      };

      const response = await fetchWithAuth(buildApiUrl("/api/users/create"), {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success || response.ok) {
        console.log("Patient Registered:", data);
        setSubmitStatus("success");
        // Optional: Reset form here
      } else {
        console.error("Registration failed:", data);
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSubmitStatus("");
      }, 3000);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <HospitalHeader />
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-[80%] mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-[#006B61] rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              Patient Registration
            </h1>
            <p className="mt-1 text-gray-500 ml-14">Register a new patient in the system</p>
          </div>

          {submitStatus === "success" && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800">Patient registered successfully!</span>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">
                Please fix the errors below and try again.
              </span>
            </div>
          )}

          {/* Personal Info */}
          <FormSection title="Personal Information" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="Aadhaar Number"
                value={formData.aadhaar}
                onChange={(val) => {
                  if (/^\d*$/.test(val) && val.length <= 12) {
                    handleInputChange("aadhaar", val);
                  }
                }}
                placeholder="1234 5678 9012"
                required
                error={errors.aadhaar}
                icon={FileText}
                maxLength={12}
                inputMode="numeric"
              />
              <InputField
                label="Password"
                value={formData.password}
                onChange={(val) => handleInputChange("password", val)}
                type="password"
                placeholder="Set a password"
                icon={Shield}
              />
              <InputField
                label="Full Name"
                value={formData.name}
                onChange={(val) => handleInputChange("name", val)}
                placeholder="Enter full name"
                required
                error={errors.name}
                icon={User}
              />
              <InputField
                label="Occupation"
                value={formData.occupation}
                onChange={(val) => handleInputChange("occupation", val)}
                type="select"
                options={[
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
                ]}
                placeholder="Select Occupation"
                icon={Briefcase}
              />
              <InputField
                label="Date of Birth"
                value={formData.dob}
                onChange={(val) => handleInputChange("dob", val)}
                type="date"
                icon={Calendar}
              />
              <InputField
                label="Age"
                value={formData.age}
                onChange={(val) => { }} // Read-only
                type="number"
                placeholder="Auto-calculated"
                min="0"
                max="120"
                error={errors.age}
                readOnly
                className="bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <InputField
                label="Gender"
                value={formData.gender}
                onChange={(val) => handleInputChange("gender", val)}
                type="select"
                options={["Male", "Female", "Other"]}
                placeholder="Select gender"
              />
              <InputField
                label="Blood Group"
                value={formData.bloodGroup}
                onChange={(val) => handleInputChange("bloodGroup", val)}
                type="select"
                options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
                placeholder="Select blood group"
                icon={Heart}
              />
              <InputField
                label="Height (cm)"
                value={formData.heightCm}
                onChange={(val) => handleInputChange("heightCm", val)}
                type="number"
                placeholder="170"
                min="0"
                max="300"
                error={errors.heightCm}
              />
              <InputField
                label="Weight (kg)"
                value={formData.weightKg}
                onChange={(val) => handleInputChange("weightKg", val)}
                type="number"
                placeholder="65"
                min="0"
                max="300"
                error={errors.weightKg}
              />
            </div>
          </FormSection>

          {/* Contact Info */}
          <FormSection title="Contact Information" icon={Phone}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="Phone Number"
                value={formData.phone}
                onChange={(val) => {
                  if (/^\d*$/.test(val) && val.length <= 10) {
                    handleInputChange("phone", val);
                  }
                }}
                placeholder="9876543210"
                error={errors.phone}
                icon={Phone}
                maxLength={10}
                inputMode="numeric"
              />
              <InputField
                label="Email Address"
                value={formData.email}
                onChange={(val) => handleInputChange("email", val)}
                type="email"
                placeholder="patient@example.com"
                error={errors.email}
                icon={Mail}
              />
              <InputField
                label="Emergency Contact Phone"
                value={formData.emergencyContactPhone}
                onChange={(val) => {
                  if (/^\d*$/.test(val) && val.length <= 10) {
                    handleInputChange("emergencyContactPhone", val);
                  }
                }}
                placeholder="Emergency Contact Phone"
                icon={Phone}
                maxLength={10}
                inputMode="numeric"
              />
            </div>
          </FormSection>

          {/* Origin Details */}
          <FormSection title="Origin Details" icon={MapPin}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="Origin State"
                value={formData.originState}
                onChange={(val) => handleInputChange("originState", val)}
                type="select"
                options={Object.keys(statesAndDistricts)}
                placeholder="Select origin state"
                icon={MapPin}
              />
            </div>
          </FormSection>

          {/* Current Address */}
          <FormSection title="Current Address" icon={MapPin}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="Current State"
                value={formData.currentState}
                onChange={(val) => handleInputChange("currentState", val)}
                type="select"
                options={Object.keys(statesAndDistricts)}
                placeholder="Select current state"
                icon={MapPin}
              />
              <InputField
                label="District (Current State)"
                value={formData.district}
                onChange={(val) => handleInputChange("district", val)}
                type="select"
                options={statesAndDistricts[formData.currentState] || []}
                placeholder="Select district"
                icon={MapPin}
              />
              <InputField
                label="Locality / Address"
                value={formData.local}
                onChange={(val) => handleInputChange("local", val)}
                placeholder="House No, Street, Area"
                icon={MapPin}
              />
              <InputField
                label="Pincode"
                value={formData.pincode}
                onChange={(val) => {
                  if (/^\d*$/.test(val) && val.length <= 6) {
                    handleInputChange("pincode", val);
                  }
                }}
                type="text"
                placeholder="123456"
                icon={MapPin}
                maxLength={6}
                inputMode="numeric"
              />
            </div>
          </FormSection>

          {/* Health Info */}
          <FormSection title="Health Information" icon={Stethoscope}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
              <ArrayChips
                items={formData.allergies}
                onChange={(val) => handleInputChange("allergies", val)}
                placeholder="Select Allergy"
                options={allergyOptions}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Chronic Conditions</label>
              <ArrayChips
                items={formData.chronicConditions}
                onChange={(val) => handleInputChange("chronicConditions", val)}
                placeholder="Select Condition"
                options={chronicConditionOptions}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Illnesses
              </label>
              {formData.illnesses.map((illness, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                  <div className="flex-1">
                    <InputField
                      label="Illness Name"
                      value={illness.illnessName}
                      onChange={(val) => handleIllnessChange(index, "illnessName", val)}
                      type="select"
                      options={[
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
                      ]}
                      placeholder="Select Illness"
                      className="mb-0"
                    />
                  </div>
                  <div className="flex-1">
                    <InputField
                      label="Diagnosis Date"
                      value={illness.diagnosisDate}
                      onChange={(val) => handleIllnessChange(index, "diagnosisDate", val)}
                      type="date"
                      className="mb-0"
                    />
                  </div>
                  <div className="flex-1">
                    <InputField
                      label="Recovery Date (Optional)"
                      value={illness.recoveryDate}
                      onChange={(val) => handleIllnessChange(index, "recoveryDate", val)}
                      type="date"
                      className="mb-0"
                    />
                  </div>
                  <button
                    onClick={() => removeIllness(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={addIllness}
                className="flex items-center text-[#006B61] hover:text-[#005a52] font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Illness
              </button>
            </div>
          </FormSection>

          {/* Preferences */}
          <FormSection title="Preferences & Consent" icon={Shield}>
            <InputField
              label="Language Preference"
              value={formData.languagePreference}
              onChange={(val) => handleInputChange("languagePreference", val)}
              type="select"
              options={[
                "English",
                "Hindi",
                "Marathi",
                "Kannada",
                "Gujarati",
                "Tamil",
                "Telugu",
                "Bengali",
                "Punjabi",
              ]}
              placeholder="Select preferred language"
            />
            <InputField
              label=""
              value={formData.consentGiven}
              onChange={(val) => handleInputChange("consentGiven", val)}
              type="checkbox"
              placeholder="I consent to the collection of my health data"
            />
          </FormSection>

          <div className="flex justify-center pt-6">
            <button
              onClick={handleSubmit}
              className="flex items-center px-8 py-3 bg-[#006B61] text-white font-semibold rounded-lg shadow-md hover:bg-[#005a52] focus:ring-2 focus:ring-[#006B61] focus:ring-offset-2 transition-colors duration-200"
            >
              <Save className="w-5 h-5 mr-2" />
              Register Patient
            </button>
          </div>
          {isSubmitting && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006B61] mr-3"></div>
                <span className="text-gray-700 font-medium">Registering patient...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientRegistrationForm;
