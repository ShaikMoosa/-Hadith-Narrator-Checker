'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Search, RotateCcw } from 'lucide-react'
import { fetchRecentSearches } from '@/app/actions/hadith'
import type { RecentSearchesProps, Search as SearchType } from '@/types/hadith'

export default function RecentSearches({ searches, onSearchSelect }: RecentSearchesProps) {
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

  if (recentSearches.length === 0 && !loading) {
    return null
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Searches
          </CardTitle>
          <CardDescription>
            Quick access to your previous hadith analyses
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadRecentSearches}
          disabled={loading}
          className="flex items-center gap-1"
        >
          <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50 animate-pulse" />
              <p>Loading recent searches...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
                    onClick={() => onSearchSelect(search.query)}
                    title={search.query}
                  >
                    {truncateQuery(search.query)}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatSearchTime(search.searched_at)}
                    </span>
                    {search.result_found ? (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                        Results found
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        No results
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSearchSelect(search.query)}
                  className="ml-3 flex-shrink-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 