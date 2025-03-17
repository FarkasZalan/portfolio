const ProjectItem = ({
    img,
    title,
    technologies,
    link,
    isActive,
    onClick,
}: {
    img: string;
    title: string;
    technologies: string;
    link: string;
    isActive: boolean;
    onClick: () => void;
}) => {
    return (
        <div
            className="relative flex items-center justify-center h-auto w-full shadow-xl shadow-gray-800/40 rounded-xl group overflow-hidden backdrop-blur-sm bg-gradient-to-br from-cyan-400/5 to-purple-400/5 border border-cyan-400/10 transition-all duration-500 hover:border-cyan-400/30"
            onClick={onClick} // Use the onClick handler from props
        >
            {/* Project image */}
            <img
                src={img}
                alt={title}
                className="rounded-xl w-full h-60 object-cover transition-all duration-700 group-hover:opacity-10 group-hover:scale-110"
            />

            {/* Overlay Content (Visible on Hover or Click) */}
            <div
                className={`absolute inset-0 ${isActive ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center bg-gradient-to-br from-cyan-900/70 to-purple-800/70 backdrop-blur-sm p-6`}
            >
                {/* Project Title */}
                <h3 className={`text-2xl font-bold text-white tracking-wider text-center mb-2 transform ${isActive ? 'translate-y-0' : '-translate-y-4'} group-hover:translate-y-0 transition-all duration-500`}>
                    {title}
                </h3>

                {/* Divider Line */}
                <div className={`w-12 h-0.5 bg-cyan-400 rounded-full mb-4 transform ${isActive ? 'scale-x-100' : 'scale-x-0'} group-hover:scale-x-100 transition-transform duration-500 delay-100`}></div>

                {/* Technologies Used */}
                <p className={`pb-4 pt-1 text-white text-center ${isActive ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity duration-500 delay-200`}>
                    {technologies}
                </p>

                {/* View Project Button */}
                <a
                    href={link}
                    target="_blank"
                    className={`${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-300`}
                    onClick={(e) => e.stopPropagation()} // Prevent overlay toggle when clicking the link
                >
                    <button className="py-2.5 px-6 rounded-full bg-cyan-500/50 text-white font-semibold text-sm tracking-wide border border-cyan-600/50 transition-all duration-300 flex items-center gap-2 hover:bg-cyan-700 hover:scale-110 hover:bg-cyan-700 cursor-pointer">
                        <span>View Project</span>
                        {/* Arrow Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                            <path d="M7 17l9.2-9.2M17 17V7H7" />
                        </svg>
                    </button>
                </a>
            </div>
        </div>
    );
};

export default ProjectItem;