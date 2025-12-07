import { API_BASE_URL } from './config';

export interface ApiFetchConfig {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: BodyInit | null;
    /** 是否自动附带 ba-user-token */
    token?: string;
}

// API 响应类型
export interface ApiResponse<T = any> {
    code?: number;
    msg?: string;
    data?: T;
    [key: string]: any;
}

const parseResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        const text = await response.text();
        console.warn('API 返回非 JSON 响应:', text);
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error(`服务器返回了非 JSON 格式的响应: ${text.substring(0, 100)}`);
        }
    }

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${data?.msg || data?.message || JSON.stringify(data)}`);
    }

    return data;
};

/**
 * 通用请求封装
 * @param path 不包含基础前缀的路径，如：/User/checkIn
 */
export async function apiFetch<T = any>(
    path: string,
    { method = 'GET', headers = {}, body = null, token }: ApiFetchConfig = {},
): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${path}`;

    const finalHeaders: Record<string, string> = {
        Accept: 'application/json',
        ...headers,
    };

    // 需要带用户 token 的接口统一从这里注入
    if (token) {
        finalHeaders['ba-user-token'] = token;
        // 如果 header 中未指定 ba-token，将 ba-token 默认设为与 ba-user-token 相同，或根据需求留空
        // 此处根据通常惯例，ba-token有时也是需要的
        if (!finalHeaders['ba-token']) {
            finalHeaders['ba-token'] = ''; // 或者某些 API 可能需要把它设为 token? 暂时设为空字符或不设，视具体后端要求而定。
            // 根据用户提供的文档: "ba-token string (必填? 只是列出)"
            // 既然用户专门列出了 ba-token，我们应该允许传入，或者默认设为空
        }
    }

    // 对非 FormData 自动补充 JSON Content-Type
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    if (!isFormData && body && !finalHeaders['Content-Type']) {
        finalHeaders['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(url, {
            method,
            headers: finalHeaders,
            body,
            mode: 'cors',
            credentials: 'omit',
        });

        return await parseResponse(response);
    } catch (error: any) {
        console.error(`API 调用失败 [${method}] ${url}:`, error);

        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            const corsError = new Error(
                '网络请求失败，可能是跨域问题或服务器不可达。请检查：\n1. API 服务器是否正常运行\n2. 是否配置了 CORS 允许跨域\n3. 网络连接是否正常',
            );
            (corsError as any).isCorsError = true;
            throw corsError;
        }

        throw error;
    }
}
