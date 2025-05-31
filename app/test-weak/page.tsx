'use client'

import { useState } from 'react'
import { addWeakNarrator } from '@/app/actions/add-weak-narrator'

interface Result {
  success: boolean
  message?: string
  narrator?: any
  error?: string
}

export default function TestWeakPage() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAddWeakNarrator = async () => {
    setLoading(true)
    try {
      const res = await addWeakNarrator()
      setResult(res)
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test: Add Weak Narrator</h1>
      <button 
        onClick={handleAddWeakNarrator}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Weak Narrator'}
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Result:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
} 