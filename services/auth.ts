import { apiFetch, ApiResponse } from './networking';
import { API_ENDPOINTS } from './config';

// 注册接口参数类型
export interface RegisterParams {
    mobile: string;
    password: string;
    pay_password: string;
    invite_code: string;
}

export interface LoginParams {
    mobile: string;
    password: string;
}

/**
 * 注册接口
 * @param params 注册参数
 * @returns Promise<ApiResponse>
 */
export async function register(params: RegisterParams): Promise<ApiResponse> {
    try {
        const formData = new FormData();
        formData.append('tab', 'register');
        formData.append('mobile', params.mobile);
        formData.append('password', params.password);
        formData.append('pay_password', params.pay_password);
        formData.append('invite_code', params.invite_code);

        const data = await apiFetch(API_ENDPOINTS.auth.checkIn, {
            method: 'POST',
            body: formData,
        });
        console.log('注册接口原始响应:', data);
        return data;
    } catch (error: any) {
        console.error('注册接口调用失败:', error);

        // 提供更详细的错误信息
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            // 这通常是 CORS 或网络问题
            const corsError = new Error('网络请求失败，可能是跨域问题或服务器不可达。请检查：\n1. API 服务器是否正常运行\n2. 是否配置了 CORS 允许跨域\n3. 网络连接是否正常');
            (corsError as any).isCorsError = true;
            throw corsError;
        }

        throw error;
    }
}

/**
 * 登录接口
 * @param params 登录参数
 */
export async function login(params: LoginParams): Promise<ApiResponse> {
    try {
        const formData = new FormData();
        formData.append('tab', 'login');
        formData.append('username', params.mobile);
        formData.append('password', params.password);

        const data = await apiFetch(API_ENDPOINTS.auth.checkIn, {
            method: 'POST',
            body: formData,
        });
        console.log('登录接口原始响应:', data);
        return data;
    } catch (error: any) {
        console.error('登录接口调用失败:', error);
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            const corsError = new Error('网络请求失败，可能是跨域问题或服务器不可达。请检查：\n1. API 服务器是否正常运行\n2. 是否配置了 CORS 允许跨域\n3. 网络连接是否正常');
            (corsError as any).isCorsError = true;
            throw corsError;
        }
        throw error;
    }
}
