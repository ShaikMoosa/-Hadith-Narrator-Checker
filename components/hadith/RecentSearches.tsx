'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Search, RotateCcw } from 'lucide-react'
import { fetchRecentSearches } from '@/app/actions/hadith'
import type { Search as SearchType } from '@/types/hadith'

interface RecentSearchesProps {
  searches?: SearchType[];
  onSearchSelect: (query: string) => void;
}

export default function RecentSearches({ searches = [], onSearchSelect }: RecentSearchesProps) {
  const [recentSearches, setRecentSearches] = useState<SearchType[]>(searches)
  const [loading, setLoading] = useState(false)

  const loadRecentSearches = async () => {
    setLoading(true)
    try {
      const fetchedSearches = await fetchRecentSearches()
      setRecentSearches(fetchedSearches)
    } catch (error) {
      console.error('Error loading recent searches:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searches.length === 0) {
      loadRecentSearches()
    } else {
      setRecentSearches(searches)
    }
  }, [searches])

  const formatSearchTime = (searchedAt: string) => {
    const date = new Date(searchedAt)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
    }
  }

  const truncateQuery = (query: string, maxLength: number = 60) => {
    if (query.length <= maxLength) return query
    return query.substring(0, maxLength) + '...'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Searches
        </CardTitle>
        <CardDescription>
          Your recent hadith analysis queries
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RotateCcw className="h-6 w-6 animate-spin" />
          </div>
        ) : recentSearches.length > 0 ? (
          <div className="space-y-3">
            {recentSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate" dir="auto">
                    {truncateQuery(search.query)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatSearchTime(search.searched_at)}
                    </span>
                    {search.result_found ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Results found
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        No results
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSearchSelect(search.query)}
                  className="ml-2 flex-shrink-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={loadRecentSearches}
              disabled={loading}
              className="w-full mt-4"
            >
              <RotateCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">No recent searches found</p>
            <p className="text-gray-400 text-xs mt-1">
              Start analyzing hadith texts to see your search history here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 