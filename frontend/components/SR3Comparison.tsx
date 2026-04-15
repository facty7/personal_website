'use client';

import { useState, useRef } from 'react';
import { processSR3, downloadSR3Image, APIError } from '@/lib/api';

interface SR3ComparisonProps {
  className?: string;
}

export default function SR3Comparison({ className = '' }: SR3ComparisonProps) {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (e.g., 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB');
      return;
    }

    setOriginalImage(file);
    setOriginalImageUrl(URL.createObjectURL(file));
    setEnhancedImageUrl(null);
    setError(null);
    setSuccess(null);
  };

  const handleProcess = async () => {
    if (!originalImage) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Process image through SR3
      const result = await processSR3(originalImage);

      if (result.status === 'success' && result.image_url) {
        const imageUrl = result.image_url;
        // Check if the URL is a data URL or absolute URL
        if (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) {
          // Directly use the URL
          setEnhancedImageUrl(imageUrl);
        } else {
          // Fallback: download via fetch (assuming it's a relative URL)
          const blob = await downloadSR3Image(imageUrl);
          const enhancedUrl = URL.createObjectURL(blob);
          setEnhancedImageUrl(enhancedUrl);
        }
        setSuccess(result.message || 'Image enhanced successfully');
      } else {
        throw new Error(result.message || 'Unknown error');
      }
    } catch (err) {
      if (err instanceof APIError) {
        setError(`API Error (${err.statusCode}): ${err.message}`);
      } else if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setOriginalImageUrl(null);
    setEnhancedImageUrl(null);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`border rounded-lg shadow bg-white ${className}`}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">SR3 Super-Resolution Comparison</h2>
        <p className="text-gray-600 mb-6">
          Upload an image to see the difference before and after super-resolution enhancement.
        </p>

        {/* Upload Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <label className="block font-medium">Upload Image</label>
            {originalImage && (
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700"
                type="button"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="sr3-upload"
                />
                <label
                  htmlFor="sr3-upload"
                  className="cursor-pointer block"
                >
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <p className="text-gray-600">
                    {originalImage ? originalImage.name : 'Click to upload image'}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </label>
              </div>
            </div>

            <div className="flex items-center">
              <button
                onClick={handleProcess}
                disabled={loading || !originalImage}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Enhance with SR3'}
              </button>
            </div>
          </div>
        </div>

        {/* Comparison Section */}
        {(originalImageUrl || enhancedImageUrl) && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Comparison</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Original Image */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-3 border-b">
                  <h4 className="font-medium text-gray-700">Original Image</h4>
                  {originalImage && (
                    <p className="text-sm text-gray-500">
                      {originalImage.name} ({(originalImage.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
                <div className="p-4 flex items-center justify-center bg-gray-50 min-h-[300px]">
                  {originalImageUrl ? (
                    <img
                      src={originalImageUrl}
                      alt="Original"
                      className="max-w-full max-h-[400px] object-contain rounded"
                    />
                  ) : (
                    <div className="text-gray-400">No image uploaded</div>
                  )}
                </div>
              </div>

              {/* Enhanced Image */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-50 p-3 border-b">
                  <h4 className="font-medium text-blue-700">Enhanced Image (SR3 Output)</h4>
                  <p className="text-sm text-blue-500">Super-resolution applied</p>
                </div>
                <div className="p-4 flex items-center justify-center bg-blue-50 min-h-[300px]">
                  {enhancedImageUrl ? (
                    <img
                      src={enhancedImageUrl}
                      alt="Enhanced"
                      className="max-w-full max-h-[400px] object-contain rounded"
                    />
                  ) : (
                    <div className="text-gray-400">
                      {loading ? 'Processing...' : 'Click "Enhance with SR3" to see result'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-medium text-red-800">Error</h4>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="font-medium text-green-800">Success</h4>
                <p className="text-green-600 mt-1">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2">How it works</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Upload an image (JPG, PNG, WEBP)</li>
            <li>• Click "Enhance with SR3" to apply super-resolution</li>
            <li>• Compare original vs enhanced images side-by-side</li>
            <li>• The SR3 model increases image resolution while preserving details</li>
          </ul>
        </div>
      </div>
    </div>
  );
}