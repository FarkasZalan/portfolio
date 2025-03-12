const Projects = () => {
    const projects = [
        {
            title: "Project 1",
            description: "Description of project 1.",
            link: "#",
        },
        {
            title: "Project 2",
            description: "Description of project 2.",
            link: "#",
        },
        {
            title: "Project 3",
            description: "Description of project 3.",
            link: "#",
        },
    ];

    return (
        <div id="projects" className="relative max-w-[1040px] m-auto p-4 md:pl-20 py-16 z-10">
            <h1 className="text-4xl font-bold text-center text-cyan-400 mb-8">
                Projects
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project, idx) => (
                    <div key={idx} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-cyan-400/50 transition-shadow duration-300">
                        <h2 className="text-xl font-semibold text-cyan-400">{project.title}</h2>
                        <p className="text-gray-300 mt-2">{project.description}</p>
                        <a href={project.link} className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 mt-4 block">
                            View Project
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Projects;