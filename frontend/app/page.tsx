'use client';

import { useState } from 'react';
import { process3DGS, APIError } from '@/lib/api';
import GsplatViewer from '@/components/GsplatViewer';
import SR3Comparison from '@/components/SR3Comparison';

export default function Home() {
  const [threedgsImages, setThreedgsImages] = useState<File[]>([]);
  const [threedgsResult, setThreedgsResult] = useState<string | null>(null);
  const [threedgsLoading, setThreedgsLoading] = useState(false);
  const [threedgsError, setThreedgsError] = useState<string | null>(null);
  const [plyUrl, setPlyUrl] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  const handleThreedgsImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setThreedgsImages(files);
      setThreedgsError(null);
      setPlyUrl(null);
      setTaskId(null);
    }
  };


  const handleThreedgsSubmit = async () => {
    if (threedgsImages.length === 0) {
      setThreedgsError('Please select at least one image');
      return;
    }

    setThreedgsLoading(true);
    setThreedgsError(null);
    setThreedgsResult(null);
    setPlyUrl(null);
    setTaskId(null);

    try {
      const result = await process3DGS(threedgsImages);
      // The new API returns a download_url if processing is synchronous
      if (result.download_url) {
        setPlyUrl(result.download_url);
        setThreedgsResult(`3DGS processing completed: ${result.message}`);
      } else {
        setThreedgsResult(`3DGS processing started: ${result.message}`);
        // If there's a task_id, store it for polling (though not used currently)
        if (result.task_id) {
          setTaskId(result.task_id);
        }
      }
    } catch (error) {
      if (error instanceof APIError) {
        setThreedgsError(`API Error (${error.statusCode}): ${error.message}`);
      } else {
        setThreedgsError(`Error: ${(error as Error).message}`);
      }
    } finally {
      setThreedgsLoading(false);
    }
  };

  const handleReset3DGS = () => {
    setThreedgsImages([]);
    setThreedgsResult(null);
    setThreedgsError(null);
    setPlyUrl(null);
    setTaskId(null);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">SR3 & 3DGS Processing</h1>
        <p className="text-gray-600">Upload images for super-resolution or 3D reconstruction</p>
        <p className="text-sm text-gray-500 mt-2">
          Backend URL: {process.env.NEXT_PUBLIC_BACKEND_URL || 'Not configured'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* SR3 Section */}
        <div className="border rounded-lg shadow bg-white">
          <SR3Comparison />
        </div>

        {/* 3DGS Section */}
        <div className="border rounded-lg p-6 shadow">
          <h2 className="text-2xl font-bold mb-4">3DGS 3D Reconstruction</h2>
          <p className="text-gray-600 mb-4">
            Upload multiple images of an object/scene to generate a 3D point cloud (.ply file).
          </p>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Select Images (Multiple)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleThreedgsImagesChange}
              className="w-full p-2 border rounded"
              disabled={threedgsLoading}
            />
            {threedgsImages.length > 0 && (
              <p className="mt-2 text-sm text-gray-500">
                Selected {threedgsImages.length} image(s)
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleThreedgsSubmit}
              disabled={threedgsLoading || threedgsImages.length === 0}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:bg-purple-300"
            >
              {threedgsLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Process with 3DGS'}
            </button>
            <button
              onClick={handleReset3DGS}
              disabled={threedgsLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Reset
            </button>
          </div>

          {threedgsError && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              <strong>Error:</strong> {threedgsError}
            </div>
          )}

          {threedgsResult && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
              <strong>Success:</strong> {threedgsResult}
            </div>
          )}

          {/* 3D Preview */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">3D Gaussian Splatting Preview</h3>

            {plyUrl ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Loaded: {plyUrl.split('/').pop()}</span>
                  </div>
                  <button
                    onClick={() => window.open(plyUrl, '_blank')}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open .ply
                  </button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <GsplatViewer
                    plyUrl={plyUrl}
                    className="h-96"
                    autoRotate={true}
                    showControls={true}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = plyUrl;
                      link.download = plyUrl.split('/').pop() || 'model.ply';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download .ply
                  </button>
                  <button
                    onClick={() => setPlyUrl(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                  >
                    Hide Preview
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">No 3D Model Loaded</h4>
                <p className="text-gray-500 mb-4">
                  Process images with 3DGS to generate and preview a 3D Gaussian Splatting model.
                </p>
                <div className="text-sm text-gray-400">
                  <p>The preview will appear here once processing is complete.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <h3 className="text-xl font-bold mb-3">API Documentation</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-bold">SR3 Endpoint (Gradio)</h4>
            <code className="text-sm block mt-2">POST /api/predict/sr_process</code>
            <p className="text-sm text-gray-600 mt-1">
              Input: Single image file via Gradio client
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-bold">3DGS Endpoint (Gradio)</h4>
            <code className="text-sm block mt-2">POST /api/predict/gs_process</code>
            <p className="text-sm text-gray-600 mt-1">
              Input: Multiple image files via Gradio client
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          See <code>frontend/lib/api.ts</code> for the complete Gradio client implementation.
        </p>
      </div>
    </div>
  );
}