import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import BackgroundAudioPlayer from '../components/common/BackgroundAudioPlayer';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8EC] text-[#2B211B] transition-colors duration-300">
      <Navbar />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <BackgroundAudioPlayer />
      <Footer />
    </div>
  );
};

export default PublicLayout;
