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

export interface SendSmsParams {
    mobile: string;
    event: string;
    password?: string;
}

export async function sendSmsCode(params: SendSmsParams, token?: string): Promise<ApiResponse<any>> {
    const authToken = token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

    // Construct body
    const body: Record<string, any> = {
        mobile: params.mobile,
        event: params.event,
    };

    if (params.password) {
        body.password = params.password;
    }

    return apiFetch(API_ENDPOINTS.sms.send, {
        method: 'POST',
        body: JSON.stringify(body),
        token: authToken,
    });
}
