import { useState } from 'react';
import ResumePdf from '../assets/CV_Zalán_Farkas.pdf';

const Resume = () => {
    const [isLoading, setIsLoading] = useState(true);

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    return (
        <div id="resume" className="relative max-w-[1040px] m-auto p-6 md:pl-24 py-20 z-10">
            <div className="mb-12 text-center">
                <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 animate-move-gradient inline-block">
                    Resume
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto mt-4"></div>
            </div>

            <div className="relative overflow-hidden">
                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/70 to-purple-900/70 z-10 rounded-xl">
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-cyan-400 text-lg font-semibold">Loading resume...</p>
                        </div>
                    </div>
                )}

                {/* MacOS-style PDF Viewer */}
                <div className="relative w-full h-[600px] rounded-lg overflow-hidden bg-gradient-to-r from-cyan-500/20 to-purple-500/20 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    {/* MacOS Window Frame */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gray-700/90 backdrop-blur-sm flex items-center px-2 z-20">
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                    </div>

                    {/* PDF Viewer */}
                    <iframe
                        src={`${ResumePdf}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full bg-white"
                        onLoad={handleIframeLoad}
                        title="Resume PDF"
                        style={{ border: 'none', marginTop: '32px' }}
                    ></iframe>
                </div>
            </div>

            {/* Download Button */}
            <div className="mt-8 text-center">
                <a
                    href={ResumePdf}
                    download="CV_Zalán_Farkas.pdf"
                    className="inline-flex items-center gap-2 py-3 px-8 bg-gradient-to-r from-cyan-500/50 to-purple-500/50 text-white font-semibold rounded-full border border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105"
                >
                    <span>Download Resume</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                </a>
            </div>
        </div>
    );
};

export default Resume;