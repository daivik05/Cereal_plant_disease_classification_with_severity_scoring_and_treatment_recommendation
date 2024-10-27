'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from 'next/image'

export default function PlantDiseaseDetector() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedFile) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append('image', selectedFile)

    try {
      const response = await fetch('/api/process-image', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Error processing image:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 p-8">
      <Card className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-green-800">Plant Disease Detector</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="picture">Plant Image</Label>
              <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            {previewUrl && (
              <div className="mt-4">
                <Image src={previewUrl} alt="Preview" width={300} height={300} className="rounded-lg object-cover" />
              </div>
            )}
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={!selectedFile || isLoading}>
              {isLoading ? 'Processing...' : 'Analyze Plant'}
            </Button>
          </form>
        </CardContent>
        {results && (
          <CardFooter className="flex flex-col items-start">
            <h3 className="text-xl font-semibold text-green-800 mb-2">Results:</h3>
            <p><strong>Predicted Class:</strong> {results.predictedClass}</p>
            {!results.predictedClass.toLowerCase().endsWith("healthy") && (
              <>
                <p><strong>Affected Area:</strong> {results.percentageAffected.toFixed(2)}%</p>
                <p><strong>Severity Score:</strong> {results.severityScore}</p>
                <p><strong>Intensity Severity:</strong> {results.intensitySeverity}</p>
              </>
            )}
            <h4 className="text-lg font-semibold text-green-800 mt-4 mb-2">Treatment Recommendations:</h4>
            <ul className="list-disc pl-5">
              {results.treatmentRecommendations.map((treatment: string, index: number) => (
                <li key={index}>{treatment}</li>
              ))}
            </ul>
            {results.maskedImageUrl && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-green-800 mb-2">Processed Image:</h4>
                <Image src={results.maskedImageUrl} alt="Processed" width={300} height={300} className="rounded-lg object-cover" />
              </div>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  )
}