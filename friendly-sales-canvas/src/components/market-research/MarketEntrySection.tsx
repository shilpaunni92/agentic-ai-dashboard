import React, { useEffect, useState } from 'react';
import { MapPin, Bot, Edit, Target, Clock, AlertTriangle, X, FileText, Save, Share, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { EditDropdownMenu } from './EditDropdownMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EditRecord } from './types';
import { toUTCTimestamp, isTimestampNewer } from '@/lib/timestampUtils';
import { executeWithRateLimit } from '@/lib/rateLimitManager';

interface MarketEntrySectionProps {
  isEditing: boolean;
  isSplitView: boolean;
  isExpanded: boolean;
  hasEdits: boolean;
  deletedSections: Set<string>;
  editHistory: EditRecord[];
  executiveSummary: string;
  entryBarriers: string[];
  recommendedChannel: string;
  timeToMarket: string;
  topBarrier: string;
  competitiveDifferentiation: string[];
  strategicRecommendations: string[];
  riskAssessment: string[];
  onToggleEdit: () => void;
  onScoutIconClick: (context?: 'market-entry', hasEdits?: boolean, customMessage?: string) => void;
  onEditHistoryOpen: () => void;
  onDeleteSection: (sectionId: string) => void;
  onSaveChanges: () => void;
  onCancelEdit: () => void;
  onExpandToggle: (expanded: boolean) => void;
  onExecutiveSummaryChange: (value: string) => void;
  onEntryBarriersChange: (barriers: string[]) => void;
  onRecommendedChannelChange: (value: string) => void;
  onTimeToMarketChange: (value: string) => void;
  onTopBarrierChange: (value: string) => void;
  onCompetitiveDifferentiationChange: (differentiation: string[]) => void;
  onStrategicRecommendationsChange: (recommendations: string[]) => void;
  onRiskAssessmentChange: (risks: string[]) => void;
  onExportPDF: () => void;
  onSaveToWorkspace: () => void;
  onGenerateShareableLink: () => void;
  // Add refresh props
  isRefreshing?: boolean;
  companyProfile?: any;
}

const MarketEntrySection: React.FC<MarketEntrySectionProps> = ({
  isEditing,
  isSplitView,
  isExpanded,
  hasEdits,
  deletedSections,
  editHistory,
  executiveSummary,
  entryBarriers,
  recommendedChannel,
  timeToMarket,
  topBarrier,
  competitiveDifferentiation,
  strategicRecommendations,
  riskAssessment,
  onToggleEdit,
  onScoutIconClick,
  onEditHistoryOpen,
  onDeleteSection,
  onSaveChanges,
  onCancelEdit,
  onExpandToggle,
  onExecutiveSummaryChange,
  onEntryBarriersChange,
  onRecommendedChannelChange,
  onTimeToMarketChange,
  onTopBarrierChange,
  onCompetitiveDifferentiationChange,
  onStrategicRecommendationsChange,
  onRiskAssessmentChange,
  onExportPDF,
  onSaveToWorkspace,
  onGenerateShareableLink,
  isRefreshing = false,
  companyProfile
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketEntryData, setMarketEntryData] = useState<any>(null);

  // Fetch Market Entry data from API
  const fetchMarketEntryData = async (refresh = false) => {
    console.log('🚀 MarketEntrySection: Starting fetchMarketEntryData with refresh:', refresh);
    try {
      setIsLoading(true);
      setError(null);

      // Get company profile data for dynamic reports
      const profile = companyProfile || JSON.parse(localStorage.getItem('companyProfile') || '{}');
      
      const payload = {
        user_id: "brewra",
        component_name: "Market Entry & Growth Strategy", // Exact match from swagger
        refresh: refresh,
        force_refresh: refresh,
        cache_bypass: refresh,
        bypass_all_cache: refresh,
        request_timestamp: Date.now(),
        request_id: Math.random().toString(36).substr(2, 6),
        additionalPrompt: profile.companyUrl ? `Company: ${profile.companyUrl}, Industry: ${profile.industry}, Size: ${profile.companySize}, GTM: ${profile.primaryGTMModel}, Goals: ${profile.strategicGoals}` : "",
        data: {
          company: profile.companyUrl || "OrbiSelf",
          product: "Convoic.AI", 
          target_market: profile.targetMarkets?.[0] || "Indian college students (Tier 2 & 3)",
          region: profile.targetMarkets?.[0] || "India",
          timestamp: Date.now(),
          force_new_data: refresh
        }
      };

      console.log('📤 MarketEntrySection: Sending API request with payload:', payload);
      console.log('⏰ MARKET ENTRY REQUEST TIMESTAMP:', payload.request_timestamp);

      const response = await executeWithRateLimit(
        () => fetch('https://backend-11kr.onrender.com/market-research', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }),
        'Market Entry'
      );

      console.log('📨 MarketEntrySection: API response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 MarketEntrySection: API result:', result);
      console.log('📊 Full API Response Structure:', result);

      if (result.status === 'success' && result.data) {
        const apiData = result.data;
        console.log('🎯 MarketEntrySection: Processing API data:', apiData);

        // Check if we have the expected Market Entry data structure
        if (apiData.executiveSummary || apiData.entryBarriers) {
          console.log('✅ MarketEntrySection: Found Market Entry data - updating component');
          
          // Update component data with API response
          if (apiData.executiveSummary) onExecutiveSummaryChange(apiData.executiveSummary);
          if (apiData.entryBarriers) onEntryBarriersChange(apiData.entryBarriers);
          if (apiData.recommendedChannel) {
            const channelValue = typeof apiData.recommendedChannel === 'object' 
              ? (apiData.recommendedChannel.channel || JSON.stringify(apiData.recommendedChannel))
              : apiData.recommendedChannel;
            onRecommendedChannelChange(channelValue);
          }
          if (apiData.timeToMarket) onTimeToMarketChange(apiData.timeToMarket);
          if (apiData.topBarrier) onTopBarrierChange(apiData.topBarrier);
          if (apiData.competitiveDifferentiation) onCompetitiveDifferentiationChange(apiData.competitiveDifferentiation);
          if (apiData.strategicRecommendations) onStrategicRecommendationsChange(apiData.strategicRecommendations);
          if (apiData.riskAssessment) onRiskAssessmentChange(apiData.riskAssessment);
          
          setMarketEntryData(apiData);
          console.log('✅ MARKET ENTRY SECTION UPDATED - Component name:', apiData.component_name);
        } else {
          console.log('ℹ️ MarketEntrySection: No Market Entry specific data found in response');
        }
      }
    } catch (error) {
      console.error('❌ MarketEntrySection: Error fetching data:', error);
      setError('Failed to load market entry data');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove internal data fetching - let parent handle all data fetching
  // useEffect(() => {
  //   console.log('🚀 MarketEntrySection: Component mounted - fetching fresh data');
  //   const timer = setTimeout(() => {
  //     fetchMarketEntryData(false);
  //   }, 600); // Slight delay to avoid conflicts with other components
  //   
  //   return () => clearTimeout(timer);
  // }, []);
  
  // Remove internal refresh logic - let parent handle all refresh logic
  // useEffect(() => {
  //   if (isRefreshing) {
  //     console.log('🔄 Market Entry - Refresh triggered by parent');
  //     // Clear old data immediately to prevent showing stale data
  //     setMarketEntryData(null);
  //     setError(null);
  //     setIsLoading(true);
  //     fetchMarketEntryData(true);
  //   }
  // }, [isRefreshing]);

  const handleMarketEntrySaveChanges = () => {
    console.log('🚀 Market Entry Section - Save function called!');
    
    // Log original and modified JSON for debugging
    // Note: Since this component updates parent state directly through onChange handlers,
    // both original and modified will show the current state (which represents the edited values)
    const currentJson = {
      executiveSummary: executiveSummary || '',
      entryBarriers: entryBarriers || [],
      recommendedChannel: recommendedChannel || '',
      timeToMarket: timeToMarket || '',
      topBarrier: topBarrier || '',
      competitiveDifferentiation: competitiveDifferentiation || [],
      strategicRecommendations: strategicRecommendations || [],
      riskAssessment: riskAssessment || []
    };

    console.log('🚀 Market Entry Section - original_json:', JSON.stringify(currentJson, null, 2));
    console.log('🚀 Market Entry Section - modified_json:', JSON.stringify(currentJson, null, 2));

    onSaveChanges();
  };

  // Handle save changes with API integration
  const handleMarketEntryFullSaveChanges = async () => {
    try {
      console.log('🚀 Market Entry - Starting save operation');
      
      // Prepare original data
      const originalData = {
        section: 'market-entry',
        executiveSummary: executiveSummary,
        entryBarriers: entryBarriers,
        recommendedChannel: recommendedChannel,
        timeToMarket: timeToMarket,
        topBarrier: topBarrier,
        competitiveDifferentiation: competitiveDifferentiation,
        strategicRecommendations: strategicRecommendations,
        riskAssessment: riskAssessment
      };

      // Prepare modified data (same since onChange handlers update immediately)
      const modifiedData = {
        section: 'market-entry',
        executiveSummary: executiveSummary,
        entryBarriers: entryBarriers,
        recommendedChannel: recommendedChannel,
        timeToMarket: timeToMarket,
        topBarrier: topBarrier,
        competitiveDifferentiation: competitiveDifferentiation,
        strategicRecommendations: strategicRecommendations,
        riskAssessment: riskAssessment
      };

      // Prepare data for API according to schema
      const editData = {
        original_json: originalData,
        modified_json: modifiedData,
        edit_type: "modification"
      };

      console.log('📤 Market Entry - original_json:', originalData);
      console.log('📤 Market Entry - modified_json:', modifiedData);

      // Store data for /ask API
      localStorage.setItem('market-entry_original_json', JSON.stringify(originalData));
      localStorage.setItem('market-entry_modified_json', JSON.stringify(modifiedData));

      // Call GET API to save edits using /ask endpoint with query parameters
      const queryParams = new URLSearchParams({
        original_json: JSON.stringify(originalData),
        modified_json: JSON.stringify(modifiedData),
        edit_type: "modification",
        section: "market_entry"
      });
      
      const response = await fetch(`/api/ask?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📥 GET /ask status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Fetch updated data using GET API
      const getResponse = await fetch('https://backend-11kr.onrender.com/market_intelligence', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('📥 GET /market_intelligence status:', getResponse.status);

      if (!getResponse.ok) {
        throw new Error(`HTTP error! status: ${getResponse.status}`);
      }

      const getData = await getResponse.json();
      console.log('✅ Market Entry - GET /market_intelligence successful:', getData);
      
      // Update component with fresh data from API response
      if (getData && getData.market_entry_data) {
        const apiData = getData.market_entry_data;
        
        // Update local state with API response data
        onExecutiveSummaryChange(apiData.executiveSummary || '');
        onEntryBarriersChange(apiData.entryBarriers || []);
        const channelValue = typeof apiData.recommendedChannel === 'object' 
          ? (apiData.recommendedChannel?.channel || JSON.stringify(apiData.recommendedChannel))
          : apiData.recommendedChannel || '';
        onRecommendedChannelChange(channelValue);
        onTimeToMarketChange(apiData.timeToMarket || '');
        onTopBarrierChange(apiData.topBarrier || '');
        onCompetitiveDifferentiationChange(apiData.competitiveDifferentiation || []);
        onStrategicRecommendationsChange(apiData.strategicRecommendations || []);
        onRiskAssessmentChange(apiData.riskAssessment || []);
        
        console.log('✅ Market Entry - State updated with API response data');
      }
      
      // Also refresh the component data
      await fetchMarketEntryData();
      
      // Call the original save function
      onSaveChanges();
    } catch (error) {
      console.error('❌ Market Entry - Error saving changes:', error);
      // Still call the original save function even if API fails
      onSaveChanges();
    }
  };

  const SwotQuadrant = () => (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="bg-green-50 p-2 rounded border">
        <div className="font-semibold text-green-700">Strengths</div>
        <div className="text-green-600">• Strong tech platform</div>
      </div>
      <div className="bg-blue-50 p-2 rounded border">
        <div className="font-semibold text-blue-700">Opportunities</div>
        <div className="text-blue-600">• Growing market</div>
      </div>
      <div className="bg-orange-50 p-2 rounded border">
        <div className="font-semibold text-orange-700">Weaknesses</div>
        <div className="text-orange-600">• Limited local presence</div>
      </div>
      <div className="bg-red-50 p-2 rounded border">
        <div className="font-semibold text-red-700">Threats</div>
        <div className="text-red-600">• Regulatory changes</div>
      </div>
    </div>
  );

  const TimelineChart = () => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span className="text-xs">Q1 2025: Market Research</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <span className="text-xs">Q2 2025: Partnerships</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-xs">Q3 2025: Launch</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-purple-600" />
          Market Entry & Growth Strategy
        </h2>
        <div className="flex items-center gap-3">
          <EditDropdownMenu
            onModify={onToggleEdit}
            onComment={() => onScoutIconClick('market-entry', hasEdits)}
            className="text-purple-800 hover:text-purple-900"
          />
          {hasEdits && (
            <Button variant="ghost" size="sm" onClick={onEditHistoryOpen} className="text-gray-600 hover:text-gray-700">
              <Clock className="h-4 w-4" />
            </Button>
          )}
          {!isSplitView && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => onScoutIconClick('market-entry')} className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200 hover:shadow-md hover:shadow-purple-200/50 relative">
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-400/20 to-blue-400/20 animate-pulse opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  <Bot className="h-5 w-5 relative z-10" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Explore More with Scout</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Collapsed View */}
      {!isExpanded && !isEditing && (
        <div className="space-y-4">
          <div className="text-sm text-gray-700 leading-relaxed">
            {executiveSummary.slice(0, 200)}...
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="text-xs font-medium text-purple-700 mb-1">Top Entry Channel</div>
              <div className="text-sm font-semibold text-purple-900">
                {typeof recommendedChannel === 'object' && recommendedChannel !== null 
                  ? (recommendedChannel.channel || JSON.stringify(recommendedChannel))
                  : recommendedChannel || 'N/A'}
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-xs font-medium text-blue-700 mb-1">Time to Market</div>
              <div className="text-sm font-semibold text-blue-900">{timeToMarket}</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="text-xs font-medium text-orange-700 mb-1">Top Barrier</div>
              <div className="text-sm font-semibold text-orange-900">{topBarrier}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">SWOT Analysis</h4>
              <SwotQuadrant />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline Preview</h4>
              <TimelineChart />
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={() => onExpandToggle(true)}
              variant="outline"
              className="flex items-center space-x-2 text-sm"
            >
              <span>Read More</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && !isEditing && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              Executive Summary
            </h3>
            <div className="text-sm text-gray-700 leading-relaxed space-y-3">
              {executiveSummary.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="text-xs font-medium text-purple-700 mb-1">Top Entry Channel</div>
              <div className="text-sm font-semibold text-purple-900">
                {typeof recommendedChannel === 'object' && recommendedChannel !== null 
                  ? (recommendedChannel.channel || JSON.stringify(recommendedChannel))
                  : recommendedChannel || 'N/A'}
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-xs font-medium text-blue-700 mb-1">Time to Market</div>
              <div className="text-sm font-semibold text-blue-900">{timeToMarket}</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="text-xs font-medium text-orange-700 mb-1">Top Barrier</div>
              <div className="text-sm font-semibold text-orange-900">{topBarrier}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">SWOT Analysis</h4>
              <SwotQuadrant />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline Preview</h4>
              <TimelineChart />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Entry Barriers
              </h4>
              <ul className="space-y-2">
                {entryBarriers.map((barrier, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    {barrier}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                Competitive Differentiation
              </h4>
              <ul className="space-y-2">
                {competitiveDifferentiation.map((diff, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {diff}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Strategic Recommendations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategicRecommendations.map((recommendation, index) => (
                <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-900">{recommendation}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Risk Assessment
            </h4>
            <div className="space-y-2">
              {riskAssessment.map((risk, index) => (
                <div key={index} className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="text-sm text-red-900">{risk}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t space-y-3">
            <div className="flex justify-center">
              <Button
                onClick={() => onExpandToggle(false)}
                variant="outline"
                className="flex items-center space-x-2 text-sm"
              >
                <span>Show Less</span>
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={onExportPDF}>
                <FileText className="h-4 w-4 mr-1" />
                Save as PDF
              </Button>
              <Button variant="outline" size="sm" onClick={onSaveToWorkspace}>
                <Save className="h-4 w-4 mr-1" />
                Save to Workspace
              </Button>
              <Button variant="outline" size="sm" onClick={onGenerateShareableLink}>
                <Share className="h-4 w-4 mr-1" />
                Shareable Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="space-y-6">
          <div className="relative group border border-gray-200 rounded-lg p-4">
            <button
              onClick={() => {
                onDeleteSection('executive-summary');
                onScoutIconClick('market-entry', true, 'I noticed you removed the Executive Summary. Want me to help refine or replace it?');
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-50 hover:bg-red-100 rounded"
            >
              <X className="h-4 w-4 text-red-600" />
            </button>
            <div className="space-y-4">
              <Label htmlFor="market-entry-executive-summary" className="text-sm font-medium text-gray-700">
                Executive Summary
              </Label>
              <Textarea
                id="market-entry-executive-summary"
                value={executiveSummary}
                onChange={(e) => onExecutiveSummaryChange(e.target.value)}
                rows={4}
                className="w-full"
                placeholder="Enter executive summary for market entry strategy..."
              />
            </div>
          </div>

          <div className="relative group border border-gray-200 rounded-lg p-4">
            <button
              onClick={() => {
                onDeleteSection('key-metrics');
                onScoutIconClick('market-entry', true, 'I noticed you removed the Key Metrics section. Want me to help refine or replace it?');
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-50 hover:bg-red-100 rounded"
            >
              <X className="h-4 w-4 text-red-600" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recommended-channel" className="text-sm font-medium text-gray-700">
                  Recommended Entry Channel
                </Label>
                <Input
                  id="recommended-channel"
                  value={recommendedChannel}
                  onChange={(e) => onRecommendedChannelChange(e.target.value)}
                  placeholder="e.g., Local partnerships"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-to-market" className="text-sm font-medium text-gray-700">
                  Time to Market
                </Label>
                <Input
                  id="time-to-market"
                  value={timeToMarket}
                  onChange={(e) => onTimeToMarketChange(e.target.value)}
                  placeholder="e.g., 12-18 months"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="top-barrier" className="text-sm font-medium text-gray-700">
                  Top Barrier
                </Label>
                <Input
                  id="top-barrier"
                  value={topBarrier}
                  onChange={(e) => onTopBarrierChange(e.target.value)}
                  placeholder="e.g., Data residency laws"
                />
              </div>
            </div>
          </div>

          <div className="relative group border border-gray-200 rounded-lg p-4">
            <button
              onClick={() => {
                onDeleteSection('entry-barriers');
                onScoutIconClick('market-entry', true, 'I noticed you removed the Entry Barriers section. Want me to help refine or replace it?');
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-50 hover:bg-red-100 rounded"
            >
              <X className="h-4 w-4 text-red-600" />
            </button>
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">Entry Barriers</Label>
              {entryBarriers.map((barrier, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={barrier}
                    onChange={(e) => {
                      const updated = [...entryBarriers];
                      updated[index] = e.target.value;
                      onEntryBarriersChange(updated);
                    }}
                    placeholder={`Entry barrier ${index + 1}`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const updated = entryBarriers.filter((_, i) => i !== index);
                      onEntryBarriersChange(updated);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEntryBarriersChange([...entryBarriers, ''])}
              >
                Add Barrier
              </Button>
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex items-center gap-3 pt-6 border-t">
            <Button onClick={handleMarketEntryFullSaveChanges}>Save Changes</Button>
            <Button variant="outline" onClick={onCancelEdit}>Cancel</Button>
            <div className="flex-1"></div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEditHistoryOpen}
                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  <Clock className="h-4 w-4" />
                  Edit History
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View changes made to this report</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => onScoutIconClick('market-entry')} className="text-purple-600 hover:text-purple-700 bg-purple-50 border border-purple-200 hover:shadow-md hover:shadow-purple-200/50 transition-all duration-200 relative">
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-400/20 to-blue-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  <Bot className="h-4 w-4 relative z-10" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Get Scout's help with market entry strategy</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketEntrySection;