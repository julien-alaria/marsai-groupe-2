
import { Link } from "react-router";
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, useRef } from "react";


export default function Navbar() {
  const { i18n } = useTranslation();
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");

  /*rend la navbar invisible pendant le scroll et la fait réapparaître après 300ms d'inactivité de scroll*/

  const [isVisible, setIsVisible] = useState(true); 
  useEffect(() => { let timeout; const handleScroll = () => { setIsVisible(false);

  clearTimeout(timeout); timeout = setTimeout(() => { setIsVisible(true);
}, 300); }; 

window.addEventListener("scroll", handleScroll); return () => 
  window.removeEventListener("scroll", handleScroll); }, []);

/*rend la navbar transparente et légèrement déplacée vers le haut 
lorsque l'utilisateur est en haut de la page, 
et la rend opaque et repositionnée lorsqu'il fait défiler vers le bas*/

const [isAtTop, setIsAtTop] = useState(true); 
useEffect(() => { 
  const handleScrollTop = () => { setIsAtTop(window.scrollY < 10); }; 
  window.addEventListener("scroll", handleScrollTop); return () => 
    window.removeEventListener("scroll", handleScrollTop); }, []);

  function handleLogout() {
    localStorage.clear();
    window.location.href = "/";
  }

  return (
    <div className={`flex mt-0 ml-2.5 mr-2.5 bg-black/30 text-white text-xl uppercase rounded-full justify-between items-center p-1 border-white/30 border-2 fixed top-8 left-0 right-0 z-50 transition-all duration-300
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}
        ${isAtTop ? "bg-transparent" : "bg-black/100"}
      `}>
      {/*logo */}
      <Link to="/">
        <div className=" ml-3 flex gap-2.5 items-center">
          <div className="text-white text-3xl uppercase font-bold">Mars</div> 
          <div className="text-3xl font-boldtext-3xl uppercase font-bold bg-linear-to-b from-[#AD46FF] to-[#F6339A] bg-clip-text text-transparent">AI</div>
        </div>
      </Link>

      <div className=" flex gap-6 items-center font-bold">
        {/* home */}
        <Link to="/" className="mr-4 hover:text-[#F6339A]">
          <svg
            height="30"
            width="30"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            >
              <path d="M6.133 21C4.955 21 4 20.02 4 18.81v-8.802c0-.665.295-1.295.8-1.71l5.867-4.818a2.09 2.09 0 0 1 2.666 0l5.866 4.818c.506.415.801 1.045.801 1.71v8.802c0 1.21-.955 2.19-2.133 2.19H6.133Z" />
              <path d="M9.5 21v-5.5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2V21" />
            </g>
          </svg>
        </Link>
        {/* agenda */}
        <Link to="/program" className="mr-4 hover:text-[#F6339A]">
          <svg
            height="20"
            width="20"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 4c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4zm2 2v12h14V6H3zm2-6h2v2H5V0zm8 0h2v2h-2V0zM5 9h2v2H5V9zm0 4h2v2H5v-2zm4-4h2v2H9V9zm0 4h2v2H9v-2zm4-4h2v2h-2V9zm0 4h2v2h-2v-2z"
              fill="currentColor"
            />
          </svg>
        </Link>
        {/* jury*/}
        <Link to="/juryPublic" className="mr-4 hover:text-[#F6339A]">
          <svg
            height="30"
            width="30"
            viewBox="0 0 17 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.953 14H6.016v1.031H5V16h7v-.969h-1.047V14zM8.016 4v8.953h.953V4H13.5L8.969 2.833V1.016h-.953v1.817L3.469 4h4.547zM3.492 5.979l1.9 4.005l.566-.207l-2.225-4.609c-.053-.098-.157-.16-.298-.152c-.128.005-.239.075-.279.175L1.012 9.8l.588.162l1.892-3.983zm9.69-.784l-2.158 4.619l.592.162l1.902-3.99L15.43 10l.57-.208l-2.238-4.619c-.053-.097-.16-.159-.299-.151c-.13.003-.24.075-.281.173zm2.802 5.836c0 1.061-1.112 1.922-2.484 1.922c-1.372 0-2.484-.861-2.484-1.922h4.968zm-10 0c0 1.061-1.112 1.922-2.484 1.922c-1.372 0-2.484-.861-2.484-1.922h4.968z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
        </Link>
        {/* sponsors */}
        <Link to="/sponsors" className="mr-4 hover:text-[#F6339A]">
          <svg
            height="30"
            width="30"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m21 3.031l-.656.719c-1.469 1.617-2.68 2.34-3.688 2.813c-1.008.472-1.855.613-2.687 1.25c-.887.68-2.176 1.984-2.719 4.312c-1.164.254-2.016.7-2.688 1.281c-.664.574-1.164 1.227-1.78 1.938c-.005.008.003.023 0 .031c-.884 1.016-1.657 2.11-3.157 2.688l-.625.25V29h19.063c1.093-.059 1.851-.816 2.312-1.563c.46-.746.715-1.554.844-2.218c.332-1.692.937-6.563.937-6.563l.032-.093v-.094c-.032-.676-.31-1.25-.657-1.782l1.125-3.343l1.782-2.688l.5-.719l-.657-.593l-6.562-5.688zm.063 2.75l5.218 4.532l-1.375 2.03l-.093.095l-.032.156l-.906 2.687c-.473-.195-.96-.332-1.5-.312h-.063L16 15h-1v3.875c-.14 1.09-.746 1.512-1.5 1.813c-.25.101-.281.046-.5.093V14.97c-.164-3.707 1.156-4.774 2.188-5.563c.285-.219 1.12-.472 2.312-1.031c.996-.469 2.234-1.309 3.563-2.594zm-10 8.594c-.004.227-.075.387-.063.625v8h1s1.07-.012 2.219-.469c1.148-.457 2.535-1.527 2.781-3.406V17l5.375-.031h.031a1.662 1.662 0 0 1 1.75 1.562c-.004.016-.05.387-.062.469H20v2h3.844c-.106.773-.203 1.258-.313 2H20v2h3.219a5.002 5.002 0 0 1-.563 1.375c-.273.445-.508.613-.718.625H5v-7.469c1.621-.86 2.629-2.097 3.281-2.843c.676-.774 1.14-1.36 1.594-1.75c.297-.254.762-.399 1.188-.563z"
              fill="currentColor"
            />
          </svg>
        </Link>
        {/* infos */}
        <Link to="/infos" className="mr-4 hover:text-[#F6339A]">
          <svg
            height="30"
            width="30"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="none" stroke="currentColor">
              <path
                d="M15 14h1v9h1m12-7a13 13 0 1 1-26 0a13 13 0 0 1 26 0Z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M17 9.5a1 1 0 1 1-2 0a1 1 0 0 1 2 0Z"
                fill="currentColor"
              />
            </g>
          </svg>
        </Link>
      </div>








<div className="flex items-center gap-2">
  <button 
    //onClick={() => i18n.changeLanguage('fr')}
    onClick={() => {
    i18n.changeLanguage('fr');
    localStorage.setItem('lang', 'fr');
  }}

    title="Français"
    style={{
      opacity: i18n.language === 'fr' ? 1 : 0.5,
      cursor: 'pointer',
      transition: 'opacity 0.3s',
      background: 'none',
      border: 'none'
    }}
  >
    {/*SVG Drapeau FR */}
    <svg height="25" width="25" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <mask id="circleFlagsFr0">
        <circle cx="256" cy="256" fill="#fff" r="256"/>
      </mask>
      <g mask="url(#circleFlagsFr0)">
        <path d="M167 0h178l25.9 252.3L345 512H167l-29.8-253.4z" fill="#eee"/>
        <path d="M0 0h167v512H0z" fill="#0052b4"/>
        <path d="M345 0h167v512H345z" fill="#d80027"/>
      </g>
    </svg>
  </button>

  <button 
    //onClick={() => i18n.changeLanguage('en')}
    onClick={() => {
    i18n.changeLanguage('en');
    localStorage.setItem('lang', 'en');
  }}
  
    title="English"
    style={{
      opacity: i18n.language === 'en' ? 1 : 0.5,
      cursor: 'pointer',
      transition: 'opacity 0.3s',
      background: 'none',
      border: 'none'
    }}
  >
     {/*SVG Drapeau EN */}
    <svg height="25" width="25" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <mask id="circleFlagsEn0">
        <circle cx="256" cy="256" fill="#fff" r="256"/>
      </mask>
      <g mask="url(#circleFlagsEn0)">
        <path d="m0 0l8 22l-8 23v23l32 54l-32 54v32l32 48l-32 48v32l32 54l-32 54v68l22-8l23 8h23l54-32l54 32h32l48-32l48 32h32l54-32l54 32h68l-8-22l8-23v-23l-32-54l32-54v-32l-32-48l32-48v-32l-32-54l32-54V0l-22 8l-23-8h-23l-54 32l-54-32h-32l-48 32l-48-32h-32l-54 32L68 0z" fill="#eee"/>
        <path d="M336 0v108L444 0Zm176 68L404 176h108zM0 176h108L0 68ZM68 0l108 108V0Zm108 512V404L68 512ZM0 444l108-108H0Zm512-108H404l108 108Zm-68 176L336 404v108z" fill="#0052b4"/>
        <path d="M0 0v45l131 131h45zm208 0v208H0v96h208v208h96V304h208v-96H304V0zm259 0L336 131v45L512 0zM176 336L0 512h45l131-131zm160 0l176 176v-45L381 336z" fill="#d80027"/>
      </g>
    </svg>
  </button>


        <div className=" mr-3">
          {firstName ? (
            <>
              <span className="mr-4">
                Hello, {firstName}
                {lastName && ` ${lastName}`}
              </span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/auth/login">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-8 h-8 hover:opacity-80 transition-opacity"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
    
  
  );
}
