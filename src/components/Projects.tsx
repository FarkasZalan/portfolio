import { useState, useEffect, useRef } from 'react';
import ProjectItem from './ProjectItem';
import PizzeriaImage from '../assets/images/pizzeria.png';
import AccomodationsImahe from '../assets/images/accomodation.png';
import VegAndFruImage from '../assets/images/vegAndFru.png';
import GymBroImage from '../assets/images/gymBro.png';

const Projects = () => {
    const [activeProject, setActiveProject] = useState<string | null>(null);
    const projectsRef = useRef<HTMLDivElement>(null);

    // List of projects
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

    // Function to handle project item clicks
    const handleProjectClick = (title: string) => {
        if (activeProject === title) {
            setActiveProject(null); // Close the overlay if the same item is clicked again
        } else {
            setActiveProject(title); // Open the overlay for the clicked item
        }
    };

    // Close overlay when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (projectsRef.current && !projectsRef.current.contains(event.target as Node)) {
                setActiveProject(null); // Close the overlay
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div id="projects" className="relative max-w-[1040px] m-auto p-6 md:pl-24 py-20 z-10">
            <div className="mb-12 text-center">
                <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 animate-move-gradient inline-block">
                    Projects
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto mt-4"></div>
            </div>

            <div ref={projectsRef} className="grid sm:grid-cols-2 gap-8">
                {projectList.map((project, index) => (
                    <ProjectItem
                        key={index} // Unique key for each item
                        img={project.img}
                        title={project.title}
                        technologies={project.technologies}
                        link={project.link}
                        isActive={activeProject === project.title} // Pass whether this item is active
                        onClick={() => handleProjectClick(project.title)} // Pass click handler
                    />
                ))}
            </div>
        </div>
    );
};

export default Projects;