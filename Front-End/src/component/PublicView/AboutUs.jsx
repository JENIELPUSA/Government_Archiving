import React, { useState, useEffect, useRef } from "react";
import { Clock, Users, Target, MapPin, ArrowLeft, ArrowRight, Phone, Mail, Map } from "lucide-react";
import { motion, useInView } from "framer-motion";
import BiliranImage1 from "../../assets/aboutpic1.jpg";
import BiliranImage2 from "../../assets/aboutpic3.jpeg";
import BiliranImage3 from "../../assets/aboutpic2.jpg";
import CapitolOfficeImage from "../../assets/CapitolOfficeImage.png";

const AboutUsPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroRef = useRef(null);
  const introRef = useRef(null);
  const ctaRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const introInView = useInView(introRef, { once: true, margin: "-50px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-50px" });

  const carouselContent = [
    {
      title: "Our History",
      icon: <Clock className="text-blue-700" size={28} />,
      content:
        "The history of the Sangguniang Panlalawigan of Biliran is as rich as the history of the province itself. From being a sub-province of Leyte, Biliran became a full-fledged province in 1992, and with it came the establishment of the Sangguniang Panlalawigan as the primary legislative branch. Over time, the Sangguniang Panlalawigan has been the center of educational, health, infrastructure, and livelihood programs, and continues to serve the people with integrity and accountability.",
      image: BiliranImage1,
    },
    {
      title: "Our Mission and Vision",
      icon: <Target className="text-blue-700" size={28} />,
      content: "We stand by the principles of responsible leadership, transparency, and inclusivity. Our goals are:",
      list: [
        "Create and implement ordinances and resolutions that truly address community needs",
        "Strengthen citizen participation in local government governance",
        "Ensure that every project and program is centered on the long-term development of the province",
        "Protect integrity and accountability in all government actions",
      ],
      image: BiliranImage2,
    },
    {
      title: "Our Composition",
      icon: <Users className="text-blue-700" size={28} />,
      content: "The Sangguniang Panlalawigan is composed of:",
      list: [
        "10 elected members from the two districts (five members per district)",
        "Vice Governor as chairperson, with a vote only in case of a tie",
        "Ex officio members from the Liga ng mga Barangay and Sangguniang Kabataan",
      ],
      additionalContent:
        "Each member is elected through plurality-at-large voting, serves a three-year term, and can serve up to three consecutive terms.",
      image: BiliranImage3,
    },
    {
      title: "Our Office",
      icon: <MapPin className="text-blue-700" size={28} />,
      content:
        "Our office is located at the Biliran Provincial Capitol, Barangay Calumpang, Naval, Biliran, where we are open for communication and service to all citizens. With every ordinance, project, and program, our goal is to ensure that Every Voice in Biliran is Heard and Valued.",
      image: CapitolOfficeImage,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselContent.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselContent.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselContent.length) % carouselContent.length);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const fadeSlide = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        initial="hidden"
        animate={heroInView ? "visible" : "hidden"}
        variants={fadeIn}
        className="relative bg-gradient-to-r from-blue-800 via-blue-900 to-indigo-900 py-28 px-4 text-white"
      >
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-5 text-4xl font-serif font-bold md:text-5xl lg:text-6xl tracking-tight"
          >
            About the Sangguniang Panlalawigan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mx-auto max-w-2xl text-lg md:text-xl opacity-90 leading-relaxed"
          >
            The legislative heart of Biliran Province — serving with integrity, transparency, and unwavering commitment to public service.
          </motion.p>
        </div>
      </motion.section>

      <div className="container mx-auto max-w-7xl px-4 -mt-16 pb-20">
        <motion.div
          ref={introRef}
          initial="hidden"
          animate={introInView ? "visible" : "hidden"}
          variants={fadeIn}
          className="mb-20 max-w-4xl mx-auto"
        >
        </motion.div>

        <motion.div
          className="mb-10"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Content Panel */}
              <div className="relative min-h-[520px] p-8 lg:p-10 flex flex-col">
                {carouselContent.map((item, index) => (
                  <motion.div
                    key={index}
                    initial="hidden"
                    animate={index === currentSlide ? "visible" : "hidden"}
                    variants={fadeSlide}
                    className="absolute inset-0 p-8 lg:p-10"
                  >
                    <div className="mb-6 flex items-center gap-4">
                      {item.icon}
                      <h2 className="text-2xl font-serif font-bold text-gray-800">{item.title}</h2>
                    </div>

                    <p className="mb-5 text-gray-700 leading-relaxed">{item.content}</p>

                    {item.list && (
                      <ul className="mb-5 space-y-2 text-gray-700 pl-1">
                        {item.list.map((point, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-blue-600 mr-2 mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {item.additionalContent && (
                      <p className="text-gray-700 leading-relaxed">{item.additionalContent}</p>
                    )}
                  </motion.div>
                ))}

                {/* Controls */}
                <div className="mt-auto pt-6 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button
                      onClick={prevSlide}
                      aria-label="Previous"
                      className="p-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <button
                      onClick={nextSlide}
                      aria-label="Next"
                      className="p-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {carouselContent.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        aria-label={`Slide ${idx + 1}`}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          idx === currentSlide ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Image Panel */}
              <div className="relative h-96 lg:h-auto lg:min-h-[520px]">
                {carouselContent.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: index === currentSlide ? 1 : 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          ref={ctaRef}
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          variants={fadeIn}
          className="rounded-2xl overflow-hidden shadow-xl border border-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Map */}
            <div className="h-80 md:h-auto">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.8008751617217!2d124.4071681108963!3d11.56612798858736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a78ca4a4ed2563%3A0xdf64c9ca39745dc9!2sBiliran%20Provincial%20Capitol-Building!5e0!3m2!1sen!2sph!4v1756898261063!5m2!1sen!2sph"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Biliran Provincial Capitol Building"
              />
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-br from-blue-700 to-blue-900 p-8 text-white">
              <h2 className="text-3xl font-serif font-bold mb-5">Contact the Office</h2>
              <p className="mb-7 text-lg opacity-90 leading-relaxed">
                We welcome your inquiries, suggestions, and partnership in building a better Biliran.
              </p>

              <div className="space-y-5">
                {[
                  { icon: <Map size={22} />, label: "Address", value: "Biliran Provincial Capitol, Barangay Calumpang, Naval, Biliran" },
                  { icon: <Phone size={22} />, label: "Phone", value: "(053) 500-0000" },
                  { icon: <Mail size={22} />, label: "Email", value: "info@biliransp.gov.ph" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 text-blue-200">{item.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg">{item.label}</h3>
                      <p className="opacity-90">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUsPage;