import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExplorePage } from './pages/ExplorePage';
import { MarketAnalyticsPage } from './pages/MarketAnalyticsPage';
import { NeighborhoodsPage } from './pages/NeighborhoodsPage';
import { ValuationCalculatorPage } from './pages/ValuationCalculatorPage';
import { DataQualityPage } from './pages/DataQualityPage';
import { AboutPage } from './pages/AboutPage';
import { ExportModal } from './components/ExportModal';
import { fetchMarketSummary } from './services/api';
import { ThemeProvider } from './context/ThemeContext';
import { useFavorites } from './hooks/useFavorites';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [targetNeighborhood, setTargetNeighborhood] = useState<string | undefined>(undefined);
  const [totalCount, setTotalCount] = useState<number>(1680);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const { count: favoritesCount } = useFavorites();

  useEffect(() => {
    fetchMarketSummary()
      .then((res) => {
        if (res && res.total_listings) {
          setTotalCount(res.total_listings);
        }
      })
      .catch((err) => {
        console.warn('Using default inventory count:', err);
      });
  }, []);

  const handleSelectNeighborhood = (neighborhoodName: string) => {
    setTargetNeighborhood(neighborhoodName);
    setActiveTab('explore');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Universal Floating Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'explore') {
            setTargetNeighborhood(undefined);
          }
          setActiveTab(tab);
        }}
        totalCount={totalCount}
        onOpenExport={() => setExportModalOpen(true)}
        favoritesCount={favoritesCount}
      />

      {/* Main Page View */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
          marginTop: '8px',
        }}
      >
        {activeTab === 'explore' && (
          <ExplorePage 
            key={targetNeighborhood || 'default'} 
            initialNeighborhood={targetNeighborhood} 
            onNavigateToAnalytics={() => setActiveTab('market')}
          />
        )}
        {activeTab === 'market' && <MarketAnalyticsPage />}
        {activeTab === 'neighborhoods' && (
          <NeighborhoodsPage onSelectNeighborhood={handleSelectNeighborhood} />
        )}
        {activeTab === 'valuation' && <ValuationCalculatorPage />}
        {activeTab === 'quality' && <DataQualityPage />}
        {activeTab === 'about' && <AboutPage />}
      </main>

      {/* Export Data Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        filteredCount={totalCount}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
};

export default App;
