const WorkItem = ({ year, title, duration, details }: { year: string; title: string; duration: string; details: string }) => {
    return (
        <ol className="flex flex-col md:flex-row relative border-l border-cyan-400/50">
            <li className="mb-10 ml-4">
                {/* Timeline Dot */}
                <div className="absolute w-3 h-3 bg-cyan-400 rounded-full mt-1.5 -left-1.5 border-2 border-black/50 shadow-glow-cyan" />

                {/* Year, Title, and Duration */}
                <p className="flex flex-wrap gap-4 flex-row items-center justify-start text-xs md:text-sm">
                    <span className="inline-block px-2 py-1 font-semibold text-white bg-cyan-400/20 rounded-md border border-cyan-400/50 hover:bg-cyan-400/30 transition-colors duration-300">
                        {year}
                    </span>
                    <span className="text-lg font-semibold text-cyan-400">{title}</span>
                    <span className="my-1 text-sm font-normal text-purple-400">{duration}</span>
                </p>

                {/* Details */}
                <p className="my-2 text-base font-normal text-gray-300">{details}</p>
            </li>
        </ol>
    );
};

export default WorkItem;