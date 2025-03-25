import { useState } from "react";
import { AiOutlineHome, AiOutlineMail, AiOutlineMenu, AiOutlineClose, AiOutlineProject } from "react-icons/ai";
import { BsPerson } from "react-icons/bs";
import { GrProjects } from "react-icons/gr";
import { LuGamepad2 } from "react-icons/lu";

export const SideNav = () => {
    const [nav, setNav] = useState(false); // State to manage mobile navigation visibility

    // Toggle mobile navigation
    const handleNav = () => {
        setNav(!nav);
    };

    // Smooth scroll to section and hide mobile nav
    const handleClick = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
        setNav(false); // Hide mobile nav after clicking a link
    };

    return (
        <div>
            {/* Fixed Hamburger Icon for Mobile */}
            <div className="fixed top-4 right-4 z-[999] md:hidden">
                {nav ? (
                    <AiOutlineClose
                        size={25}
                        onClick={handleNav}
                        className="cursor-pointer text-cyan-400 hover:text-cyan-300 transition-transform duration-300 transform rotate-180"
                    />
                ) : (
                    <AiOutlineMenu
                        size={25}
                        onClick={handleNav}
                        className="cursor-pointer text-cyan-400 hover:text-cyan-300 transition-transform duration-300"
                    />
                )}
            </div>

            {/* Mobile Navigation Menu */}
            <div
                className={`fixed w-full h-screen bg-black/50 backdrop-blur-md flex flex-col justify-center items-center z-60 md:hidden transition-all duration-300 ease-in-out ${nav ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
            >
                <a
                    onClick={() => handleClick("main")}
                    className="w-[75%] flex justify-center items-center rounded-full bg-cyan-600/40 border border-cyan-400/30 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-cyan-400/20"
                >
                    <AiOutlineHome size={20} className="text-cyan-200" />
                    <span className="pl-4 text-cyan-100">Home</span>
                </a>

                <a
                    onClick={() => handleClick("work")}
                    className="w-[75%] flex justify-center items-center rounded-full bg-purple-600/40 border border-purple-400/30 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-purple-400/20"
                >
                    <GrProjects size={20} className="text-purple-200" />
                    <span className="pl-4 text-purple-200">Work</span>
                </a>

                <a
                    onClick={() => handleClick("projects")}
                    className="w-[75%] flex justify-center items-center rounded-full bg-pink-600/40 border border-pink-400/30 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-pink-400/20"
                >
                    <AiOutlineProject size={20} className="text-pink-200" />
                    <span className="pl-4 text-pink-200">Projects</span>
                </a>

                <a
                    onClick={() => handleClick("resume")}
                    className="w-[75%] flex justify-center items-center rounded-full bg-cyan-600/40 border border-cyan-400/30 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-cyan-400/20"
                >
                    <BsPerson size={20} className="text-cyan-200" />
                    <span className="pl-4 text-cyan-200">Resume</span>
                </a>

                <a
                    onClick={() => handleClick("contact")}
                    className="w-[75%] flex justify-center items-center rounded-full bg-purple-600/40 border border-purple-400/30 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-purple-400/20"
                >
                    <AiOutlineMail size={20} className="text-purple-200" />
                    <span className="pl-4 text-purple-200">Contact</span>
                </a>

                <a
                    onClick={() => handleClick("cyber-fish")}
                    className="w-[75%] flex justify-center items-center rounded-full bg-pink-600/40 border border-pink-400/30 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-purple-400/20"
                >
                    <LuGamepad2 size={20} className="text-purple-200" />
                    <span className="pl-4 text-pink-200">Cyber Fish</span>
                </a>
            </div>

            {/* Desktop Navigation Menu */}
            <div className="md:block hidden fixed top-[25%] z-10 left-2">
                <div className="flex flex-col">
                    <a
                        onClick={() => handleClick("main")}
                        className="relative flex items-center rounded-full bg-cyan-400/10 border border-cyan-400/30 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-cyan-400/20 backdrop-blur-sm group overflow-hidden w-13.5 hover:w-32 transition-all duration-300"
                    >
                        <AiOutlineHome size={20} className="text-cyan-400 min-w-[20px]" />
                        <span className="text-cyan-400 ml-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Home
                        </span>
                    </a>

                    <a
                        onClick={() => handleClick("work")}
                        className="relative flex items-center rounded-full bg-purple-400/10 border border-purple-400/30 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-purple-400/20 backdrop-blur-sm group overflow-hidden w-13.5 hover:w-32 transition-all duration-300"
                    >
                        <GrProjects size={20} className="text-purple-400 min-w-[20px]" />
                        <span className="text-purple-400 ml-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Work
                        </span>
                    </a>

                    <a
                        onClick={() => handleClick("projects")}
                        className="relative flex items-center rounded-full bg-pink-400/10 border border-pink-400/30 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-pink-400/20 backdrop-blur-sm group overflow-hidden w-13.5 hover:w-32 transition-all duration-300"
                    >
                        <AiOutlineProject size={20} className="text-pink-400 min-w-[20px]" />
                        <span className="text-pink-400 ml-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Projects
                        </span>
                    </a>

                    <a
                        onClick={() => handleClick("resume")}
                        className="relative flex items-center rounded-full bg-cyan-400/10 border border-cyan-400/30 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-cyan-400/20 backdrop-blur-sm group overflow-hidden w-13.5 hover:w-32 transition-all duration-300"
                    >
                        <BsPerson size={20} className="text-cyan-400 min-w-[20px]" />
                        <span className="text-cyan-400 ml-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Resume
                        </span>
                    </a>

                    <a
                        onClick={() => handleClick("contact")}
                        className="relative flex items-center rounded-full bg-purple-400/10 border border-purple-400/30 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-purple-400/20 backdrop-blur-sm group overflow-hidden w-13.5 hover:w-32 transition-all duration-300"
                    >
                        <AiOutlineMail size={20} className="text-purple-400 min-w-[20px]" />
                        <span className="text-purple-400 ml-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Contact
                        </span>
                    </a>

                    <a
                        onClick={() => handleClick("cyber-fish")}
                        className="relative flex items-center rounded-full bg-pink-400/10 border border-pink-400/30 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-pink-400/20 backdrop-blur-sm group overflow-hidden w-13.5 hover:w-36 transition-all duration-300"
                    >
                        <LuGamepad2 size={20} className="text-pink-400 min-w-[20px]" />
                        <span className="text-pink-400 ml-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-2">
                            Cyber Fish
                        </span>
                    </a>
                </div>
            </div>

        </div>
    );
};

export default SideNav;