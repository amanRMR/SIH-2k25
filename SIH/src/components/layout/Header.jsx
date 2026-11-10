import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react' // for hamburger icons

export default function Header() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <header className="shadow sticky z-50 top-0">
            <nav className="bg-white px-4 lg:px-6 py-3">
                <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
                    
                    {/* Logo + Title */}
                    <Link to="/" className="flex items-center">
                        <img
                            src="https://images.emojiterra.com/google/noto-emoji/unicode-16.0/color/svg/1f1ee-1f1f3.svg"
                            className="mr-5 h-12"
                            alt="Logo"
                        />
                        <span className="self-center text-2xl font-semibold whitespace-nowrap text-black">
                            Swaasth Setu
                        </span>
                    </Link>

                    {/* Right side (Login + Hamburger) */}
                    <div className="flex items-center lg:order-2">
                        <Link
                            to="/"
                            className="hidden sm:block text-white bg-red-500 hover:bg-red-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 transition"
                        >
                            Logout
                        </Link>

                        {/* Hamburger Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center p-2 text-sm text-black rounded-lg lg:hidden hover:bg-blue-700 focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Navigation Menu */}
                    <div
                        className={`${isOpen ? "block" : "hidden"} w-full lg:flex lg:w-auto lg:order-1`}
                        id="mobile-menu"
                    >
                        <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                            {[
                                { to: "/secure/home", label: "Home" },
                               
                                
                                { to: "/secure/map", label: "Map" },
                                { to: "/secure/healthrecords", label: "Health Records" },
                                { to: "/secure/statistics", label: "Statistics" },
                                
                                 { to: "/secure/about", label: "About" },
                                 { to: "/secure/contact", label: "Contact" }
                            ].map((item, idx) => (
                                <li key={idx}>
                                    <NavLink
                                        to={item.to}
                                        className={({ isActive }) =>
                                            `block py-2 pr-4 pl-3 duration-200 
                                            ${isActive ? "text-blue-500" : "text-black"} 
                                            border-b border-blue-800 hover:text-blue-400 
                                            lg:hover:bg-transparent lg:border-0 lg:p-0`
                                        }
                                    >
                                        {item.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    )
}
