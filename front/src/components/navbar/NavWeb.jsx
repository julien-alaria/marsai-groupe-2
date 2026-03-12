// import { Link } from "react-router";
// import { useTranslation } from "react-i18next";
// import { useEffect, useState } from "react";

// export default function NavWeb() {
//   const { i18n } = useTranslation();

//   const firstName = localStorage.getItem("firstName");
//   const lastName = localStorage.getItem("lastName");
//   const role = localStorage.getItem("role");

//   const roleHomePath = {
//     ADMIN: "/admin",
//     PRODUCER: "/producer",
//     JURY: "/jury",
//   };

//   const userHomePath = role ? roleHomePath[role] : null;

//   const [isVisible, setIsVisible] = useState(true);
//   const [isAtTop, setIsAtTop] = useState(true);

//   useEffect(() => {
//     let timeout;

//     const handleScroll = () => {
//       setIsVisible(false);
//       clearTimeout(timeout);
//       timeout = setTimeout(() => {
//         setIsVisible(true);
//       }, 300);
//     };

//     window.addEventListener("scroll", handleScroll);

//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//       clearTimeout(timeout);
//     };
//   }, []);

//   useEffect(() => {
//     const handleScrollTop = () => {
//       setIsAtTop(window.scrollY < 10);
//     };

//     window.addEventListener("scroll", handleScrollTop);

//     return () => {
//       window.removeEventListener("scroll", handleScrollTop);
//     };
//   }, []);

//   function handleLogout() {
//     localStorage.clear();
//     window.location.href = "/";
//   }

//   return (
//     <div
//       className={`hidden md:flex mt-0 ml-2.5 mr-2.5 text-white text-xl uppercase rounded-full justify-between items-center p-1 border-white/30 border-2 fixed top-8 left-0 right-0 z-50 transition-all duration-300 ${
//         isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
//       } ${isAtTop ? "bg-transparent" : "bg-black/100"}`}
//     >
//       {/* Logo */}
//       <Link to="/">
//         <div className="ml-3 flex gap-2.5 items-center">
//           <div className="text-white text-3xl uppercase font-bold">Mars</div>
//           <div className="text-3xl font-bold uppercase bg-linear-to-b from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">
//             AI
//           </div>
//         </div>
//       </Link>

//       {/* Liens */}
//       <div className="flex gap-6 items-center font-bold">
//         {/* Home */}
//         <Link to="/" className="mr-4 hover:text-[#F6339A]">
//           <svg
//             height="30"
//             width="30"
//             viewBox="0 0 24 24"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <g
//               fill="none"
//               stroke="currentColor"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="1.5"
//             >
//               <path d="M6.133 21C4.955 21 4 20.02 4 18.81v-8.802c0-.665.295-1.295.8-1.71l5.867-4.818a2.09 2.09 0 0 1 2.666 0l5.866 4.818c.506.415.801 1.045.801 1.71v8.802c0 1.21-.955 2.19-2.133 2.19H6.133Z" />
//               <path d="M9.5 21v-5.5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2V21" />
//             </g>
//           </svg>
//         </Link>

//         {/* Agenda */}
//         <Link to="/program" className="mr-4 hover:text-[#F6339A]">
//           <svg
//             height="20"
//             width="20"
//             viewBox="0 0 20 20"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               d="M1 4c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4zm2 2v12h14V6H3zm2-6h2v2H5V0zm8 0h2v2h-2V0zM5 9h2v2H5V9zm0 4h2v2H5v-2zm4-4h2v2H9V9zm0 4h2v2H9v-2zm4-4h2v2h-2V9zm0 4h2v2h-2v-2z"
//               fill="currentColor"
//             />
//           </svg>
//         </Link>

//         {/* Jury */}
//         <Link to="/juryPublic" className="mr-4 hover:text-[#F6339A]">
//           <svg
//             height="30"
//             width="30"
//             viewBox="0 0 17 16"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               d="M10.953 14H6.016v1.031H5V16h7v-.969h-1.047V14zM8.016 4v8.953h.953V4H13.5L8.969 2.833V1.016h-.953v1.817L3.469 4h4.547zM3.492 5.979l1.9 4.005l.566-.207l-2.225-4.609c-.053-.098-.157-.16-.298-.152c-.128.005-.239.075-.279.175L1.012 9.8l.588.162l1.892-3.983zm9.69-.784l-2.158 4.619l.592.162l1.902-3.99L15.43 10l.57-.208l-2.238-4.619c-.053-.097-.16-.159-.299-.151c-.13.003-.24.075-.281.173zm2.802 5.836c0 1.061-1.112 1.922-2.484 1.922c-1.372 0-2.484-.861-2.484-1.922h4.968zm-10 0c0 1.061-1.112 1.922-2.484 1.922c-1.372 0-2.484-.861-2.484-1.922h4.968z"
//               fill="currentColor"
//               fillRule="evenodd"
//             />
//           </svg>
//         </Link>

//         {/* Sponsors */}
//         <Link to="/sponsors" className="mr-4 hover:text-[#F6339A]">
//           <svg
//             height="30"
//             width="30"
//             viewBox="0 0 32 32"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               d="m21 3.031l-.656.719c-1.469 1.617-2.68 2.34-3.688 2.813c-1.008.472-1.855.613-2.687 1.25c-.887.68-2.176 1.984-2.719 4.312c-1.164.254-2.016.7-2.688 1.281c-.664.574-1.164 1.227-1.78 1.938c-.005.008.003.023 0 .031c-.884 1.016-1.657 2.11-3.157 2.688l-.625.25V29h19.063c1.093-.059 1.851-.816 2.312-1.563c.46-.746.715-1.554.844-2.218c.332-1.692.937-6.563.937-6.563l.032-.093v-.094c-.032-.676-.31-1.25-.657-1.782l1.125-3.343l1.782-2.688l.5-.719l-.657-.593l-6.562-5.688zm.063 2.75l5.218 4.532l-1.375 2.03l-.093.095l-.032.156l-.906 2.687c-.473-.195-.96-.332-1.5-.312h-.063L16 15h-1v3.875c-.14 1.09-.746 1.512-1.5 1.813c-.25.101-.281.046-.5.093V14.97c-.164-3.707 1.156-4.774 2.188-5.563c.285-.219 1.12-.472 2.312-1.031c.996-.469 2.234-1.309 3.563-2.594zm-10 8.594c-.004.227-.075.387-.063.625v8h1s1.07-.012 2.219-.469c1.148-.457 2.535-1.527 2.781-3.406V17l5.375-.031h.031a1.662 1.662 0 0 1 1.75 1.562c-.004.016-.05.387-.062.469H20v2h3.844c-.106.773-.203 1.258-.313 2H20v2h3.219a5.002 5.002 0 0 1-.563 1.375c-.273.445-.508.613-.718.625H5v-7.469c1.621-.86 2.629-2.097 3.281-2.843c.676-.774 1.14-1.36 1.594-1.75c.297-.254.762-.399 1.188-.563z"
//               fill="currentColor"
//             />
//           </svg>
//         </Link>

//         {/* Infos */}
//         <Link to="/infos" className="mr-4 hover:text-[#F6339A]">
//           <svg
//             height="30"
//             width="30"
//             viewBox="0 0 32 32"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <g fill="none" stroke="currentColor">
//               <path
//                 d="M15 14h1v9h1m12-7a13 13 0 1 1-26 0a13 13 0 0 1 26 0Z"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//               />
//               <path
//                 d="M17 9.5a1 1 0 1 1-2 0a1 1 0 0 1 2 0Z"
//                 fill="currentColor"
//               />
//             </g>
//           </svg>
//         </Link>
//       </div>

//       {/* Langues et login/logout */}
//       <div className="flex items-center gap-2">
//         {/* FR */}
//         <button
//           onClick={() => {
//             i18n.changeLanguage("fr");
//             localStorage.setItem("lang", "fr");
//           }}
//           title="Français"
//           style={{
//             opacity: i18n.language === "fr" ? 1 : 0.5,
//             cursor: "pointer",
//             transition: "opacity 0.3s",
//             background: "none",
//             border: "none",
//           }}
//         >
//           <svg
//             height="25"
//             width="25"
//             viewBox="0 0 512 512"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <mask id="circleFlagsFr0">
//               <circle cx="256" cy="256" fill="#fff" r="256" />
//             </mask>
//             <g mask="url(#circleFlagsFr0)">
//               <path
//                 d="M167 0h178l25.9 252.3L345 512H167l-29.8-253.4z"
//                 fill="#eee"
//               />
//               <path d="M0 0h167v512H0z" fill="#0052b4" />
//               <path d="M345 0h167v512H345z" fill="#d80027" />
//             </g>
//           </svg>
//         </button>

//         {/* EN */}
//         <button
//           onClick={() => {
//             i18n.changeLanguage("en");
//             localStorage.setItem("lang", "en");
//           }}
//           title="English"
//           style={{
//             opacity: i18n.language === "en" ? 1 : 0.5,
//             cursor: "pointer",
//             transition: "opacity 0.3s",
//             background: "none",
//             border: "none",
//           }}
//         >
//           <svg
//             height="25"
//             width="25"
//             viewBox="0 0 512 512"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <mask id="circleFlagsEn0">
//               <circle cx="256" cy="256" fill="#fff" r="256" />
//             </mask>
//             <g mask="url(#circleFlagsEn0)">
//               <path
//                 d="m0 0l8 22l-8 23v23l32 54l-32 54v32l32 48l-32 48v32l32 54l-32 54v68l22-8l23 8h23l54-32l54 32h32l48-32l48 32h32l54-32l54 32h68l-8-22l8-23v-23l-32-54l32-54v-32l-32-48l32-48v-32l-32-54l32-54V0l-22 8l-23-8h-23l-54 32l-54-32h-32l-48 32l-48-32h-32l-54 32L68 0z"
//                 fill="#eee"
//               />
//               <path
//                 d="M336 0v108L444 0Zm176 68L404 176h108zM0 176h108L0 68ZM68 0l108 108V0Zm108 512V404L68 512ZM0 444l108-108H0Zm512-108H404l108 108Zm-68 176L336 404v108z"
//                 fill="#0052b4"
//               />
//               <path
//                 d="M0 0v45l131 131h45zm208 0v208H0v96h208v208h96V304h208v-96H304V0zm259 0L336 131v45L512 0zM176 336L0 512h45l131-131zm160 0l176 176v-45L381 336z"
//                 fill="#d80027"
//               />
//             </g>
//           </svg>
//         </button>

//         <div className="mr-3">
//           {firstName ? (
//             <>
//               <span className="mr-4">
//                 Hello, {firstName}
//                 {lastName && ` ${lastName}`}
//               </span>

//               <div className="inline-flex items-center gap-2">
//                 {userHomePath && (
//                   <Link to={userHomePath}>
//                     <button className="px-3 py-1 text-sm font-semibold border border-white/40 rounded-full hover:text-[#F6339A] hover:border-[#F6339A] transition-colors">
//                       Account
//                     </button>
//                   </Link>
//                 )}

//                 <button
//                   onClick={handleLogout}
//                   className="px-3 py-1 text-sm font-semibold border border-white/40 rounded-full hover:text-[#F6339A] hover:border-[#F6339A] transition-colors"
//                 >
//                   Logout
//                 </button>
//               </div>
//             </>
//           ) : (
//             <Link to="/auth/login">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth="1.5"
//                 stroke="currentColor"
//                 className="w-8 h-8 hover:opacity-80 transition-opacity"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
//                 />
//               </svg>
//             </Link>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import { Link } from "react-router";
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from "react";

export default function Navbar() {
  const { i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  const role = localStorage.getItem("role");

  const roleHomePath = {
    ADMIN: "/admin",
    PRODUCER: "/producer",
    JURY: "/jury",
  };
  const userHomePath = role ? roleHomePath[role] : null;

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when navigating
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  function handleLogout() {
    localStorage.clear();
    window.location.href = "/";
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
  };

  // Tooltip component (only shown on desktop)
  const Tooltip = ({ text, children }) => (
    <div className="group relative hidden md:block">
      {children}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        {text}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop/Tablet Navigation */}
      <nav className="
        hidden md:flex items-center justify-between
        mx-auto mt-1 w-fit min-w-[800px]
        bg-gradient-to-br from-[#C6CAD2]/30 to-[#0f1114]/10
        backdrop-blur-sm
        text-white rounded-full 
        px-4 py-2
        border border-white/30
        fixed top-2 left-1/2 -translate-x-1/2 z-50 
        transition-all duration-300
        shadow-xl shadow-black/30
        hover:shadow-2xl hover:shadow-blue-500/10
      ">
        {/* Logo - Left */}
        <Link to="/" className="hover:scale-105 transition-transform duration-300 mr-4">
          <div className="flex items-center gap-1">
            <div className="text-white text-xl uppercase font-bold">Mars</div> 
            <div className="text-xl uppercase font-bold bg-gradient-to-b from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">AI</div>
          </div>
        </Link>

        {/* Navigation Links - Center (no tooltips) */}
        <div className="flex items-center gap-1">
          <Link to="/" className="block px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer text-gray-300 hover:text-white text-sm font-medium">
            Home
          </Link>

          <Link to="/program" className="block px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer text-gray-300 hover:text-white text-sm font-medium">
            Program
          </Link>

          <Link to="/juryPublic" className="block px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer text-gray-300 hover:text-white text-sm font-medium">
            Jury
          </Link>

          <Link to="/sponsors" className="block px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer text-gray-300 hover:text-white text-sm font-medium">
            Sponsors
          </Link>

          <Link to="/infos" className="block px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer text-gray-300 hover:text-white text-sm font-medium">
            Info
          </Link>
        </div>

        {/* Right Section - Language & Auth */}
        <div className="flex items-center gap-2 ml-4">
          {/* Language Switcher (with tooltip) */}
          <Tooltip text={i18n.language === 'fr' ? 'Switch to English' : 'Passer en français'}>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer"
            >
              <div className={`
                p-1 rounded-md transition-all duration-300
                ${i18n.language === 'fr' 
                  ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30' 
                  : 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30'
                }
              `}>
                {i18n.language === 'fr' ? (
                  <svg width="18" height="18" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <mask id="circleFlagsFr0">
                      <circle cx="256" cy="256" fill="#fff" r="256"/>
                    </mask>
                    <g mask="url(#circleFlagsFr0)">
                      <path d="M167 0h178l25.9 252.3L345 512H167l-29.8-253.4z" fill="#eee"/>
                      <path d="M0 0h167v512H0z" fill="#0052b4"/>
                      <path d="M345 0h167v512H345z" fill="#d80027"/>
                    </g>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <mask id="circleFlagsEn0">
                      <circle cx="256" cy="256" fill="#fff" r="256"/>
                    </mask>
                    <g mask="url(#circleFlagsEn0)">
                      <path d="m0 0l8 22l-8 23v23l32 54l-32 54v32l32 48l-32 48v32l32 54l-32 54v68l22-8l23 8h23l54-32l54 32h32l48-32l48 32h32l54-32l54 32h68l-8-22l8-23v-23l-32-54l32-54v-32l-32-48l32-48v-32l-32-54l32-54V0l-22 8l-23-8h-23l-54 32l-54-32h-32l-48 32l-48-32h-32l-54 32L68 0z" fill="#eee"/>
                      <path d="M336 0v108L444 0Zm176 68L404 176h108zM0 176h108L0 68ZM68 0l108 108V0Zm108 512V404L68 512ZM0 444l108-108H0Zm512-108H404l108 108Zm-68 176L336 404v108z" fill="#0052b4"/>
                      <path d="M0 0v45l131 131h45zm208 0v208H0v96h208v208h96V304h208v-96H304V0zm259 0L336 131v45L512 0zM176 336L0 512h45l131-131zm160 0l176 176v-45L381 336z" fill="#d80027"/>
                    </g>
                  </svg>
                )}
              </div>
              <span className="text-xs font-medium text-gray-300">
                {i18n.language === 'fr' ? 'FR' : 'EN'}
              </span>
            </button>
          </Tooltip>

          {/* User Section */}
          {firstName ? (
            <div className="flex items-center gap-2">
              <Tooltip text="Dashboard">
                {userHomePath && (
                  <Link to={userHomePath}>
                    <button className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border border-purple-500/30 rounded-lg hover:text-white hover:from-purple-500/30 hover:to-purple-600/30 transition-all duration-300 cursor-pointer">
                      {role?.toLowerCase()}
                    </button>
                  </Link>
                )}
              </Tooltip>
              <Tooltip text="Logout">
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border border-red-500/30 rounded-lg hover:text-white hover:from-red-500/30 hover:to-red-600/30 transition-all duration-300 cursor-pointer"
                >
                  Exit
                </button>
              </Tooltip>
            </div>
          ) : (
            <Tooltip text="Sign in">
              <Link to="/auth/login" className="block">
                <div className="p-2 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    <circle
                      cx="12"
                      cy="8"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M5 20V19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19V20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </Link>
            </Tooltip>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="
        md:hidden
        w-full
        bg-gradient-to-br from-[#C6CAD2]/30 to-[#0f1114]/10
        backdrop-blur-sm
        text-white
        px-4 py-3
        border-b border-white/30
        fixed top-0 left-0 z-50
        transition-all duration-300
        shadow-xl shadow-black/30
      ">
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <Link to="/" onClick={handleLinkClick} className="hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-1">
              <div className="text-white text-xl uppercase font-bold">Mars</div> 
              <div className="text-xl uppercase font-bold bg-gradient-to-b from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">AI</div>
            </div>
          </Link>

          {/* Right Section - Language & Menu Toggle */}
          <div className="flex items-center gap-2">
            {/* Language Switcher (mobile version) */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer"
            >
              <div className={`
                p-1 rounded-md transition-all duration-300
                ${i18n.language === 'fr' 
                  ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30' 
                  : 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30'
                }
              `}>
                {i18n.language === 'fr' ? (
                  <svg width="18" height="18" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <mask id="circleFlagsFr0-mobile">
                      <circle cx="256" cy="256" fill="#fff" r="256"/>
                    </mask>
                    <g mask="url(#circleFlagsFr0-mobile)">
                      <path d="M167 0h178l25.9 252.3L345 512H167l-29.8-253.4z" fill="#eee"/>
                      <path d="M0 0h167v512H0z" fill="#0052b4"/>
                      <path d="M345 0h167v512H345z" fill="#d80027"/>
                    </g>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <mask id="circleFlagsEn0-mobile">
                      <circle cx="256" cy="256" fill="#fff" r="256"/>
                    </mask>
                    <g mask="url(#circleFlagsEn0-mobile)">
                      <path d="m0 0l8 22l-8 23v23l32 54l-32 54v32l32 48l-32 48v32l32 54l-32 54v68l22-8l23 8h23l54-32l54 32h32l48-32l48 32h32l54-32l54 32h68l-8-22l8-23v-23l-32-54l32-54v-32l-32-48l32-48v-32l-32-54l32-54V0l-22 8l-23-8h-23l-54 32l-54-32h-32l-48 32l-48-32h-32l-54 32L68 0z" fill="#eee"/>
                      <path d="M336 0v108L444 0Zm176 68L404 176h108zM0 176h108L0 68ZM68 0l108 108V0Zm108 512V404L68 512ZM0 444l108-108H0Zm512-108H404l108 108Zm-68 176L336 404v108z" fill="#0052b4"/>
                      <path d="M0 0v45l131 131h45zm208 0v208H0v96h208v208h96V304h208v-96H304V0zm259 0L336 131v45L512 0zM176 336L0 512h45l131-131zm160 0l176 176v-45L381 336z" fill="#d80027"/>
                    </g>
                  </svg>
                )}
              </div>
              <span className="text-xs font-medium text-gray-300">
                {i18n.language === 'fr' ? 'FR' : 'EN'}
              </span>
            </button>

            {/* User Icon (mobile) */}
            {firstName ? (
              <div className="flex items-center gap-1">
                <Link to={userHomePath || "#"} onClick={handleLinkClick}>
                  <div className="p-2 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                      {firstName.charAt(0)}
                    </div>
                  </div>
                </Link>
              </div>
            ) : (
              <Link to="/auth/login" onClick={handleLinkClick} className="block">
                <div className="p-2 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    <circle
                      cx="12"
                      cy="8"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M5 20V19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19V20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </Link>
            )}

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-300 hover:text-white transition-colors duration-300"
              >
                {isMobileMenuOpen ? (
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M3 12H21M3 6H21M3 18H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 mx-4 p-4 bg-gray-900/95 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl">
            <div className="flex flex-col gap-2">
              <Link 
                to="/" 
                onClick={handleLinkClick}
                className="px-4 py-3 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer text-gray-300 hover:text-white text-base font-medium"
              >
                Home
              </Link>

              <Link 
                to="/program" 
                onClick={handleLinkClick}
                className="px-4 py-3 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer text-gray-300 hover:text-white text-base font-medium"
              >
                Program
              </Link>

              <Link 
                to="/juryPublic" 
                onClick={handleLinkClick}
                className="px-4 py-3 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer text-gray-300 hover:text-white text-base font-medium"
              >
                Jury
              </Link>

              <Link 
                to="/sponsors" 
                onClick={handleLinkClick}
                className="px-4 py-3 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer text-gray-300 hover:text-white text-base font-medium"
              >
                Sponsors
              </Link>

              <Link 
                to="/infos" 
                onClick={handleLinkClick}
                className="px-4 py-3 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer text-gray-300 hover:text-white text-base font-medium"
              >
                Info
              </Link>

              {/* Mobile User Actions */}
              {firstName && (
                <>
                  <div className="h-px bg-white/10 my-2"></div>
                  <div className="px-4 py-2 text-sm text-gray-400">
                    Logged in as <span className="text-white font-medium">{firstName} {lastName}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      handleLinkClick();
                    }}
                    className="px-4 py-3 text-left rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer text-red-300 hover:text-red-200 text-base font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}