import { apiFetch, ApiResponse } from './networking';
import { API_ENDPOINTS, AUTH_TOKEN_KEY } from './config';

export interface UploadResponse {
    url: string;
    full_url: string;
    // Legacy fields for compatibility
    path?: string;
    filepath?: string;
    fullurl?: string;
    fullUrl?: string;
}

export async function uploadImage(file: File, token?: string): Promise<ApiResponse<UploadResponse>> {
    const authToken = token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    const formData = new FormData();
    formData.append('file', file);

    return apiFetch<UploadResponse>(API_ENDPOINTS.upload.image, {
        method: 'POST',
        body: formData,
        token: authToken,
    });
}
