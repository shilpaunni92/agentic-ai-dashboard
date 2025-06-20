
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare, Users, Settings, RefreshCw, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChatWithScout } from "@/components/market-research/ChatWithScout";
import { RecentMarketResearch } from "@/components/market-research/RecentMarketResearch";
import { ScoutCapabilities } from "@/components/market-research/ScoutCapabilities";
import { MarketRankings } from "@/components/market-research/MarketRankings";
import { CompetitorAnalysis } from "@/components/market-research/CompetitorAnalysis";
import { MarketSegments } from "@/components/market-research/MarketSegments";
import { SwotAnalysis } from "@/components/market-research/SwotAnalysis";
import { EmergingTrends } from "@/components/market-research/EmergingTrends";
import { ConsumerTrends } from "@/components/market-research/ConsumerTrends";
import { TechnologyDrivers } from "@/components/market-research/TechnologyDrivers";
import { MarketDetailDrawer } from "@/components/market-research/MarketDetailDrawer";
import { ScoutDeploymentDetails } from "@/components/market-research/ScoutDeploymentDetails";
import { ScoutSettingsForm } from "@/components/market-research/ScoutSettingsForm";
import { ScoutLoadingAnimation } from "@/components/market-research/ScoutLoadingAnimation";
import { DeploymentData } from "@/components/layout/Header";
import { useNavigate } from "react-router-dom";

// Define types for the API response
interface ResearchReport {
  marketName: string;
  completedAgo: string;
  status: string;
  summary: string;
  marketScore: string;
}

interface MarketRanking {
  marketName: string;
  score: string;
  tam: string;
  competition: string;
  barriers: string;
}

interface Market {
  name: string;
  score: string;
  size: string;
  competition: string;
  barriers: string;
  details: {
    summary: string;
    subMarkets: Array<{
      name: string;
      size: string;
      growth: string;
    }>;
    keyInsights: string[];
    recommendedActions: string[];
  };
}

interface MarketSegment {
  segment_id: string;
  segment: string;
  size: string;
  growth_potential: string;
  acquisition_cost: string;
  needs_match: string;
}

interface SwotAnalysis {
  swot_id: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface EmergingTrend {
  trend_id: string;
  trend: string;
  growthRate: string;
  adoption: string;
  impact: string;
  description: string;
}

interface TechnologyDriver {
  id: string;
  technology: string;
  maturity: string;
  relevance: string;
  timeToAdopt: string;
}

interface MarketIntelligenceData {
  researchReports: ResearchReport[];
  rankings: MarketRanking[];
  markets: Market[];
  market_segments: MarketSegment[];
  swot_analysis: SwotAnalysis;
  emerging_trends: EmergingTrend[];
  technology_drivers: TechnologyDriver[];
}

// Cache for market data - persists across component re-renders and page refreshes
let cachedMarketData: MarketIntelligenceData | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Helper function to check if cached data is still valid
const isCacheValid = (): boolean => {
  if (!cachedMarketData || !cacheTimestamp) return false;
  return Date.now() - cacheTimestamp < CACHE_DURATION;
};

// Helper function to get cached data even if expired (for fallback display)
const getCachedData = (): MarketIntelligenceData | null => {
  return cachedMarketData;
};

const MarketResearch = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("intelligence");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAIViewActive, setIsAIViewActive] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [scoutDeploymentData, setScoutDeploymentData] = useState<DeploymentData | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  
  // API data state - Always initialize with any available cached data
  const [marketData, setMarketData] = useState<MarketIntelligenceData | null>(() => {
    const cached = getCachedData();
    console.log('Initial marketData state - cached data exists:', !!cached);
    return cached;
  });
  
  // Show loading when either initially loading OR refreshing
  const [isInitialLoading, setIsInitialLoading] = useState(() => {
    const hasData = !!getCachedData();
    console.log('Initial loading state - has cached data:', hasData);
    return !hasData; // Only loading if no cached data exists
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Fetch market intelligence data
  const fetchMarketData = async (isRefresh = false) => {
    try {
      console.log('fetchMarketData called with isRefresh:', isRefresh);
      console.log('Current marketData exists:', !!marketData);
      console.log('Cached data exists:', !!getCachedData());
      
      // Set loading states appropriately
      if (!isRefresh) {
        setIsInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      setError(null);
      
      const response = await fetch('https://backend-11kr.onrender.com/market_intelligence');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: MarketIntelligenceData = await response.json();
      console.log('Successfully fetched new data:', data);
      
      // Update both state and cache
      setMarketData(data);
      cachedMarketData = data;
      cacheTimestamp = Date.now();
      
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      
      // Always ensure we show any available data, even if the fetch failed
      const fallbackData = getCachedData();
      if (fallbackData && !marketData) {
        console.log('Using cached data as fallback after error');
        setMarketData(fallbackData);
      }
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  };

  // Trigger Scout API call and then fetch market data
  const triggerScoutAndRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      console.log('Triggering Scout and refreshing market data...');
      
      // First trigger scout
      const scoutResponse = await fetch('https://backend-11kr.onrender.com/trigger_scout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      if (!scoutResponse.ok) {
        throw new Error(`Scout trigger failed! status: ${scoutResponse.status}`);
      }
      
      const scoutResult = await scoutResponse.json();
      console.log('Scout triggered successfully:', scoutResult);
      
      // Then fetch updated market intelligence data
      const marketResponse = await fetch('https://backend-11kr.onrender.com/market_intelligence');
      
      if (!marketResponse.ok) {
        throw new Error(`Market data fetch failed! status: ${marketResponse.status}`);
      }
      
      const newMarketData = await marketResponse.json();
      console.log('New market data received:', newMarketData);
      
      // Update both state and cache
      setMarketData(newMarketData);
      cachedMarketData = newMarketData;
      cacheTimestamp = Date.now();
      
    } catch (err) {
      console.error('Error in scout trigger and refresh:', err);
      setError(err instanceof Error ? err.message : 'Failed to trigger scout and refresh data');
      
      // Keep showing existing data even if the operation failed
      // Don't clear marketData here - let it show previous data
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial data fetch - ALWAYS try to use cached data immediately
  useEffect(() => {
    console.log('Initial useEffect - checking for cached data');
    const existingCachedData = getCachedData();
    
    if (existingCachedData && !marketData) {
      console.log('Found cached data, setting it immediately');
      setMarketData(existingCachedData);
      setIsInitialLoading(false);
    }
    
    // Always fetch fresh data, but only show loading if no data exists
    if (!marketData && !existingCachedData) {
      console.log('No data found anywhere, fetching fresh data with loading screen');
      fetchMarketData(false);
    } else {
      console.log('Data exists, fetching fresh data in background');
      fetchMarketData(true); // Background refresh
    }
  }, []);

  // Listen for company profile updates and trigger background refresh
  useEffect(() => {
    const handleCompanyProfileUpdate = () => {
      console.log('Company profile updated, triggering Scout refresh...');
      triggerScoutAndRefresh();
    };

    window.addEventListener('companyProfileUpdated', handleCompanyProfileUpdate);
    
    return () => {
      window.removeEventListener('companyProfileUpdated', handleCompanyProfileUpdate);
    };
  }, []);

  // Listen for AI view changes from header
  useEffect(() => {
    const handleAIViewChange = (event: CustomEvent) => {
      setIsAIViewActive(event.detail.isAIView);
    };

    const handleScoutChatToggle = (event: CustomEvent) => {
      setIsChatOpen(event.detail.isOpen);
    };

    window.addEventListener('aiViewChanged', handleAIViewChange as EventListener);
    window.addEventListener('toggleScoutChat', handleScoutChatToggle as EventListener);
    
    return () => {
      window.removeEventListener('aiViewChanged', handleAIViewChange as EventListener);
      window.removeEventListener('toggleScoutChat', handleScoutChatToggle as EventListener);
    };
  }, []);

  // Updated handleViewResults to work with Market object instead of just market name
  const handleViewResults = (marketData: Market | null) => {
    if (marketData) {
      console.log('Selected Market Data:', marketData);
      console.log('Sub-markets:', marketData.details.subMarkets);
      console.log('Key Insights:', marketData.details.keyInsights);
      console.log('Recommended Actions:', marketData.details.recommendedActions);
      
      setSelectedMarket(marketData);
      setIsDrawerOpen(true);
    } else {
      console.log('Market data not found');
    }
  };

  // For MarketRankings component - keeping the old signature for compatibility
  const handleViewResultsFromRankings = (marketName: string) => {
    if (!marketData) return;
    
    const market = marketData.markets.find(m => 
      m.name === marketName || 
      m.name.toLowerCase().includes(marketName.toLowerCase().replace(' market', ''))
    );
    
    if (market) {
      handleViewResults(market);
    }
  };

  const handleDeployScout = () => {
    navigate('/scout-deployment');
  };

  const handleRefresh = () => {
    triggerScoutAndRefresh();
  };

  // Show error state only if we have an error and no existing data AND not initially loading
  if (error && !marketData && !isInitialLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading data: {error}</p>
            <Button onClick={() => fetchMarketData()} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Show ScoutLoadingAnimation when initially loading and no data exists
  if (isInitialLoading && !marketData) {
    console.log('Showing ScoutLoadingAnimation - no data exists anywhere');
    return (
      <Layout>
        <div className="flex flex-col h-full">
          <ScoutLoadingAnimation />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-full relative">
        {/* Fixed header section */}
        <div className="sticky top-0 bg-white z-20 pb-2">
          <div className="animate-fade-in">
            {/* Scout Loading Animation - Show at top when refreshing with existing data */}
            {(isRefreshing || isInitialLoading) && (
              <div className="mb-4">
                <ScoutLoadingAnimation />
              </div>
            )}
            
            {/* Error alert for any operation failures - only show if we have data to fall back to */}
            {error && marketData && !isRefreshing && !isInitialLoading && (
              <Alert className="mb-4 border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Operation failed: {error}. Showing previous data.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Cache indicator when showing cached data and not loading */}
            {marketData && cachedMarketData === marketData && !isRefreshing && !isInitialLoading && cacheTimestamp && (
              <Alert className="mb-4 border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  {isCacheValid() 
                    ? `Showing cached data from ${new Date(cacheTimestamp).toLocaleTimeString()}`
                    : `Showing expired cached data from ${new Date(cacheTimestamp).toLocaleTimeString()}`
                  }
                </AlertDescription>
              </Alert>
            )}
            
            {/* Settings and Refresh buttons aligned to the right */}
            <div className="flex items-center justify-end gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2"
                disabled={isRefreshing || isInitialLoading}
              >
                <RefreshCw className={`h-4 w-4 ${(isRefreshing || isInitialLoading) ? 'animate-spin' : ''}`} />
                {(isRefreshing || isInitialLoading) ? 'Updating...' : 'Refresh'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>

            {isChatOpen && <ChatWithScout />}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="w-full bg-gray-100 p-1 mb-2">
                <TabsTrigger value="intelligence" className="flex items-center gap-2 flex-1">
                  <Search className="h-4 w-4" />
                  Market Intelligence
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center gap-2 flex-1">
                  <Users className="h-4 w-4" />
                  Your Lead Stream
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-2 flex-1">
                  <MessageSquare className="h-4 w-4" />
                  Chat with Scout
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Scrollable content area - ALWAYS show content if data exists */}
        <ScrollArea className="flex-1">
          {/* Show content with subtle overlay when refreshing */}
          <div className={`transition-opacity duration-300 ${(isRefreshing || isInitialLoading) && marketData ? 'opacity-70' : 'opacity-100'} relative`}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-0">
              <TabsContent value="intelligence" className="mt-0">
                {marketData ? (
                  <div className="space-y-6">
                    {/* Display deployment details if Scout has been deployed */}
                    {scoutDeploymentData && (
                      <ScoutDeploymentDetails deploymentData={scoutDeploymentData} />
                    )}
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                      <RecentMarketResearch 
                        onViewResults={handleViewResults}
                        researchReports={marketData.researchReports}
                        markets={marketData.markets}
                      />
                      <ScoutCapabilities />
                    </div>
                    
                    <MarketRankings 
                      onViewResults={handleViewResultsFromRankings}
                      rankings={marketData.rankings}
                    />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <CompetitorAnalysis competitorData={marketData.markets} />
                      <MarketSegments marketSegments={marketData.market_segments} />
                    </div>
                    
                    <SwotAnalysis swotAnalysis={marketData.swot_analysis} />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                      <EmergingTrends emergingTrends={marketData.emerging_trends} />
                      <TechnologyDrivers technologyDrivers={marketData.technology_drivers} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <p className="mb-4">No market data available</p>
                      <Button onClick={() => fetchMarketData()} className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Load Data
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="analysis" className="mt-0">
                <ConsumerTrends />
              </TabsContent>
              
              <TabsContent value="trends" className="mt-0">
                <ChatWithScout fullPage={true} />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>

      {/* Market Detail Drawer */}
      <MarketDetailDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        selectedMarket={selectedMarket}
        isAIViewActive={isAIViewActive}
      />

      {/* Scout Settings Form */}
      <ScoutSettingsForm
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </Layout>
  );
};

export default MarketResearch;
