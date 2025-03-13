import WorkItem from "./WorkItem";

const data = [
    {
        year: 2024,
        title: "Software Development Intern",
        company: "Modularity Kft.",
        duration: "6 Months",
        details:
            "My main tasks included creating an administration page for a factory, which included managing users, machines, tasks, worksheets, and statistics. Teamwork played an important role during the project.",
    },
    {
        year: 2022,
        title: "Webshop Development",
        company: "Private Client",
        duration: "6 Months",
        details:
            "During the development of the application, I used the following: Wordpress, Woocommerce, Barion, CSSR. Communication with the client.",
    },
];

const Work = () => {
    return (
        <div id="work" className="relative max-w-[1040px] m-auto p-6 md:pl-24 py-20 z-10">
            <div className="mb-14 text-center">
                <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 animate-move-gradient inline-block">
                    Work Experience
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto mt-4"></div>
            </div>

            <div className="relative">
                {/* Main timeline line - solid color */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-400/80"></div>

                {/* Work items */}
                {data.map((item, idx) => (
                    <WorkItem
                        key={idx.toString()}
                        year={item.year.toString()}
                        title={item.title}
                        company={item.company}
                        duration={item.duration}
                        details={item.details}
                    />
                ))}

                {/* Final dot at the end of timeline */}
                <div className="absolute w-4 h-4 bg-cyan-400 rounded-full -left-2 bottom-0 border border-black/50 shadow-glow-cyan">
                    <span className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping"></span>
                </div>
            </div>
        </div>
    );
};

export default Work;