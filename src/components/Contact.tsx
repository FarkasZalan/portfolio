const Contact = () => {
    return (
        <div id="contact" className="relative max-w-[1040px] m-auto p-6 md:pl-24 py-20 z-10">
            <div className="mb-12 text-center">
                <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 animate-move-gradient inline-block">
                    Contact Me
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto mt-4"></div>
            </div>

            <form action="https://getform.io/f/bpjnxogb" method="POST" encType="multipart/form-data" className="flex flex-col gap-6">
                <div className="grid md:grid-cols-2 gap-6 w-full py-2">
                    <div className="flex flex-col">
                        <label className="uppercase text-sm py-2 text-white font-medium">Name</label>
                        <input className="border-2 rounded-lg p-3 flex border-gray-700 bg-gray-200 text-gray-800 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none transition-all placeholder-gray-500" type="text" name="name" placeholder="Enter your name" />
                    </div>

                    <div className="flex flex-col">
                        <label className="uppercase text-sm py-2 text-white font-medium">Phone</label>
                        <input className="border-2 rounded-lg p-3 flex border-gray-700 bg-gray-200 text-gray-800 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none transition-all placeholder-gray-500" type="phone" name="phone" placeholder="Enter your phone number" />
                    </div>
                </div>

                <div className="flex flex-col py-2">
                    <label className="uppercase text-sm py-2 text-white font-medium">Email</label>
                    <input className="border-2 rounded-lg p-3 flex border-gray-700 bg-gray-200 text-gray-800 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none transition-all placeholder-gray-500" type="email" name="email" placeholder="Enter your email" />
                </div>

                <div className="flex flex-col py-2">
                    <label className="uppercase text-sm py-2 text-white font-medium">Subject</label>
                    <input className="border-2 rounded-lg p-3 flex border-gray-700 bg-gray-200 text-gray-800 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none transition-all placeholder-gray-500" type="text" name="subject" placeholder="Enter the subject" />
                </div>

                <div className="flex flex-col py-2">
                    <label className="uppercase text-sm py-2 text-white font-medium">Message</label>
                    <textarea className="border-2 rounded-lg p-3 border-gray-700 bg-gray-200 text-gray-800 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none transition-all placeholder-gray-500" rows={10} name="message" placeholder="Type your message here" />
                </div>

                <div className="mt-8 text-center">
                    <button className="inline-flex items-center gap-2 py-3 px-8 bg-gradient-to-r from-cyan-500/50 to-purple-500/50 text-white font-semibold rounded-full border border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 cursor-pointer">
                        Send Message
                        {/* Send Icon SVG */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 11l4 4m0-4l-4 4"
                            />
                        </svg>
                    </button>
                </div>


            </form>
        </div>
    )
}

export default Contact;