'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bookmark, BookmarkCheck, User, Calendar, MapPin } from 'lucide-react'
import { toggleBookmark, checkBookmarkStatus } from '@/app/actions/hadith'
import type { Narrator, NarratorListProps } from '@/types/hadith'
import { useEffect } from 'react'

export default function NarratorList({ narrators, onSelectNarrator }: NarratorListProps) {
  const [bookmarkedNarrators, setBookmarkedNarrators] = useState<Set<number>>(new Set())
  const [loadingBookmarks, setLoadingBookmarks] = useState<Set<number>>(new Set())

  // Check bookmark status for all narrators on mount
  useEffect(() => {
    const checkBookmarks = async () => {
      const bookmarkPromises = narrators.map(async (narrator) => {
        const isBookmarked = await checkBookmarkStatus(narrator.id)
        return { id: narrator.id, isBookmarked }
      })
      
      const results = await Promise.all(bookmarkPromises)
      const bookmarked = new Set(
        results.filter(result => result.isBookmarked).map(result => result.id)
      )
      setBookmarkedNarrators(bookmarked)
    }

    if (narrators.length > 0) {
      checkBookmarks()
    }
  }, [narrators])

  const handleBookmarkToggle = async (narratorId: number) => {
    setLoadingBookmarks(prev => new Set(prev).add(narratorId))
    
    try {
      const result = await toggleBookmark(narratorId)
      if (result.success) {
        setBookmarkedNarrators(prev => {
          const newSet = new Set(prev)
          if (result.isBookmarked) {
            newSet.add(narratorId)
          } else {
            newSet.delete(narratorId)
          }
          return newSet
        })
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    } finally {
      setLoadingBookmarks(prev => {
        const newSet = new Set(prev)
        newSet.delete(narratorId)
        return newSet
      })
    }
  }

  const getCredibilityColor = (credibility: 'trustworthy' | 'weak') => {
    return credibility === 'trustworthy' ? 'trustworthy' : 'weak'
  }

  const formatLifespan = (birthYear?: number, deathYear?: number) => {
    if (!birthYear && !deathYear) return null
    if (birthYear && deathYear) return `${birthYear} - ${deathYear} AH`
    if (birthYear) return `b. ${birthYear} AH`
    if (deathYear) return `d. ${deathYear} AH`
    return null
  }

  if (narrators.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No narrators found. Submit a hadith text to begin analysis.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Narrator Chain Analysis
          </CardTitle>
          <CardDescription>
            {narrators.length} narrator{narrators.length !== 1 ? 's' : ''} identified in the hadith chain
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {narrators.map((narrator, index) => (
          <Card key={narrator.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Narrator Name and Credibility */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 font-medium">#{index + 1}</span>
                      <h3 className="text-lg font-semibold text-right" dir="rtl">
                        {narrator.name_arabic}
                      </h3>
                    </div>
                    <Badge variant={getCredibilityColor(narrator.credibility)}>
                      {narrator.credibility}
                    </Badge>
                  </div>

                  {/* Transliteration */}
                  {narrator.name_transliteration && (
                    <p className="text-gray-600 font-medium">
                      {narrator.name_transliteration}
                    </p>
                  )}

                  {/* Life Details */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {formatLifespan(narrator.birth_year, narrator.death_year) && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatLifespan(narrator.birth_year, narrator.death_year)}
                      </div>
                    )}
                    {narrator.region && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {narrator.region}
                      </div>
                    )}
                  </div>

                  {/* Biography Preview */}
                  {narrator.biography && (
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {narrator.biography}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectNarrator(narrator)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBookmarkToggle(narrator.id)}
                      disabled={loadingBookmarks.has(narrator.id)}
                      className="flex items-center gap-1"
                    >
                      {bookmarkedNarrators.has(narrator.id) ? (
                        <BookmarkCheck className="h-4 w-4" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                      {bookmarkedNarrators.has(narrator.id) ? 'Bookmarked' : 'Bookmark'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 