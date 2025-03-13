const WorkItem = ({ year, title, company, duration, details }: { year: string, title: string, company: string, duration: string, details: string }) => {
    return (
        <div className="group relative pl-8 pr-2">
            {/* Timeline Line - Solid color instead of gradient */}
            <div className="absolute left-0 top-0 h-full w-0.5 bg-cyan-400/80"></div>

            {/* Timeline Dot with Pulse Effect */}
            <div className="absolute w-4 h-4 bg-cyan-400 rounded-full -left-2 mt-1 border border-black/50 shadow-glow-cyan z-10 group-hover:scale-125 transition-transform duration-300">
                <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping"></span>
            </div>

            {/* Year Badge */}
            <div className="flex flex-wrap gap-4 items-center mb-3">
                <span className="inline-block px-3 py-1.5 font-semibold text-white bg-gradient-to-r from-cyan-500/40 to-cyan-500/20 rounded-full border border-cyan-400/50 group-hover:from-cyan-500/60 group-hover:to-cyan-500/40 transition-all duration-300 shadow-lg shadow-cyan-500/20">
                    {year}
                </span>
            </div>

            {/* Content Card */}
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/30 backdrop-blur-md rounded-xl p-5 border border-slate-700/50 group-hover:border-cyan-400/30 transition-all duration-300 shadow-lg mb-10">
                {/* Title & Duration Row */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-2">
                    <h3 className="text-xl font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300">{title}</h3>
                    <span className="text-sm font-medium text-purple-300 bg-purple-900/30 px-3 py-1 rounded-full border border-purple-500/20">{duration}</span>
                </div>

                {/* Company Badge */}
                <div className="mb-4">
                    <span className="inline-block px-3 py-1.5 text-sm font-medium text-purple-200 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                        {company}
                    </span>
                </div>

                {/* Details */}
                <p className="text-gray-300 leading-relaxed">{details}</p>
            </div>
        </div>
    );
};

export default WorkItem;
