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

export interface TaskStatusResponse {
  task_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  queue_position?: number;
  image_url?: string;
  ply_url?: string;
  error?: string;
  message?: string;
}

export interface QueueStatusResponse {
  queue_length: number;
  active_task: string | null;
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
 * Submits to backend queue and polls until completion.
 * Reports progress via onProgress callback.
 */
export async function processSR3(
  file: File,
  onProgress?: (progressEvent: { phase: string; position?: number }) => void
): Promise<SR3Response> {
  const formData = new FormData();
  formData.append('file', file);

  // Step 1: Submit to queue
  onProgress?.({ phase: 'uploading' });
  const response = await axios.post('/api/predict/sr_process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // 60s timeout for upload
  });

  const submitData = response.data;
  if (submitData.status === 'error') {
    throw new Error(submitData.message);
  }

  const taskId = submitData.task_id;

  // Step 2: Poll until completed
  onProgress?.({ phase: 'queued', position: submitData.queue_position });
  const result = await pollTaskStatus(taskId, onProgress);

  if (result.status === 'completed' && result.image_url) {
    return {
      status: 'success',
      image_url: result.image_url,
      message: result.message || 'Super-resolution completed',
    };
  } else if (result.status === 'failed') {
    throw new Error(result.error || 'Processing failed');
  } else {
    throw new Error(`Unexpected task state: ${result.status}`);
  }
}

/**
 * Poll task status until completion or failure.
 */
async function pollTaskStatus(
  taskId: string,
  onProgress?: (progressEvent: { phase: string; position?: number }) => void
): Promise<TaskStatusResponse> {
  const maxAttempts = 600; // 10 minutes max
  const interval = 1000; // 1 second
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, interval));
    attempts++;

    const response = await axios.get(`/api/task/status/${taskId}`, {
      timeout: 10000,
      params: { _t: Date.now() }, // bust browser/proxy cache
    });
    const data = response.data;

    if (data.status === 'completed') {
      return data;
    } else if (data.status === 'failed') {
      return data;
    } else if (data.status === 'processing') {
      onProgress?.({ phase: 'processing' });
    } else if (data.status === 'queued') {
      onProgress?.({ phase: 'queued', position: data.queue_position });
    }
  }

  throw new Error('Processing timed out after 10 minutes');
}

/**
 * Submit 3DGS training task.
 * Submits to backend queue and polls until completion.
 */
export async function submit3DGSTask(
  files: File[],
  onProgress?: (progressEvent: { phase: string; position?: number }) => void
): Promise<ThreeDGSSubmitResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  // Step 1: Submit to queue
  onProgress?.({ phase: 'uploading' });
  const response = await axios.post('/api/predict/gs_process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // 1 minute for upload
  });

  const submitData = response.data;
  if (submitData.status === 'error') {
    throw new Error(submitData.message);
  }

  const taskId = submitData.task_id;

  // Step 2: Poll until completed (3DGS takes much longer)
  onProgress?.({ phase: 'queued', position: submitData.queue_position });
  const result = await pollTaskStatusWithLongTimeout(taskId, onProgress);

  if (result.status === 'completed' && result.ply_url) {
    return {
      status: 'queued',
      message: result.message || '3DGS training completed',
      ply_url: result.ply_url,
      download_url: result.ply_url,
    };
  } else if (result.status === 'failed') {
    throw new Error(result.error || '3DGS processing failed');
  } else {
    throw new Error('Unexpected task state');
  }
}

/**
 * Poll task status with longer timeout for 3DGS.
 */
async function pollTaskStatusWithLongTimeout(
  taskId: string,
  onProgress?: (progressEvent: { phase: string; position?: number }) => void
): Promise<TaskStatusResponse> {
  const maxAttempts = 3600; // 1 hour max for 3DGS
  const interval = 1000; // 1 second
  let attempts = 0;
  let lastReportedPhase = '';

  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, interval));
    attempts++;

    // Report progress every 5 seconds
    if (attempts % 5 === 0) {
      const response = await axios.get(`/api/task/status/${taskId}`, {
        timeout: 10000,
      });
      const data = response.data;

      if (data.status === 'completed') {
        return data;
      } else if (data.status === 'failed') {
        return data;
      } else if (data.status === 'processing') {
        const elapsed = Math.floor(attempts / 5);
        const phase = `processing (${elapsed}s)`;
        if (phase !== lastReportedPhase) {
          onProgress?.({ phase: 'processing', position: elapsed });
          lastReportedPhase = phase;
        }
      } else if (data.status === 'queued') {
        onProgress?.({ phase: 'queued', position: data.queue_position });
      }
    }
  }

  throw new Error('3DGS processing timed out after 1 hour');
}

/**
 * Download a processed file from the backend.
 */
export async function downloadProcessedFile(
  url: string,
  filename?: string
): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/') && !contentType.startsWith('application/')) {
    throw new Error(`Download failed: unexpected content type "${contentType}"`);
  }
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename || url.split('/').pop() || 'download';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(blobUrl);
}

/**
 * Check current queue status.
 */
export async function getQueueStatus(): Promise<QueueStatusResponse> {
  const response = await axios.get('/api/queue/status');
  return response.data;
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
