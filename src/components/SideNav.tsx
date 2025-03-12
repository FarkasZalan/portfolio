import { useState } from "react";
import { AiOutlineHome, AiOutlineMail, AiOutlineMenu, AiOutlineProject } from "react-icons/ai";
import { BsPerson } from "react-icons/bs";
import { GrProjects } from "react-icons/gr";

export const SideNav = () => {
    const [nav, setNav] = useState(false);
    const handleNav = () => {
        setNav(!nav);
    };

    return (
        <div>
            {/* Mobile Menu Button */}
            <AiOutlineMenu
                onClick={handleNav}
                className="absolute top-4 right-4 z-[99] md:hidden cursor-pointer text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
            />

            {/* Mobile Navigation Menu */}
            {nav && (
                <div className="fixed w-full h-screen bg-black/90 flex flex-col justify-center items-center z-20 md:hidden">
                    <a
                        href="#main"
                        className="w-[75%] flex justify-center items-center rounded-full shadow-lg bg-black/50 shadow-cyan-500/50 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-cyan-400/20 hover:shadow-cyan-400/50"
                    >
                        <AiOutlineHome size={20} className="text-cyan-400" />
                        <span className="pl-4 text-cyan-400">Home</span>
                    </a>

                    <a
                        href="#work"
                        className="w-[75%] flex justify-center items-center rounded-full shadow-lg bg-black/50 shadow-purple-500/50 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-purple-400/20 hover:shadow-purple-400/50"
                    >
                        <GrProjects size={20} className="text-purple-400" />
                        <span className="pl-4 text-purple-400">Work</span>
                    </a>

                    <a
                        href="#projects"
                        className="w-[75%] flex justify-center items-center rounded-full shadow-lg bg-black/50 shadow-pink-500/50 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-pink-400/20 hover:shadow-pink-400/50"
                    >
                        <AiOutlineProject size={20} className="text-pink-400" />
                        <span className="pl-4 text-pink-400">Projects</span>
                    </a>

                    <a
                        href="#resume"
                        className="w-[75%] flex justify-center items-center rounded-full shadow-lg bg-black/50 shadow-cyan-500/50 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-cyan-400/20 hover:shadow-cyan-400/50"
                    >
                        <BsPerson size={20} className="text-cyan-400" />
                        <span className="pl-4 text-cyan-400">Resume</span>
                    </a>

                    <a
                        href="#contact"
                        className="w-[75%] flex justify-center items-center rounded-full shadow-lg bg-black/50 shadow-purple-500/50 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-purple-400/20 hover:shadow-purple-400/50"
                    >
                        <AiOutlineMail size={20} className="text-purple-400" />
                        <span className="pl-4 text-purple-400">Contact</span>
                    </a>
                </div>
            )}

            {/* Desktop Navigation Menu */}
            <div className="md:block hidden fixed top-[25%] z-10">
                <div className="flex flex-col">
                    <a
                        href="#main"
                        className="rounded-full shadow-lg bg-black/50 shadow-cyan-500/50 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-cyan-400/20 hover:shadow-cyan-400/50"
                    >
                        <AiOutlineHome size={20} className="text-cyan-400" />
                    </a>

                    <a
                        href="#work"
                        className="rounded-full shadow-lg bg-black/50 shadow-purple-500/50 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-purple-400/20 hover:shadow-purple-400/50"
                    >
                        <GrProjects size={20} className="text-purple-400" />
                    </a>

                    <a
                        href="#projects"
                        className="rounded-full shadow-lg bg-black/50 shadow-pink-500/50 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-pink-400/20 hover:shadow-pink-400/50"
                    >
                        <AiOutlineProject size={20} className="text-pink-400" />
                    </a>

                    <a
                        href="#resume"
                        className="rounded-full shadow-lg bg-black/50 shadow-cyan-500/50 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-cyan-400/20 hover:shadow-cyan-400/50"
                    >
                        <BsPerson size={20} className="text-cyan-400" />
                    </a>

                    <a
                        href="#contact"
                        className="rounded-full shadow-lg bg-black/50 shadow-purple-500/50 m-2 p-4 cursor-pointer hover:scale-110 ease-in duration-200 hover:bg-purple-400/20 hover:shadow-purple-400/50"
                    >
                        <AiOutlineMail size={20} className="text-purple-400" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SideNav;