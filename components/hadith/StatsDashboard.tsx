'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  BookOpen, 
  BarChart3,
  TrendingUp,
  Database,
  RefreshCw
} from 'lucide-react';
import { getNarratorStats } from '@/app/actions/hadith';
import type { NarratorStats } from '@/types/hadith';

interface StatsDashboardProps {
  className?: string;
}

export default function StatsDashboard({ className = '' }: StatsDashboardProps) {
  const [stats, setStats] = useState<NarratorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const fetchedStats = await getNarratorStats();
      setStats(fetchedStats);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Database Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Database Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Unable to load statistics
          </div>
        </CardContent>
      </Card>
    );
  }

  const trustworthyPercentage = stats.totalNarrators > 0 
    ? Math.round((stats.trustworthyCount / stats.totalNarrators) * 100) 
    : 0;

  const weakPercentage = stats.totalNarrators > 0 
    ? Math.round((stats.weakCount / stats.totalNarrators) * 100) 
    : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Database Statistics
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        {lastUpdated && (
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stats.totalNarrators.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Narrators</p>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stats.trustworthyCount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Trustworthy</p>
              <Badge variant="secondary" className="text-xs">
                {trustworthyPercentage}%
              </Badge>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stats.weakCount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Weak</p>
              <Badge variant="secondary" className="text-xs">
                {weakPercentage}%
              </Badge>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center">
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stats.regionsCount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Regions</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Detailed Insights */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Database Insights
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Credibility Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Credibility Assessment
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Trustworthy Narrators</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${trustworthyPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{trustworthyPercentage}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Weak Narrators</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${weakPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{weakPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scholarly Opinions */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Scholarly Knowledge
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Opinions</span>
                  <Badge variant="outline">{stats.opinionsCount.toLocaleString()}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg. Opinions per Narrator</span>
                  <Badge variant="outline">
                    {stats.totalNarrators > 0 
                      ? (stats.opinionsCount / stats.totalNarrators).toFixed(1)
                      : '0'
                    }
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Geographic Coverage</span>
                  <Badge variant="outline">{stats.regionsCount} regions</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Quick Facts */}
        <div className="space-y-3">
          <h4 className="font-medium">Quick Facts</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {trustworthyPercentage}% of narrators are considered trustworthy
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              Coverage spans {stats.regionsCount} different regions
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              {stats.opinionsCount} scholarly opinions recorded
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-600" />
              {stats.totalNarrators} narrator profiles available
            </div>
          </div>
        </div>

        {/* Database Health Indicator */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-900">Database Status: Healthy</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            All systems operational. Search and filtering capabilities are fully functional.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 