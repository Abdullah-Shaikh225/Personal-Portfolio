import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Certifications from './components/Certifications';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './admin/AdminPanel';
import VisitorGreeting from './components/VisitorGreeting';
import { trackPageVisit, startVisitorHeartbeat, stopVisitorHeartbeat, setupSectionTracking } from './lib/analytics';

function Portfolio() {
  useEffect(() => {
    trackPageVisit('home');
    startVisitorHeartbeat();
    const observer = setupSectionTracking();

    return () => {
      stopVisitorHeartbeat();
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Certifications />
      <Contact />
      <Footer />
      <VisitorGreeting />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/portfolio.html" element={<Portfolio />} />
      <Route path="/abdullah-admin-2025" element={<AdminPanel />} />
      <Route path="/portfolio/abdullah-admin-2025" element={<AdminPanel />} />
      <Route path="/portfolio.html/abdullah-admin-2025" element={<AdminPanel />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
