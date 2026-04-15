/**
 * API client for communicating with the backend.
 * Uses relative paths - proxied via Next.js rewrites in production
 * and development.
 */

import axios, { AxiosProgressEvent } from 'axios';

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

// 3DGS API types
export interface ThreeDGSRequest {
  images: File[];
}

export interface ThreeDGSSubmitResponse {
  status: 'queued' | 'error';
  message: string;
  task_id?: string;
  status_url?: string;
  download_url?: string;
  ply_url?: string;
}

export interface ThreeDGSStatusResponse {
  task_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  error?: string;
  result?: string;
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
 */
export async function processSR3(
  file: File,
  onProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<SR3Response> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    // Relative path - proxied by Next.js rewrites
    const response = await axios.post('/api/predict/sr_process', formData, {
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
      image_url: data.image_url,
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
 * Submit 3DGS processing task.
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
    const response = await axios.post('/api/predict/gs_process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });

    const data = response.data;
    if (data.status === 'error') {
      throw new Error(data.message);
    }

    const ply_url = data.ply_url;

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
 */
export async function check3DGSStatus(
  taskId: string
): Promise<ThreeDGSStatusResponse> {
  return {
    task_id: taskId,
    status: 'completed',
    result: '',
  };
}

/**
 * Legacy function for backward compatibility.
 * @deprecated Use submit3DGSTask instead
 */
export async function process3DGS(
  files: File[]
): Promise<ThreeDGSSubmitResponse> {
  return submit3DGSTask(files);
}

/**
 * Download a .ply file from a URL.
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
 * Poll for task completion
 */
export async function pollForResult<T>(
  taskId: string,
  checkStatus: (taskId: string) => Promise<T>,
  interval: number = 2000,
  timeout: number = 300000
): Promise<T> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const result = await checkStatus(taskId);
      if ((result as any).status === 'completed' || (result as any).status === 'success') {
        return result;
      } else if ((result as any).status === 'failed') {
        throw new Error(`Task failed: ${(result as any).message}`);
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      throw error;
    }
  }

  throw new Error(`Polling timeout after ${timeout}ms`);
}
