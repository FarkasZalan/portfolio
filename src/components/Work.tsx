import WorkItem from "./WorkItem";

const data = [
    {
        year: 2024,
        title: "Software development intern",
        duration: "6 Months",
        details:
            "My main tasks included creating an administration page for a factory, which included managing users, machines, tasks, worksheets, and statistics. Teamwork played an important role during the project.",
    },
    {
        year: 2022,
        title: "Webshop development",
        duration: "6 Months",
        details:
            "During the development of the application, I used the following: Wordpress, Woocommerce, Barion, CSSR. Communication with the client.",
    },
];

const Work = () => {
    return (
        <div id="work" className="relative max-w-[1040px] m-auto p-4 md:pl-20 py-16 z-10">
            <h1 className="text-4xl font-bold text-center text-cyan-400 mb-8">
                Work
            </h1>
            {data.map((item, idx) => (
                <WorkItem
                    key={idx.toString()}
                    year={item.year.toString()}
                    title={item.title}
                    duration={item.duration}
                    details={item.details}
                />
            ))}
        </div>
    );
};

export default Work;