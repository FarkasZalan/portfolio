import Contact from './components/Contact';
import Main from './components/Main';
import Projects from './components/Projects';
import Resume from './components/Resume';
import SideNav from './components/SideNav';
import Work from './components/Work';

function App() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Starry Night Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-blue-950 to-purple-950 z-0">
        <div id="stars" className="absolute inset-0"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <SideNav />
        <Main />
        <Work />
        <Projects />
        <Resume />
        <Contact />
      </div>
    </div>
  );
}

export default App;