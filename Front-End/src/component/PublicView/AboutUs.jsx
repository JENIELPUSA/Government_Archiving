import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Users, 
  Target, 
  MapPin, 
  ArrowLeft,
  ArrowRight,
  Phone,
  Mail,
  Map
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import BiliranImage1 from "../../assets/aboutpic1.jpg";
import BiliranImage2 from "../../assets/aboutpic3.jpeg";
import BiliranImage3 from "../../assets/aboutpic2.jpg";
import CapitolOfficeImage from "../../assets/CapitolOfficeImage.png"; // Import gambar Capitol Office

const AboutUsPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Refs for scroll animations
  const heroRef = useRef(null);
  const introRef = useRef(null);
  const carouselRef = useRef(null);
  const historyRef = useRef(null);
  const missionRef = useRef(null);
  const compositionRef = useRef(null);
  const officeRef = useRef(null);
  const ctaRef = useRef(null);
  
  // Check if elements are in view
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const introInView = useInView(introRef, { once: true, margin: "-50px" });
  const carouselInView = useInView(carouselRef, { once: true, margin: "-50px" });
  const historyInView = useInView(historyRef, { once: true, margin: "-50px" });
  const missionInView = useInView(missionRef, { once: true, margin: "-50px" });
  const compositionInView = useInView(compositionRef, { once: true, margin: "-50px" });
  const officeInView = useInView(officeRef, { once: true, margin: "-50px" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-50px" });

  // Sample government-themed images (replace with actual images)
  const carouselImages = [
    "https://images.unsplash.com/photo-1593115057322-e94b77572f20?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
    BiliranImage1,
    BiliranImage2,
    BiliranImage3
  ];

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Navigate to next/previous slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
  };

  const scaleUp = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        initial="hidden"
        animate={heroInView ? "visible" : "hidden"}
        variants={fadeInUp}
        className="relative py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-800 text-white"
      >
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">🏛️ About Us</h1>
          <p className="text-xl max-w-3xl">
            The Sangguniang Panlalawigan of Biliran is the heart of legislative governance in the province.
          </p>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-12 -mt-16">
        {/* Intro Card */}
        <motion.div 
          ref={introRef}
          initial="hidden"
          animate={introInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="bg-white rounded-xl shadow-lg p-6 mb-12 backdrop-blur-sm bg-opacity-90"
        >
          <p className="text-lg text-gray-700">
            From ordinances to policies, we drive initiatives that promote development, justice, and the common good of the people. Composed of elected representatives from the two districts, with the Vice Governor as chairperson, our body ensures orderly and effective governance of all provincial matters.
          </p>
        </motion.div>

        {/* Image Carousel */}
        <motion.div 
          ref={carouselRef}
          initial="hidden"
          animate={carouselInView ? "visible" : "hidden"}
          variants={scaleUp}
          className="relative h-96 rounded-xl overflow-hidden mb-12 shadow-lg"
        >
          {carouselImages.map((image, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={image} 
                alt={`Government building ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          
          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
          >
            <ArrowRight size={24} />
          </button>
          
          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Grid Layout for Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* History Section */}
          <motion.div 
            ref={historyRef}
            initial="hidden"
            animate={historyInView ? "visible" : "hidden"}
            variants={fadeInLeft}
            className="bg-white rounded-xl shadow-lg p-6 transition-transform duration-300 hover:scale-[1.02] backdrop-blur-sm bg-opacity-90"
          >
            <div className="flex items-center mb-4">
              <Clock className="text-blue-600 mr-2" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">📜 Our History</h2>
            </div>
            <p className="text-gray-700">
              The history of the Sangguniang Panlalawigan of Biliran is as rich as the history of the province itself. From being a sub-province of Leyte, Biliran became a full-fledged province in 1992, and with it came the establishment of the Sangguniang Panlalawigan as the primary legislative branch. Over time, the Sangguniang Panlalawigan has been the center of educational, health, infrastructure, and livelihood programs, and continues to serve the people with integrity and accountability.
            </p>
          </motion.div>

          {/* Mission & Vision Section */}
          <motion.div 
            ref={missionRef}
            initial="hidden"
            animate={missionInView ? "visible" : "hidden"}
            variants={fadeInRight}
            className="bg-white rounded-xl shadow-lg p-6 transition-transform duration-300 hover:scale-[1.02] backdrop-blur-sm bg-opacity-90"
          >
            <div className="flex items-center mb-4">
              <Target className="text-blue-600 mr-2" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">🎯 Our Mission and Vision</h2>
            </div>
            <p className="text-gray-700 mb-4">
              We stand by the principles of responsible leadership, transparency, and inclusivity. Our goals are:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Create and implement ordinances and resolutions that truly address community needs</li>
              <li>Strengthen citizen participation in local government governance</li>
              <li>Ensure that every project and program is centered on the long-term development of the province</li>
              <li>Protect integrity and accountability in all government actions</li>
            </ul>
          </motion.div>

          {/* Composition Section */}
          <motion.div 
            ref={compositionRef}
            initial="hidden"
            animate={compositionInView ? "visible" : "hidden"}
            variants={fadeInLeft}
            className="bg-white rounded-xl shadow-lg p-6 transition-transform duration-300 hover:scale-[1.02] backdrop-blur-sm bg-opacity-90"
          >
            <div className="flex items-center mb-4">
              <Users className="text-blue-600 mr-2" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">🗳️ Our Composition</h2>
            </div>
            <p className="text-gray-700">
              The Sangguniang Panlalawigan is composed of:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
              <li>10 elected members from the two districts (five members per district)</li>
              <li>Vice Governor as chairperson, with a vote only in case of a tie</li>
              <li>Ex officio members from the Liga ng mga Barangay and Sangguniang Kabataan</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Each member is elected through plurality-at-large voting, serves a three-year term, and can serve up to three consecutive terms.
            </p>
          </motion.div>

          {/* Office Location Section */}
          <motion.div 
            ref={officeRef}
            initial="hidden"
            animate={officeInView ? "visible" : "hidden"}
            variants={fadeInRight}
            className="bg-white rounded-xl shadow-lg p-6 transition-transform duration-300 hover:scale-[1.02] backdrop-blur-sm bg-opacity-90"
          >
            <div className="flex items-center mb-4">
              <MapPin className="text-blue-600 mr-2" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">🏢 Our Office</h2>
            </div>
            <p className="text-gray-700">
              Our office is located at the Biliran Provincial Capitol, Barangay Calumpang, Naval, Biliran, where we are open for communication and service to all citizens. With every ordinance, project, and program, our goal is to ensure that <span className="font-semibold">Every Voice in Biliran is Heard and Valued</span>.
            </p>
          </motion.div>
        </div>

        {/* Call to Action Section - Diubah untuk menampilkan gambar Capitol Office */}
        <motion.div 
          ref={ctaRef}
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="mt-16 rounded-xl overflow-hidden shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Gambar Capitol Office */}
            <div className="h-80 md:h-auto">
              <img 
                src={CapitolOfficeImage} 
                alt="Biliran Provincial Capitol Building" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Informasi Kontak */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
              <p className="text-xl mb-6">
                We are here to listen and serve you. We invite you to collaborate for the progress of Biliran.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <Map className="mt-1 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p>Biliran Provincial Capitol, Barangay Calumpang, Naval, Biliran</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="mt-1 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p>(053) 500-0000</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="mt-1 mr-3 flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p>info@biliransp.gov.ph</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUsPage;