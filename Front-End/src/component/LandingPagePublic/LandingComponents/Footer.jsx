import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import logo from "../../../assets/republic.png";

const Footer = () => {
    return (
        <footer className="border-t border-blue-900 bg-blue-950 pb-10 pt-16 text-white">
            <div className="max-w-6xl mx-auto px-4">
                
                {/* GRID */}
                <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-3 text-center md:text-left">
                    
                    {/* Brand Section - CENTERED */}
                    <div className="flex flex-col items-center md:items-start">
                        <div className="mb-4 flex items-center gap-3 justify-center md:justify-start">
                            <div className="flex h-20 w-20 items-center justify-center   overflow-hidden">
                                <img
                                    src={logo}
                                    alt="Republic of the Philippines Logo"
                                    className="h-full w-full object-contain"
                                />
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-lg font-bold leading-none">
                                    Republic of the Philippines
                                </h3>
                                <p className="text-xs text-blue-300">
                                    All content is in the public domain unless otherwise stated.
                                </p>
                            </div>
                        </div>

                        <p className="mb-6 text-sm text-blue-200 max-w-sm text-center md:text-left">
                            Serving with integrity, transparency, and dedication for the
                            progress of every Biliranon.
                        </p>

                        {/* Socials */}
                        <div className="flex gap-4 justify-center md:justify-start">
                            <a className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 hover:bg-red-600 transition">
                                <FaFacebook size={14} />
                            </a>
                            <a className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 hover:bg-red-600 transition">
                                <FaTwitter size={14} />
                            </a>
                            <a className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 hover:bg-red-600 transition">
                                <FaInstagram size={14} />
                            </a>
                            <a className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 hover:bg-red-600 transition">
                                <FaYoutube size={14} />
                            </a>
                        </div>
                    </div>

                    {/* QUICK LINKS */}
                    <div>
                        <h4 className="mx-auto md:mx-0 mb-6 border-b-2 border-red-600 pb-1 w-fit text-lg font-bold">
                            Quick Links
                        </h4>
                        <ul className="space-y-3 text-sm text-blue-200">
                            <li><a className="hover:text-white">Home</a></li>
                            <li><a className="hover:text-white">News & Updates</a></li>
                            <li><a className="hover:text-white">Transparency</a></li>
                            <li><a className="hover:text-white">Tourism</a></li>
                            <li><a className="hover:text-white">Contact Us</a></li>
                        </ul>
                    </div>

                    {/* GOVERNMENT LINKS */}
                    <div>
                        <h4 className="mx-auto md:mx-0 mb-6 border-b-2 border-red-600 pb-1 w-fit text-lg font-bold">
                            Government
                        </h4>
                        <ul className="space-y-2 text-blue-200">
                            <li><a className="hover:text-yellow-300" href="#">Office of the President</a></li>
                            <li><a className="hover:text-yellow-300" href="https://www.ovp.gov.ph">Office of the Vice President</a></li>
                            <li><a className="hover:text-yellow-300" href="https://legacy.senate.gov.ph">Senate of the Philippines</a></li>
                            <li><a className="hover:text-yellow-300" href="https://www.congress.gov.ph">House of Representatives</a></li>
                            <li><a className="hover:text-yellow-300" href="https://sb.judiciary.gov.ph">Sandiganbayan</a></li>
                            <li><a className="hover:text-yellow-300" href="https://sc.judiciary.gov.ph">Supreme Court</a></li>
                            <li><a className="hover:text-yellow-300" href="https://www.gov.ph">GOV.PH</a></li>
                        </ul>
                    </div>
                </div>

                {/* BOTTOM BAR */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-blue-900 pt-6 text-xs text-blue-300 text-center">
                    <p>&copy; 2025 Sanguniang Panlalawigan. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a className="hover:text-white cursor-pointer">Privacy Policy</a>
                        <a className="hover:text-white cursor-pointer">Terms of Service</a>
                        <a className="hover:text-white cursor-pointer">Sitemap</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
