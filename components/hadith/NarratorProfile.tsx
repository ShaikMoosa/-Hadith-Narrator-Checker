'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X, User, Calendar, MapPin, BookOpen, Quote } from 'lucide-react'
import { fetchNarratorOpinions } from '@/app/actions/hadith'
import type { NarratorProfileProps, Opinion } from '@/types/hadith'

export default function NarratorProfile({ narrator, onClose }: NarratorProfileProps) {
  const [opinions, setOpinions] = useState<Opinion[]>([])
  const [loadingOpinions, setLoadingOpinions] = useState(true)

  useEffect(() => {
    const loadOpinions = async () => {
      setLoadingOpinions(true)
      try {
        const narratorOpinions = await fetchNarratorOpinions(narrator.id)
        setOpinions(narratorOpinions)
      } catch (error) {
        console.error('Error loading opinions:', error)
      } finally {
        setLoadingOpinions(false)
      }
    }

    loadOpinions()
  }, [narrator.id])

  const getCredibilityColor = (credibility: 'trustworthy' | 'weak') => {
    return credibility === 'trustworthy' ? 'trustworthy' : 'weak'
  }

  const formatLifespan = (birthYear?: number, deathYear?: number) => {
    if (!birthYear && !deathYear) return 'Dates unknown'
    if (birthYear && deathYear) return `${birthYear} - ${deathYear} AH`
    if (birthYear) return `Born ${birthYear} AH`
    if (deathYear) return `Died ${deathYear} AH`
    return 'Dates unknown'
  }

  const groupOpinionsByVerdict = (opinions: Opinion[]) => {
    return opinions.reduce((acc, opinion) => {
      if (!acc[opinion.verdict]) {
        acc[opinion.verdict] = []
      }
      acc[opinion.verdict].push(opinion)
      return acc
    }, {} as Record<string, Opinion[]>)
  }

  const groupedOpinions = groupOpinionsByVerdict(opinions)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl text-right" dir="rtl">
                {narrator.name_arabic}
              </CardTitle>
              <Badge variant={getCredibilityColor(narrator.credibility)}>
                {narrator.credibility}
              </Badge>
            </div>
            {narrator.name_transliteration && (
              <CardDescription className="text-lg font-medium">
                {narrator.name_transliteration}
              </CardDescription>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="biography" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="biography" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Biography
              </TabsTrigger>
              <TabsTrigger value="opinions" className="flex items-center gap-2">
                <Quote className="h-4 w-4" />
                Scholarly Opinions ({opinions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="biography" className="space-y-6 mt-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Lifespan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {formatLifespan(narrator.birth_year, narrator.death_year)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Region
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {narrator.region || 'Unknown'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Biography */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Biography
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {narrator.biography ? (
                    <p className="text-gray-700 leading-relaxed">
                      {narrator.biography}
                    </p>
                  ) : (
                    <p className="text-gray-500 italic">
                      No biographical information available.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="opinions" className="space-y-4 mt-6">
              {loadingOpinions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center text-gray-500">
                    <Quote className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Loading scholarly opinions...</p>
                  </div>
                </div>
              ) : opinions.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center text-gray-500">
                    <Quote className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No scholarly opinions available for this narrator.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Trustworthy Opinions */}
                  {groupedOpinions.trustworthy && (
                    <div>
                      <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                        <Badge variant="trustworthy" className="text-xs">
                          Trustworthy
                        </Badge>
                        Positive Assessments ({groupedOpinions.trustworthy.length})
                      </h3>
                      <div className="space-y-3">
                        {groupedOpinions.trustworthy.map((opinion) => (
                          <Card key={opinion.id} className="border-green-200">
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-green-800">
                                    {opinion.scholar}
                                  </h4>
                                  {opinion.source_ref && (
                                    <span className="text-xs text-gray-500">
                                      {opinion.source_ref}
                                    </span>
                                  )}
                                </div>
                                {opinion.reason && (
                                  <p className="text-sm text-gray-700">
                                    {opinion.reason}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weak Opinions */}
                  {groupedOpinions.weak && (
                    <div>
                      <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                        <Badge variant="weak" className="text-xs">
                          Weak
                        </Badge>
                        Critical Assessments ({groupedOpinions.weak.length})
                      </h3>
                      <div className="space-y-3">
                        {groupedOpinions.weak.map((opinion) => (
                          <Card key={opinion.id} className="border-red-200">
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-red-800">
                                    {opinion.scholar}
                                  </h4>
                                  {opinion.source_ref && (
                                    <span className="text-xs text-gray-500">
                                      {opinion.source_ref}
                                    </span>
                                  )}
                                </div>
                                {opinion.reason && (
                                  <p className="text-sm text-gray-700">
                                    {opinion.reason}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 