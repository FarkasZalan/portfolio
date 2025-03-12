import { TypeAnimation } from 'react-type-animation';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const Main = () => {
    return (
        <div id='main' className="relative w-full h-screen">
            {/* Content */}
            <div className="w-full h-screen absolute top-0 left-0 text-white flex flex-col justify-center items-center">
                <div className='max-w-[700px] m-auto h-full w-full flex flex-col justify-center items-center lg:items-start'>
                    {/* Name with Enhanced Glow Effect */}
                    <h1 className='sm:text-5xl text-4xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 hover:bg-gradient-to-r hover:from-pink-400 hover:to-cyan-400 transition-all duration-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]'>
                        I'm Zalán Farkas
                    </h1>

                    {/* Animated Typing Text */}
                    <h2 className='flex sm:text-3xl text-2xl pt-4 font-mono text-gray-300'>
                        I'm a
                        <TypeAnimation
                            sequence={[
                                'Developer',
                                2000,
                                'Problem Solver',
                                2000,
                                'Tech Enthusiast',
                                2000,
                            ]}
                            wrapper="div"
                            speed={50}
                            style={{ fontSize: '1em', paddingLeft: '10px', color: '#00ffcc' }}
                            repeat={Infinity}
                        />
                    </h2>

                    {/* Social Icons with Hover Glow */}
                    <div className='flex justify-between pt-8 max-w-[100px] w-full'>
                        <a
                            href="https://www.linkedin.com/in/zalanfarkas/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:scale-110 transition-transform duration-300"
                        >
                            <FaLinkedin
                                size={40}
                                className="text-cyan-400 hover:text-cyan-300 hover:drop-shadow-glow-cyan transition-all duration-300"
                            />
                        </a>
                        <a
                            href="https://github.com/FarkasZalan"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:scale-110 transition-transform duration-300"
                        >
                            <FaGithub
                                size={40}
                                className="text-purple-400 hover:text-purple-300 hover:drop-shadow-glow-purple transition-all duration-300"
                            />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Main;