import { apiFetch, ApiResponse } from './networking';
import { API_ENDPOINTS } from './config';

// 注册接口参数类型
export interface RegisterParams {
    mobile: string;
    password: string;
    pay_password: string;
    invite_code: string;
    captcha: string; // 短信验证码
}

export interface LoginParams {
    username: string; // 登录时使用 username 字段
    password: string;
    keep?: number; // 记住密码，1表示记住，0或不传表示不记住
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
        formData.append('captcha', params.captcha); // 添加验证码参数

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
        formData.append('username', params.username);
        formData.append('password', params.password);
        // 添加 keep 参数，1表示记住密码
        if (params.keep !== undefined) {
            formData.append('keep', params.keep.toString());
        }

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
