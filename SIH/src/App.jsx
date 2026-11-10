// App.jsx
import React from 'react';
import Layout from './components/layout/Layout.jsx';
import Home from './components/public/Home.jsx';
import About from './components/public/About.jsx';
import Contact from './components/public/Contact.jsx';
import Error from './components/public/Error.jsx';
// import User from './components/User.jsx';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import Alerts from './components/features/Alerts.jsx';
import HospitalHome from './components/hospital/HospitalHome.jsx';

import 'leaflet/dist/leaflet.css';
import Map from './components/features/Map.jsx';

import Statistics from './components/features/Statistics.jsx';
import HealthRecords from './components/features/HealthRecords.jsx';
import AdminLogin from './components/auth/AdminLogin.jsx';
import AdminSignUp from './components/auth/AdminSignup.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import Landing from './components/public/Landing.jsx';
import HospitalLogin from './components/auth/HospitalLogin.jsx';
import HospitalSignup from './components/auth/HospitalSignup.jsx';
import HospitalMedicalRecord from './components/hospital/HospitalMedicalRecord.jsx';
import HospitalAddPatient from './components/hospital/HospitalAddPatient.jsx';
import HospitalAppointments from './components/hospital/HospitalAppointments.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import PrivacyPolicy from './components/public/PrivacyPolicy.jsx';
import TermsOfUse from './components/public/TermsOfUse.jsx';
import UserGuide from './components/public/UserGuide.jsx';
import TechnicalSupport from './components/public/TechnicalSupport.jsx';
import EmployerHome from './components/employer/EmployerHome.jsx';
import EmployerLogin from './components/employer/EmployerLogin.jsx';
import EmployerSignup from './components/employer/EmployerSignup.jsx';


// const router = createBrowserRouter([
//   {
//     path: '/',
//     element: <Layout />,
//     children: [
//       { path: '', element: <Home /> },
//       { path: 'about', element: <About /> },
//       { path: 'contact', element: <Contact /> },
//       { path: 'user/:userId', element: <User/>},
//     ],
//   },
//   {
//     path: '*',
//     element: <Error />,
//   },
// ]);


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Landing page as root */}
      <Route path='/' element={<Landing />} />

      {/* Protected routes with layout */}
      <Route path='/secure' element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path='home' element={<Home />} />
        <Route path='about' element={<About />} />
        <Route path='contact' element={<Contact />} />
        <Route path='map' element={<Map />} />
        <Route path='alerts' element={<Alerts />} />
        <Route path='statistics' element={<Statistics />} />
        <Route path='healthrecords' element={<HealthRecords />} />
      </Route>

      {/* Public pages from Footer */}
      <Route element={<Layout />}>
        <Route path='/about' element={<About />} />
        <Route path='/privacy' element={<PrivacyPolicy />} />
        <Route path='/terms' element={<TermsOfUse />} />
        <Route path='/guide' element={<UserGuide />} />
        <Route path='/support' element={<TechnicalSupport />} />
      </Route>

      {/* Authentication routes */}
      <Route path='/adminlogin' element={<AdminLogin />} />
      <Route path='/adminsignup' element={<AdminSignUp />} />
      <Route path='/hospitallogin' element={<HospitalLogin />} />
      <Route path='/hospitalsignup' element={<HospitalSignup />} />
      <Route path='/employer' element={<EmployerHome />} />
      <Route path='/employerlogin' element={<EmployerLogin />} />
      <Route path='/employersignup' element={<EmployerSignup />} />

      {/* Hospital protected routes (no layout) */}
      <Route path='/hospitalhome' element={<ProtectedRoute requiredUserType="hospital"><HospitalHome /></ProtectedRoute>} />
      <Route path='/hospitaladdpatient' element={<ProtectedRoute requiredUserType="hospital"><HospitalAddPatient /></ProtectedRoute>} />
      <Route path='/hospitalmedicalrecord' element={<ProtectedRoute requiredUserType="hospital"><HospitalMedicalRecord /></ProtectedRoute>} />
      <Route path='/hospitalappointments' element={<ProtectedRoute requiredUserType="hospital"><HospitalAppointments /></ProtectedRoute>} />

      {/* Admin protected routes */}
      <Route path='/admin' element={<ProtectedRoute requiredUserType="admin"><AdminDashboard /></ProtectedRoute>} />

      <Route path='*' element={<Error />} />
    </>
  )
)

export default function App() {
  return <RouterProvider router={router} />;
}

