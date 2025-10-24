import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users, Target, MapPin, ChevronDown, Phone, Mail, Map } from "lucide-react";
import BiliranImage1 from "../../assets/historical.jpg";
import BiliranImage2 from "../../assets/ros222.jpg";
import BiliranImage3 from "../../assets/aboutpic2.jpg";
import CapitolOfficeImage from "../../assets/capitol.png";

const SECTIONS = [
{    id: "history",
    title: "Our History",
    icon: Clock,
    imageUrl:BiliranImage1,
    content:
      "The history of the Sangguniang Panlalawigan of Biliran is as rich as the history of the province itself. From being a sub-province of Leyte, Biliran became a full-fledged province in 1992, and with it came the establishment of the Sangguniang Panlalawigan as the primary legislative branch.",
    color: "from-blue-600 to-blue-800",
  },
  {
    id: "mission",
    title: "Mission & Vision",
    icon: Target,
    imageUrl: BiliranImage3,
    content: "We stand by the principles of responsible leadership, transparency, and inclusivity.",
    list: [
      "Create and implement ordinances and resolutions that truly address community needs",
      "Strengthen citizen participation in local government governance",
      "Ensure that every project and program is centered on the long-term development",
      "Protect integrity and accountability in all government actions",
    ],
    color: "from-indigo-600 to-indigo-800",
  },
  {
    id: "composition",
    title: "Our Composition",
    icon: Users,
    imageUrl: BiliranImage2,
    content: "The Sangguniang Panlalawigan is composed of:",
    list: [
      "10 elected members from the two districts (five members per district)",
      "Vice Governor as chairperson, with a vote only in case of a tie",
      "Ex officio members from the Liga ng mga Barangay and Sangguniang Kabataan",
    ],
    additionalContent: "Each member serves a three-year term, and can serve up to three consecutive terms.",
    color: "from-purple-600 to-purple-800",
  },
  {
    id: "office",
    title: "Our Office",
    icon: MapPin,
    imageUrl: CapitolOfficeImage ,
    content:
      "Our office is located at the Biliran Provincial Capitol, Barangay Calumpang, Naval, Biliran, where we are open for communication and service to all citizens.",
    color: "from-blue-700 to-blue-900",
  },
];

export default function PanelDropdownInfo() {
  const [openId, setOpenId] = useState(SECTIONS[0].id);
  const [hoveredId, setHoveredId] = useState(null);

  function toggle(id) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-red-700 to-blue-600">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 py-16 sm:py-20 md:py-24">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm sm:mb-6 sm:px-6 sm:py-2">
                <span className="text-xs font-semibold tracking-wide text-blue-200 sm:text-sm">LEGISLATIVE BRANCH</span>
              </div>

              <h1 className="mb-4 text-3xl font-bold leading-tight text-white sm:mb-6 sm:text-5xl md:text-7xl">
                Sangguniang
                <br />
                <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">Panlalawigan</span>
              </h1>

              <p className="mx-auto mb-8 max-w-3xl text-base leading-relaxed text-blue-100 sm:mb-12 sm:text-lg md:text-2xl">
                The legislative heart of Biliran Province — serving with integrity, transparency, and unwavering commitment to public service.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="h-auto w-full">
            <path
              fill="#f8fafc"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Main Content Section */}
      <div className="container mx-auto px-4 py-12 -mt-8">
        <div className="max-w-7xl mx-auto">
          {/* Quick Navigation Pills */}
          <motion.div 
            className="mb-4 bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm font-medium text-gray-600 mb-4">Quick Navigation</p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <motion.button
                    key={`pill-${s.id}`}
                    onClick={() => setOpenId(s.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-medium border-2 transition-all duration-300 ${
                      openId === s.id 
                        ? `bg-gradient-to-r ${s.color} text-white border-transparent shadow-lg shadow-blue-500/30` 
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600 shadow-sm"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{s.title}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Enhanced Accordion */}
          <div className="space-y-4">
            {SECTIONS.map((section, idx) => {
              const isOpen = openId === section.id;
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 + 0.3 }}
                  className="group"
                  onMouseEnter={() => setHoveredId(section.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen 
                      ? "border-blue-200 bg-white shadow-xl shadow-blue-100/50" 
                      : "border-gray-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg hover:border-blue-300"
                  }`}>
                    <button
                      onClick={() => toggle(section.id)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left focus:outline-none transition-colors"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1">
                        <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-r ${section.color} text-white shadow-lg transition-transform duration-300 ${
                          isOpen || hoveredId === section.id ? "scale-110 rotate-6" : ""
                        }`}>
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                          <h3 className={`text-lg sm:text-xl font-semibold transition-colors ${
                            isOpen ? "text-blue-700" : "text-gray-800 group-hover:text-blue-600"
                          }`}>
                            {section.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            {isOpen ? "Click to collapse" : "Click to expand and learn more"}
                          </p>
                        </div>
                      </div>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={`flex-shrink-0 ${isOpen ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"}`}
                      >
                        <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: "easeInOut" }}
                        >
                          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-2 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                              <motion.div 
                                className="md:col-span-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                              >
                                <div className="relative group/img overflow-hidden rounded-xl shadow-lg">
                                  <img
                                    src={section.imageUrl}
                                    alt={`${section.title} image`}
                                    className="w-full h-56 sm:h-64 object-cover transition-transform duration-500 group-hover/img:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                  <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full bg-gradient-to-r ${section.color} text-white text-xs font-semibold shadow-lg`}>
                                    {section.title}
                                  </div>
                                </div>
                              </motion.div>

                              <motion.div 
                                className="md:col-span-3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 }}
                              >
                                <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-4">
                                  {section.content}
                                </p>

                                {section.list && (
                                  <div className="space-y-3 mb-4">
                                    {section.list.map((point, i) => (
                                      <div key={i} className="flex items-start gap-3 group/item">
                                        <div className={`h-6 w-6 flex-shrink-0 rounded-full bg-gradient-to-r ${section.color} flex items-center justify-center text-xs font-bold text-white transition-transform group-hover/item:scale-110`}>
                                          {i + 1}
                                        </div>
                                        <span className="text-sm text-gray-700 leading-relaxed">{point}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {section.additionalContent && (
                                  <div className={`rounded-lg border-l-4 bg-gradient-to-r from-blue-50 to-indigo-50 py-3 pl-4 pr-3 text-sm italic text-gray-700 shadow-sm`}
                                    style={{ borderColor: section.color.includes('blue') ? '#3b82f6' : section.color.includes('indigo') ? '#6366f1' : '#8b5cf6' }}
                                  >
                                    {section.additionalContent}
                                  </div>
                                )}
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="mb-4 text-3xl sm:text-4xl font-bold text-gray-900">
              Get in <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Touch</span>
            </h2>
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-gray-600">
              We welcome your inquiries, suggestions, and partnership in building a better Biliran.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Map Card */}
            <motion.div 
              className="group overflow-hidden rounded-2xl bg-white shadow-xl transition-transform duration-300 hover:shadow-2xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="relative h-80 sm:h-96">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.8008751617217!2d124.4071681108963!3d11.56612798858736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a78ca4a4ed2563%3A0xdf64c9ca39745dc9!2sBiliran%20Provincial%20Capitol-Building!5e0!3m2!1sen!2sph!4v1756898261063!5m2!1sen!2sph"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Biliran Provincial Capitol"
                  className="transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </motion.div>

            {/* Contact Info Card */}
            <motion.div 
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 p-6 sm:p-8 text-white shadow-xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
            >
              <div className="absolute inset-0 opacity-5">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: "40px 40px",
                  }}
                ></div>
              </div>

              <div className="relative z-10 space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Contact Information</h3>
                  <p className="text-sm text-blue-100">Reach out to us for inquiries and support</p>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: Map, label: "Address", value: "Biliran Provincial Capitol, Naval, Biliran" },
                    { icon: Phone, label: "Phone", value: "(053) 500-0000" },
                    { icon: Mail, label: "Email", value: "info@biliransp.gov.ph" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-4 p-3 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-blue-200 mb-1">{item.label}</div>
                        <div className="text-sm sm:text-base leading-tight">{item.value}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}