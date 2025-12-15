import { apiFetch, ApiResponse } from './networking';
import { API_ENDPOINTS, AUTH_TOKEN_KEY } from './config';

export interface UploadFileData {
    suffix?: string;
    url?: string;
    full_url?: string;
    path?: string;
    filepath?: string;
    fullurl?: string;
    fullUrl?: string;
    [key: string]: any;
}

export interface UploadResponse {
    url: string;
    full_url: string;
    // Legacy fields for compatibility
    path?: string;
    filepath?: string;
    fullurl?: string;
    fullUrl?: string;
}

interface RawUploadResponse {
    file?: UploadFileData;
    url?: string;
    full_url?: string;
    path?: string;
    filepath?: string;
    fullurl?: string;
    fullUrl?: string;
    [key: string]: any;
}

export async function uploadImage(file: File, token?: string): Promise<ApiResponse<UploadResponse>> {
    const authToken = token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiFetch<RawUploadResponse>(API_ENDPOINTS.upload.image, {
        method: 'POST',
        body: formData,
        token: authToken,
    });

    // 后端返回数据可能在 data.file 下，也可能直接在 data 下
    const rawData = res.data || {};
    const fileData = rawData.file || rawData;
    
    // 统一提取 url 和 full_url
    const url = fileData.url || fileData.path || fileData.filepath || '';
    const full_url = fileData.full_url || fileData.fullurl || fileData.fullUrl || url;

    return {
        ...res,
        data: {
            url,
            full_url,
            path: fileData.path,
            filepath: fileData.filepath,
            fullurl: fileData.fullurl,
            fullUrl: fileData.fullUrl,
        },
    };
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
