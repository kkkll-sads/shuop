import { ProfileResponse } from '../types';

// API 基础配置
// 开发环境使用代理，生产环境使用完整 URL
// 注意：需要重启开发服务器才能生效
const API_BASE_URL = (import.meta as any).env?.DEV 
  ? '/api'  // 开发环境使用 Vite 代理
  : 'http://18.166.211.131/index.php/api';  // 生产环境使用完整 URL

export const AUTH_TOKEN_KEY = 'cat_auth_token';
export const USER_INFO_KEY = 'cat_user_info';

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

// API 响应类型
export interface ApiResponse<T = any> {
  code?: number;
  msg?: string;
  data?: T;
  [key: string]: any;
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

    const response = await fetch(`${API_BASE_URL}/User/checkIn`, {
      method: 'POST',
      body: formData,
      // 不设置 Content-Type，让浏览器自动设置（包含 boundary）
      // 添加 mode 和 credentials 来处理 CORS
      mode: 'cors',
      credentials: 'omit',
    });

    const data = await parseResponse(response);
    console.log('API 原始响应:', data);
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
    formData.append('mobile', params.mobile);
    formData.append('password', params.password);

    const response = await fetch(`${API_BASE_URL}/User/checkIn`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
      credentials: 'omit',
    });

    const data = await parseResponse(response);
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

/**
 * 获取个人中心信息
 * @param token 用户 Token
 */
export async function fetchProfile(token: string): Promise<ApiResponse<ProfileResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/Account/profile`, {
      method: 'GET',
      headers: {
        'ba-user-token': token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
    });

    const data = await parseResponse(response);
    console.log('个人中心接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取个人中心信息失败:', error);
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      const corsError = new Error('网络请求失败，可能是跨域问题或服务器不可达。请检查：\n1. API 服务器是否正常运行\n2. 是否配置了 CORS 允许跨域\n3. 网络连接是否正常');
      (corsError as any).isCorsError = true;
      throw corsError;
    }
    throw error;
  }
}

