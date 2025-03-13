import ProjectItem from "./ProjectItem";
import PizzeriaImage from "../assets/images/pizzeria.png";
import AccomodationsImahe from "../assets/images/accomodation.png";
import VegAndFruImage from "../assets/images/vegAndFru.png";
import GymBroImage from "../assets/images/gymBro.png";

const Projects = () => {
    const projectList = [
        {
            img: GymBroImage,
            title: "GymBro",
            technologies: "Angular, Firebase, Stripe, Node.js",
            link: "https://github.com/FarkasZalan/GymBro",
        },
        {
            img: VegAndFruImage,
            title: "VegAndFru",
            technologies: "Java, Android Studio, Firebase",
            link: "https://github.com/FarkasZalan/VegAndFru",
        },
        {
            img: AccomodationsImahe,
            title: "Accommodations",
            technologies: "Java, Spring Boot, MySQL, Docker",
            link: "https://github.com/FarkasZalan/Szallasok",
        },
        {
            img: PizzeriaImage,
            title: "Pizzeria",
            technologies: "Java, Spring Boot, MySQL, Docker",
            link: "https://github.com/FarkasZalan/Pizzazo",
        },
    ];

    return (
        <div id="projects" className="relative max-w-[1040px] m-auto p-6 md:pl-24 py-20 z-10">
            <div className="mb-12 text-center">
                <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 animate-move-gradient inline-block">
                    Projects
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto mt-4"></div>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
                {projectList.map((project, index) => (
                    <ProjectItem
                        key={index}
                        img={project.img}
                        title={project.title}
                        technologies={project.technologies}
                        link={project.link}
                    />
                ))}
            </div>
        </div>
    );
};

export default Projects;
