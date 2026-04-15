/**
 * API client for communicating with the backend Gradio app on Hugging Face Spaces.
 * Uses direct HTTP calls to Gradio's API endpoints.
 */

import axios, { AxiosProgressEvent } from 'axios';

// Configuration
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://your-username-spaces.hf.space';

// SR3 API types
export interface SR3Request {
  image: File;
}

export interface SR3Response {
  status: 'success' | 'error';
  image_url?: string;
  message: string;
  request_id?: string;
  filename?: string;
}

// 3DGS API types (async task-based)
export interface ThreeDGSRequest {
  images: File[];
}

export interface ThreeDGSSubmitResponse {
  status: 'queued' | 'error';
  message: string;
  task_id?: string;
  status_url?: string;
  download_url?: string;  // will be available after completion
  ply_url?: string;
}

export interface ThreeDGSStatusResponse {
  task_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  error?: string;
  result?: string;  // ply file path when completed
  download_url?: string;
}

export interface ThreeDGSCompletedResponse {
  status: 'completed';
  ply_url: string;
  message: string;
  filename?: string;
}

// Error handling
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public details: any
  ) {
    super(`API Error: ${statusCode} - ${JSON.stringify(details)}`);
    this.name = 'APIError';
  }
}

/**
 * Process an image through SR3 super-resolution model.
 * @param file The image file to process
 * @param onProgress Optional progress callback for upload
 * @returns Promise with SR3Response
 */
export async function processSR3(
  file: File,
  onProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<SR3Response> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${BACKEND_URL}/api/predict/sr_process`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });

    const data = response.data;
    if (data.status === 'error') {
      throw new Error(data.message);
    }

    return {
      status: 'success',
      image_url: `${BACKEND_URL}${data.image_url}`,
      message: data.message || 'Image enhanced successfully',
    };
  } catch (error: any) {
    console.error('SR3 processing error:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new APIError(error.response.status, error.response.data || error.message);
      } else {
        throw new Error(`Network error: ${error.message}`);
      }
    }
    throw error;
  }
}

/**
 * Submit 3DGS processing task (async).
 * @param files Array of image files for 3D reconstruction
 * @param onProgress Optional progress callback for upload
 * @returns Promise with ThreeDGSSubmitResponse containing task_id
 */
export async function submit3DGSTask(
  files: File[],
  onProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<ThreeDGSSubmitResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  try {
    const response = await axios.post(`${BACKEND_URL}/api/predict/gs_process`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });

    const data = response.data;
    if (data.status === 'error') {
      throw new Error(data.message);
    }

    const ply_url = data.ply_url ? `${BACKEND_URL}${data.ply_url}` : undefined;

    return {
      status: ply_url ? 'queued' : 'error',
      message: data.message || (ply_url ? '3DGS processing started' : 'Processing failed'),
      ply_url: ply_url,
      download_url: ply_url,
    };
  } catch (error: any) {
    console.error('3DGS processing error:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new APIError(error.response.status, error.response.data || error.message);
      } else {
        throw new Error(`Network error: ${error.message}`);
      }
    }
    throw error;
  }
}

/**
 * Check status of a 3DGS processing task.
 * Note: The current Gradio backend does not have a status endpoint; it's synchronous.
 * So we'll return a dummy response indicating completion.
 * @param taskId Task ID returned by submit3DGSTask
 * @returns Promise with ThreeDGSStatusResponse
 */
export async function check3DGSStatus(
  taskId: string
): Promise<ThreeDGSStatusResponse> {
  // Since the backend processes synchronously, we don't have a task ID.
  // Return a dummy response.
  return {
    task_id: taskId,
    status: 'completed',
    result: '',
  };
}

/**
 * Legacy function for backward compatibility.
 * @deprecated Use submit3DGSTask and check3DGSStatus instead
 */
export async function process3DGS(
  files: File[]
): Promise<ThreeDGSSubmitResponse> {
  console.warn('process3DGS is deprecated, use submit3DGSTask instead');
  return submit3DGSTask(files);
}

/**
 * Download a .ply file from a URL.
 * Useful when backend returns a URL to the generated .ply file.
 * @param url URL of the .ply file
 * @returns Promise with ArrayBuffer of file data
 */
export async function downloadPlyFile(url: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(url);
    return await response.arrayBuffer();
  } catch (error: any) {
    throw new Error(`Failed to download .ply file: ${error.message}`);
  }
}

/**
 * Download SR3 output image.
 * @param url URL of the SR3 output image
 * @returns Promise with Blob of image data
 */
export async function downloadSR3Image(url: string): Promise<Blob> {
  try {
    const response = await fetch(url);
    return await response.blob();
  } catch (error: any) {
    throw new Error(`Failed to download SR3 image: ${error.message}`);
  }
}

/**
 * Utility to convert ArrayBuffer to Blob for downloading
 * @param buffer ArrayBuffer of .ply data
 * @param filename Suggested filename
 */
export function savePlyFile(buffer: ArrayBuffer, filename: string = 'output.ply'): void {
  const blob = new Blob([buffer], { type: 'application/ply' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Poll for task completion (if backend uses async processing)
 * @param taskId Task ID returned by initial request
 * @param interval Polling interval in milliseconds
 * @param timeout Maximum time to poll in milliseconds
 */
export async function pollForResult<T>(
  taskId: string,
  checkStatus: (taskId: string) => Promise<T>,
  interval: number = 2000,
  timeout: number = 300000 // 5 minutes
): Promise<T> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const result = await checkStatus(taskId);
      // Assume result includes a status field
      if ((result as any).status === 'completed' || (result as any).status === 'success') {
        return result;
      } else if ((result as any).status === 'failed') {
        throw new Error(`Task failed: ${(result as any).message}`);
      }
      // Still processing, wait and retry
      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      throw error;
    }
  }

  throw new Error(`Polling timeout after ${timeout}ms`);
}