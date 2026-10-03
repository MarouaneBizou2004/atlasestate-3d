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

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [targetNeighborhood, setTargetNeighborhood] = useState<string | undefined>(undefined);
  const [totalCount, setTotalCount] = useState<number>(1290);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);

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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-dark-bg text-gray-100 font-sans">
      {/* Universal Top Navigation */}
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
      />

      {/* Main Page View */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeTab === 'explore' && (
          <ExplorePage key={targetNeighborhood || 'default'} initialNeighborhood={targetNeighborhood} />
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

export default App;
