import React from 'react';
import { useHome } from './useHome';
import { HomeContext } from './context';
import { Noticeboard, Hero, GallerySection, QuickDonateCta } from './components/HomeComponents';

const HomeContent: React.FC = () => (
  <>
    <Noticeboard />
    <Hero />
    <GallerySection />
    <QuickDonateCta />
  </>
);

const Home: React.FC = () => {
  const homeState = useHome();
  return (
    <HomeContext.Provider value={homeState}>
      <HomeContent />
    </HomeContext.Provider>
  );
};

export default Home;
