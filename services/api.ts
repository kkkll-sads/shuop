import { ProfileResponse } from '../types';

// 统一 API 前缀，与 vite.config.ts 中的代理前缀保持一致
const API_PREFIX = '/api';

// API 基础配置：
// - 开发环境：使用 Vite 代理，走相对路径 /api
// - 生产环境：优先使用环境变量 VITE_API_BASE_URL，其次降级到写死的线上地址

const DEFAULT_API_ORIGIN = 'http://18.166.211.131';
const rawEnv = (import.meta as any).env ?? {};

const resolveApiBaseUrl = () => {
  const envBase = rawEnv?.VITE_API_BASE_URL;
  if (envBase) return envBase;
  if (rawEnv?.DEV) return API_PREFIX;
  return `${DEFAULT_API_ORIGIN}/api`;
};

const resolveApiOrigin = () => {
  const candidates = [rawEnv?.VITE_API_BASE_URL, rawEnv?.VITE_API_TARGET];

  for (const candidate of candidates) {
    if (candidate && candidate.startsWith('http')) {
      try {
        return new URL(candidate).origin;
      } catch (error) {
        console.warn('[api] 无法解析 API origin:', candidate, error);
      }
    }
  }

  if (!rawEnv?.DEV) {
    const baseUrl = resolveApiBaseUrl();
    if (baseUrl.startsWith('http')) {
      try {
        return new URL(baseUrl).origin;
      } catch {}
    }
  }

  return DEFAULT_API_ORIGIN;
};

// API 基础配置：
// - 开发环境：使用 Vite 代理，走相对路径 /api
// - 生产环境：优先使用环境变量 VITE_API_BASE_URL，其次降级到写死的线上地址
const API_BASE_URL = resolveApiBaseUrl();
export const API_ASSET_ORIGIN = resolveApiOrigin();

export const normalizeAssetUrl = (raw?: string) => {
  if (!raw) return '';
  if (raw.startsWith('http')) return raw;

  if (raw.startsWith('//')) {
    try {
      const originUrl = new URL(API_ASSET_ORIGIN);
      return `${originUrl.protocol}${raw}`;
    } catch {
      const protocol =
        typeof window !== 'undefined' ? window.location.protocol : 'https:';
      return `${protocol}${raw}`;
    }
  }

  if (raw.startsWith('/')) {
    return `${API_ASSET_ORIGIN.replace(/\/$/, '')}${raw}`;
  }

  return raw;
};

// 统一维护所有接口路径，更换接口只需改这里
export const API_ENDPOINTS = {
  auth: {
    checkIn: '/User/checkIn',
  },
  account: {
    profile: '/Account/profile',
    cancelAccount: '/Account/cancelAccount',
    /** 余额日志（资金明细） */
    balance: '/Account/balance',
  },
  address: {
    /** 收货地址列表 */
    list: '/shopAddress/index',
    /** 新增收货地址 */
    add: '/shopAddress/add',
    /** 编辑收货地址 */
    edit: '/shopAddress/edit',
    /** 删除收货地址 */
    delete: '/shopAddress/delete',
    /** 获取默认收货地址 */
    getDefault: '/shopAddress/getDefault',
  },
  user: {
    realNameStatus: '/User/realNameStatus',
    submitRealName: '/User/submitRealName',
    updateAvatar: '/User/updateAvatar',
    updateNickname: '/User/updateNickname',
    updatePassword: '/User/updatePassword',
    updatePayPassword: '/User/updatePayPassword',
    paymentAccountList: '/User/getPaymentAccountList',
    addPaymentAccount: '/User/addPaymentAccount',
    deletePaymentAccount: '/User/deletePaymentAccount',
    editPaymentAccount: '/User/editPaymentAccount',
    setDefaultPaymentAccount: '/User/setDefaultPaymentAccount',
    agentReviewStatus: '/User/agentReviewStatus',
    submitAgentReview: '/User/submitAgentReview',
  },
  upload: {
    image: '/ajax/upload',
  },
  announcement: {
    /** 平台公告列表 */
    list: '/Announcement/index',
  },
  banner: {
    /** 轮播图列表 */
    list: '/Banner/getBannerList',
  },
  recharge: {
    /** 充值公司账户列表 */
    companyAccountList: '/Recharge/getCompanyAccountList',
    /** 提交充值订单 */
    submitOrder: '/Recharge/submitOrder',
    /** 提交提现申请 */
    submitWithdraw: '/Recharge/submitWithdraw',
    /** 获取我的充值订单列表 */
    getMyOrderList: '/Recharge/getMyOrderList',
    /** 获取我的提现记录列表 */
    getMyWithdrawList: '/Recharge/getMyWithdrawList',
  },
  common: {
    page: '/Common/page',
  },
  help: {
    /** 帮助中心 - 分类列表 */
    categories: '/Help/categories',
    /** 帮助中心 - 问题列表 */
    questions: '/Help/questions',
  },
  shopProduct: {
    /** 商品列表 */
    list: '/shopProduct/index',
    /** 商品详情 */
    detail: '/shopProduct/detail',
    /** 商品分类列表 */
    categories: '/shopProduct/categories',
    /** 热销商品列表（按销量排序） */
    sales: '/shopProduct/sales',
    /** 最新商品列表 */
    latest: '/shopProduct/latest',
  },
  shopOrder: {
    /** 创建订单 */
    create: '/shopOrder/create',
  },
  collectionSession: {
    /** 交易专场列表 */
    index: '/collectionSession/index',
    /** 交易专场详情 */
    detail: '/collectionSession/detail',
  },
  collectionItem: {
    /** 交易商品列表 */
    index: '/collectionItem/index',
    /** 根据专场ID获取商品列表 */
    bySession: '/collectionItem/bySession',
    /** 交易商品详情 */
    detail: '/collectionItem/detail',
    /** 购买藏品 */
    buy: '/collectionItem/buy',
    /** 获取购买记录列表 */
    purchaseRecords: '/collectionItem/purchaseRecords',
    /** 获取寄售商品列表 */
    consignmentList: '/collectionItem/consignmentList',
    /** 申请提货 */
    deliver: '/collectionItem/deliver',
    /** 申请寄售 */
    consign: '/collectionItem/consign',
  },
} as const;

// 本地存储 key 可以后续抽到环境变量里，先集中在这里统一引用
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

interface ApiFetchConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: BodyInit | null;
  /** 是否自动附带 ba-user-token */
  token?: string;
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
async function apiFetch<T = any>(
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

// API 响应类型
export interface ApiResponse<T = any> {
  code?: number;
  msg?: string;
  data?: T;
  [key: string]: any;
}

// 通用单页内容类型
export interface PageContent {
  title?: string;
  content?: string;
}

/**
 * 获取“关于我们”页面内容
 * 对应后端: /Common/page?type=about_us
 */
export async function fetchAboutUsPage(): Promise<ApiResponse<PageContent>> {
  return apiFetch<PageContent>(`${API_ENDPOINTS.common.page}?type=about_us`, {
    method: 'GET',
  });
}

/**
 * 帮助中心 - 分类数据结构
 * 示例接口: http://18.166.211.131/index.php/api/Help/categories
 */
export interface HelpCategoryItem {
  id: number;
  name: string;
  /** 分类编码，例如 account / trade / asset / other */
  code: string;
}

export interface HelpCategoryListData {
  list: HelpCategoryItem[];
  [key: string]: any;
}

export async function fetchHelpCategories(): Promise<
  ApiResponse<HelpCategoryListData>
> {
  return apiFetch<HelpCategoryListData>(API_ENDPOINTS.help.categories, {
    method: 'GET',
  });
}

/**
 * 帮助中心 - 问题列表数据结构
 * 示例接口:
 * http://18.166.211.131/index.php/api/Help/questions?category_id=1&category_code=account
 */
export interface HelpQuestionItem {
  id: number;
  title: string;
  content: string;
  category_id: number;
  /** 若后端补充图片字段，可在此扩展，例如 image_urls: string[]; */
  [key: string]: any;
}

export interface HelpQuestionListData {
  list: HelpQuestionItem[];
  [key: string]: any;
}

export interface FetchHelpQuestionsParams {
  category_id: number | string;
  category_code?: string;
}

export async function fetchHelpQuestions(
  params: FetchHelpQuestionsParams,
): Promise<ApiResponse<HelpQuestionListData>> {
  const search = new URLSearchParams();
  search.set('category_id', String(params.category_id));
  if (params.category_code) {
    search.set('category_code', params.category_code);
  }

  const path = `${API_ENDPOINTS.help.questions}?${search.toString()}`;

  return apiFetch<HelpQuestionListData>(path, {
    method: 'GET',
  });
}

/**
 * 积分商城 / 商品相关接口
 *
 * 示例：
 * - 列表:   http://18.166.211.131/index.php/api/shopProduct/index?page=1&limit=10
 * - 详情:   http://18.166.211.131/index.php/api/shopProduct/detail?id=1
 * - 分类:   http://18.166.211.131/index.php/api/shopProduct/categories
 */

export interface ShopProductItem {
  id: number;
  name: string;
  thumbnail: string;
  category: string;
  price: number;
  score_price: number;
  stock: number;
  sales: number;
  /** 购买方式：money / score / both */
  purchase_type: string;
  /** 是否实物：'1' 实物，'0' 虚拟 */
  is_physical: string;
  [key: string]: any;
}

export interface ShopProductListData {
  list: ShopProductItem[];
  total: number;
  page: number;
  limit: number;
  [key: string]: any;
}

export interface FetchShopProductsParams {
  page?: number;
  limit?: number;
}

export async function fetchShopProducts(
  params: FetchShopProductsParams = {},
): Promise<ApiResponse<ShopProductListData>> {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.limit !== undefined) search.set('limit', String(params.limit));

  const path =
    search.toString().length > 0
      ? `${API_ENDPOINTS.shopProduct.list}?${search.toString()}`
      : API_ENDPOINTS.shopProduct.list;

  return apiFetch<ShopProductListData>(path, {
    method: 'GET',
  });
}

export interface ShopProductDetailData extends ShopProductItem {
  images?: string[];
  description?: string;
}

export async function fetchShopProductDetail(
  id: number | string,
): Promise<ApiResponse<ShopProductDetailData>> {
  const search = new URLSearchParams();
  search.set('id', String(id));

  const path = `${API_ENDPOINTS.shopProduct.detail}?${search.toString()}`;

  return apiFetch<ShopProductDetailData>(path, {
    method: 'GET',
  });
}

export interface ShopProductCategoriesData {
  list: string[];
  [key: string]: any;
}

export async function fetchShopProductCategories(): Promise<
  ApiResponse<ShopProductCategoriesData>
> {
  return apiFetch<ShopProductCategoriesData>(API_ENDPOINTS.shopProduct.categories, {
    method: 'GET',
  });
}

/**
 * 获取热销商品列表（按销量排序）
 * 示例接口: http://18.166.211.131/index.php/api/shopProduct/sales?page=1&limit=10
 */
export async function fetchShopProductsBySales(
  params: FetchShopProductsParams = {},
): Promise<ApiResponse<ShopProductListData>> {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.limit !== undefined) search.set('limit', String(params.limit));

  const path =
    search.toString().length > 0
      ? `${API_ENDPOINTS.shopProduct.sales}?${search.toString()}`
      : API_ENDPOINTS.shopProduct.sales;

  return apiFetch<ShopProductListData>(path, {
    method: 'GET',
  });
}

/**
 * 获取最新商品列表
 * 示例接口: http://18.166.211.131/index.php/api/shopProduct/latest?page=1&limit=10
 */
export async function fetchShopProductsByLatest(
  params: FetchShopProductsParams = {},
): Promise<ApiResponse<ShopProductListData>> {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.limit !== undefined) search.set('limit', String(params.limit));

  const path =
    search.toString().length > 0
      ? `${API_ENDPOINTS.shopProduct.latest}?${search.toString()}`
      : API_ENDPOINTS.shopProduct.latest;

  return apiFetch<ShopProductListData>(path, {
    method: 'GET',
  });
}

/**
 * 获取“隐私政策”页面内容
 * 对应后端: /Common/page?type=privacy_policy
 * 示例接口: http://18.166.211.131/index.php/api/Common/page?type=privacy_policy
 */
export async function fetchPrivacyPolicyPage(): Promise<ApiResponse<PageContent>> {
  return apiFetch<PageContent>(`${API_ENDPOINTS.common.page}?type=privacy_policy`, {
    method: 'GET',
  });
}

/**
 * 获取“用户协议”页面内容
 * 对应后端: /Common/page?type=user_agreement
 * 示例接口: http://18.166.211.131/index.php/api/Common/page?type=user_agreement
 */
export async function fetchUserAgreementPage(): Promise<ApiResponse<PageContent>> {
  return apiFetch<PageContent>(`${API_ENDPOINTS.common.page}?type=user_agreement`, {
    method: 'GET',
  });
}

/**
 * 平台公告列表
 * 示例接口: http://18.166.211.131/index.php/api/Announcement/index?page=1&limit=10&type=normal
 */
export interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  type: string;
  status: string;
  is_popup: number;
  popup_delay: number;
  sort: number;
  start_time: string;
  end_time: string;
  view_count: number;
  createtime: string;
  updatetime: string;
  [key: string]: any;
}

export interface AnnouncementListData {
  list: AnnouncementItem[];
  total: number;
  current_page: number;
  last_page: number;
  [key: string]: any;
}

export interface FetchAnnouncementsParams {
  page?: number;
  limit?: number;
  /** 公告类型，默认 normal */
  type?: string;
}

export async function fetchAnnouncements(
  params: FetchAnnouncementsParams = {},
): Promise<ApiResponse<AnnouncementListData>> {
  const { page, limit, type = 'normal' } = params;
  const search = new URLSearchParams();
  if (page !== undefined) search.set('page', String(page));
  if (limit !== undefined) search.set('limit', String(limit));
  if (type) search.set('type', type);

  const path =
    search.toString().length > 0
      ? `${API_ENDPOINTS.announcement.list}?${search.toString()}`
      : API_ENDPOINTS.announcement.list;

  return apiFetch<AnnouncementListData>(path, {
    method: 'GET',
  });
}

/**
 * 轮播图 Banner 列表
 * 示例接口: http://18.166.211.131/index.php/api/Banner/getBannerList?page=1&limit=10
 */
export interface BannerApiItem {
  id: number;
  title: string;
  image: string;
  url?: string;
  description?: string;
  sort?: number;
  status?: string;
  start_time?: string;
  end_time?: string;
  create_time?: number;
  update_time?: number;
  [key: string]: any;
}

export interface BannerListData {
  list: BannerApiItem[];
  total: number;
  current_page: number;
  last_page: number;
  [key: string]: any;
}

export interface FetchBannersParams {
  page?: number;
  limit?: number;
}

export async function fetchBanners(
  params: FetchBannersParams = {},
): Promise<ApiResponse<BannerListData>> {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set('page', String(params.page));
  if (params.limit !== undefined) search.set('limit', String(params.limit));

  const path =
    search.toString().length > 0
      ? `${API_ENDPOINTS.banner.list}?${search.toString()}`
      : API_ENDPOINTS.banner.list;

  return apiFetch<BannerListData>(path, {
    method: 'GET',
  });
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

/**
 * 获取个人中心信息
 * @param token 用户 Token
 */
export async function fetchProfile(token: string): Promise<ApiResponse<ProfileResponse>> {
  try {
    const data = await apiFetch<ProfileResponse>(API_ENDPOINTS.account.profile, {
      method: 'GET',
      token,
    });
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

export interface CancelAccountParams {
  password: string;
  reason?: string;
  token?: string;
}

export async function cancelAccount(params: CancelAccountParams): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再尝试注销账户');
  }

  const password = params.password?.trim();
  const reason = params.reason?.trim() ?? '';

  if (!password) {
    throw new Error('请输入登录密码以确认注销');
  }

  const payload = new FormData();
  payload.append('password', password);
  payload.append('reason', reason);

  try {
    const data = await apiFetch(API_ENDPOINTS.account.cancelAccount, {
      method: 'POST',
      body: payload,
      token,
    });
    console.log('账户注销接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('提交账户注销申请失败:', error);
    throw error;
  }
}

export interface UpdateAvatarParams {
  avatar?: string;
  avatar_url?: string;
  token?: string;
}

export async function updateAvatar(params: UpdateAvatarParams): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再尝试修改头像');
  }

  const payload = {
    avatar: params.avatar || '',
    avatar_url: params.avatar_url || '',
  };

  try {
    const data = await apiFetch(API_ENDPOINTS.user.updateAvatar, {
      method: 'POST',
      body: JSON.stringify(payload),
      token,
    });
    console.log('修改头像接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('修改头像失败:', error);
    throw error;
  }
}

export interface UpdateNicknameParams {
  nickname: string;
  token?: string;
}

export async function updateNickname(params: UpdateNicknameParams): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再尝试修改昵称');
  }

  if (!params.nickname?.trim()) {
    throw new Error('请输入合法的昵称');
  }

  const payload = new FormData();
  payload.append('nickname', params.nickname.trim());

  try {
    const data = await apiFetch(API_ENDPOINTS.user.updateNickname, {
      method: 'POST',
      body: payload,
      token,
    });
    console.log('修改昵称接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('修改昵称失败:', error);
    throw error;
  }
}

export interface UpdatePasswordParams {
  old_password: string;
  new_password: string;
  token?: string;
}

export async function updatePassword(params: UpdatePasswordParams): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再尝试修改密码');
  }

  const oldPassword = params.old_password?.trim();
  const newPassword = params.new_password?.trim();

  if (!oldPassword) {
    throw new Error('请输入旧密码');
  }

  if (!newPassword) {
    throw new Error('请输入新密码');
  }

  if (newPassword.length < 6) {
    throw new Error('新密码长度至少 6 位');
  }

  if (newPassword === oldPassword) {
    throw new Error('新密码不能与旧密码相同');
  }

  const payload = new FormData();
  payload.append('old_password', oldPassword);
  payload.append('new_password', newPassword);

  try {
    const data = await apiFetch(API_ENDPOINTS.user.updatePassword, {
      method: 'POST',
      body: payload,
      token,
    });
    console.log('修改登录密码接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('修改登录密码失败:', error);
    throw error;
  }
}

export interface UpdatePayPasswordParams {
  old_pay_password: string;
  new_pay_password: string;
  token?: string;
}

export async function updatePayPassword(params: UpdatePayPasswordParams): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再尝试修改支付密码');
  }

  const oldPassword = params.old_pay_password?.trim();
  const newPassword = params.new_pay_password?.trim();

  if (!oldPassword || !newPassword) {
    throw new Error('请完整输入旧支付密码和新支付密码');
  }

  if (newPassword.length < 6) {
    throw new Error('新支付密码长度至少 6 位');
  }

  if (newPassword === oldPassword) {
    throw new Error('新支付密码不能与旧支付密码相同');
  }

  const payload = new FormData();
  payload.append('old_pay_password', oldPassword);
  payload.append('new_pay_password', newPassword);

  try {
    const data = await apiFetch(API_ENDPOINTS.user.updatePayPassword, {
      method: 'POST',
      body: payload,
      token,
    });
    console.log('修改支付密码接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('修改支付密码失败:', error);
    throw error;
  }
}

/**
 * 通用图片上传接口
 * 对应后端地址: /ajax/upload
 */
export interface UploadImageOptions {
  /** 存储驱动，默认 local */
  driver?: string;
  /** 业务分组，默认 default */
  topic?: string;
  /** 用户 token，不传则自动从本地存储读取 */
  token?: string;
}

export interface UploadImageResult {
  url?: string;
  fullurl?: string;
  full_url?: string;
  [key: string]: any;
}

export async function uploadImage(
  file: File,
  options: UploadImageOptions = {},
): Promise<ApiResponse<UploadImageResult>> {
  const {
    driver = 'local',
    topic = 'default',
    token = localStorage.getItem(AUTH_TOKEN_KEY) || '',
  } = options;

  if (!file) {
    throw new Error('上传文件不能为空');
  }

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再上传图片');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('driver', driver);
  formData.append('topic', topic);

  try {
    const data = await apiFetch<{ file?: UploadImageResult; [key: string]: any }>(API_ENDPOINTS.upload.image, {
      method: 'POST',
      body: formData,
      token,
    });

    // 兼容返回 data.file.xxx 的后端结构
    if (data?.data?.file) {
      data.data = {
        ...data.data.file,
        url: data.data.file.url ?? data.data.file.path ?? data.data.file.filepath,
        fullurl:
          data.data.file.fullurl ??
          data.data.file.full_url ??
          data.data.file.fullUrl,
      };
    }

    console.log('图片上传接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('图片上传失败:', error);
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      const corsError = new Error('图片上传失败，可能是跨域问题或服务器不可达。请检查网络或稍后重试');
      (corsError as any).isCorsError = true;
      throw corsError;
    }
    throw error;
  }
}

/**
 * 实名认证状态
 * 对应后端: /User/realNameStatus
 */
export interface RealNameStatusData {
  real_name_status: number;
  real_name_status_text: string;
  real_name: string;
  id_card: string;
  id_card_front: string;
  id_card_back: string;
  audit_time: string;
  audit_reason: string;
}

export async function fetchRealNameStatus(
  token: string = localStorage.getItem(AUTH_TOKEN_KEY) || '',
): Promise<ApiResponse<RealNameStatusData>> {
  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看实名认证状态');
  }

  try {
    const data = await apiFetch<RealNameStatusData>(API_ENDPOINTS.user.realNameStatus, {
      method: 'GET',
      token,
    });
    console.log('实名认证状态接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取实名认证状态失败:', error);
    throw error;
  }
}

/**
 * 支付/收款卡号列表
 * 对应后端: /User/getPaymentAccountList
 * 示例接口: http://18.166.211.131/index.php/api/User/getPaymentAccountList
 */
export interface PaymentAccountItem {
  id?: number | string;
  type?: string;
  type_text?: string;
  account?: string;
  bank_name?: string;
  bank_branch?: string;
  account_name?: string;
  is_default?: number;
  [key: string]: any;
}

export interface PaymentAccountListData {
  list: PaymentAccountItem[];
  [key: string]: any;
}

export async function fetchPaymentAccountList(
  token: string = localStorage.getItem(AUTH_TOKEN_KEY) || '',
): Promise<ApiResponse<PaymentAccountListData>> {
  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看卡号列表');
  }

  try {
    const data = await apiFetch<PaymentAccountListData>(API_ENDPOINTS.user.paymentAccountList, {
      method: 'GET',
      token,
    });
    console.log('卡号管理列表接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取卡号列表失败:', error);
    throw error;
  }
}

export interface AddPaymentAccountParams {
  type: string;
  account_type: string;
  bank_name?: string;
  account_name: string;
  account_number: string;
  bank_branch?: string;
  screenshot?: File | string;
  token?: string;
}

export async function addPaymentAccount(
  params: AddPaymentAccountParams,
): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再添加卡号');
  }

  const formData = new FormData();
  formData.append('type', params.type);
  formData.append('account_type', params.account_type);
  formData.append('account_name', params.account_name);
  formData.append('account_number', params.account_number);

  if (params.bank_name) {
    formData.append('bank_name', params.bank_name);
  }

  if (params.bank_branch) {
    formData.append('bank_branch', params.bank_branch);
  }

  if (params.screenshot instanceof File) {
    formData.append('screenshot', params.screenshot);
  } else if (typeof params.screenshot === 'string' && params.screenshot) {
    formData.append('screenshot', params.screenshot);
  }

  try {
    const data = await apiFetch(API_ENDPOINTS.user.addPaymentAccount, {
      method: 'POST',
      body: formData,
      token,
    });
    console.log('新增卡号接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('新增卡号失败:', error);
    throw error;
  }
}

export interface DeletePaymentAccountParams {
  id: string | number;
  token?: string;
}

export async function deletePaymentAccount(
  params: DeletePaymentAccountParams,
): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再删除账户');
  }

  if (params.id === null || params.id === undefined || params.id === '') {
    throw new Error('缺少要删除的账户 ID');
  }

  const formData = new FormData();
  formData.append('id', String(params.id));

  try {
    const data = await apiFetch(API_ENDPOINTS.user.deletePaymentAccount, {
      method: 'POST',
      body: formData,
      token,
    });
    console.log('删除卡号接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('删除卡号失败:', error);
    throw error;
  }
}

export interface EditPaymentAccountParams {
  id: string | number;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  bank_branch?: string;
  screenshot?: File | string;
  token?: string;
}

export async function editPaymentAccount(
  params: EditPaymentAccountParams,
): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再编辑账户');
  }

  if (params.id === null || params.id === undefined || params.id === '') {
    throw new Error('缺少要编辑的账户 ID');
  }

  const formData = new FormData();
  formData.append('id', String(params.id));

  if (params.bank_name !== undefined) {
    formData.append('bank_name', params.bank_name);
  }
  if (params.account_name !== undefined) {
    formData.append('account_name', params.account_name);
  }
  if (params.account_number !== undefined) {
    formData.append('account_number', params.account_number);
  }
  if (params.bank_branch !== undefined) {
    formData.append('bank_branch', params.bank_branch);
  }

  if (params.screenshot instanceof File) {
    formData.append('screenshot', params.screenshot);
  } else if (typeof params.screenshot === 'string' && params.screenshot) {
    formData.append('screenshot', params.screenshot);
  }

  try {
    const data = await apiFetch(API_ENDPOINTS.user.editPaymentAccount, {
      method: 'POST',
      body: formData,
      token,
    });
    console.log('编辑卡号接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('编辑卡号失败:', error);
    throw error;
  }
}

export interface SetDefaultPaymentAccountParams {
  id: string | number;
  token?: string;
}

export async function setDefaultPaymentAccount(
  params: SetDefaultPaymentAccountParams,
): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再设置默认账户');
  }

  if (params.id === null || params.id === undefined || params.id === '') {
    throw new Error('缺少要设置默认的账户 ID');
  }

  const formData = new FormData();
  formData.append('id', String(params.id));

  try {
    const data = await apiFetch(API_ENDPOINTS.user.setDefaultPaymentAccount, {
      method: 'POST',
      body: formData,
      token,
    });
    console.log('设置默认卡号接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('设置默认卡号失败:', error);
    throw error;
  }
}

/**
 * 提交实名认证
 * 对应后端: /User/submitRealName
 */
export interface SubmitRealNameParams {
  real_name: string;
  id_card: string;
  id_card_front: string;
  id_card_back: string;
  token?: string;
}

export async function submitRealName(
  params: SubmitRealNameParams,
): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再提交实名认证');
  }

  const realName = params.real_name?.trim();
  const idCard = params.id_card?.trim();

  if (!realName) {
    throw new Error('请输入真实姓名');
  }

  if (!idCard) {
    throw new Error('请输入身份证号码');
  }

  if (!params.id_card_front || !params.id_card_back) {
    throw new Error('请完整上传身份证正反面照片');
  }

  const payload = new FormData();
  payload.append('real_name', realName);
  payload.append('id_card', idCard);
  payload.append('id_card_front', params.id_card_front);
  payload.append('id_card_back', params.id_card_back);

  try {
    const data = await apiFetch(API_ENDPOINTS.user.submitRealName, {
      method: 'POST',
      body: payload,
      token,
    });
    console.log('提交实名认证接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('提交实名认证失败:', error);
    throw error;
  }
}

/**
 * 代理商审核状态
 * 对应后端: /User/agentReviewStatus
 */
export interface AgentReviewStatusData {
  status: number;
  status_text: string;
  company_name: string;
  legal_person: string;
  legal_id_number: string;
  subject_type: number;
  license_image: string;
  audit_time: string;
  audit_remark: string;
}

export async function fetchAgentReviewStatus(
  token: string = localStorage.getItem(AUTH_TOKEN_KEY) || '',
): Promise<ApiResponse<AgentReviewStatusData>> {
  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看代理商状态');
  }

  try {
    const data = await apiFetch<AgentReviewStatusData>(API_ENDPOINTS.user.agentReviewStatus, {
      method: 'GET',
      token,
    });
    console.log('代理商状态接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取代理商状态失败:', error);
    throw error;
  }
}

/**
 * 提交代理商审核
 * 对应后端: /User/submitAgentReview
 */
export interface SubmitAgentReviewParams {
  company_name: string;
  legal_person: string;
  legal_id_number: string;
  /** 主体类型：1 为企业，2 为个体户（按当前页面文案推测） */
  subject_type: number;
  /** 营业执照图片路径（后端上传接口返回的路径或 URL） */
  license_image: string;
  token?: string;
}

export async function submitAgentReview(
  params: SubmitAgentReviewParams,
): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再提交代理商申请');
  }

  const companyName = params.company_name?.trim();
  const legalPerson = params.legal_person?.trim();
  const legalIdNumber = params.legal_id_number?.trim();

  if (!companyName) {
    throw new Error('请输入企业名称');
  }
  if (!legalPerson) {
    throw new Error('请输入企业法人');
  }
  if (!legalIdNumber) {
    throw new Error('请输入法人证件号');
  }
  if (!params.license_image) {
    throw new Error('请先上传营业执照');
  }

  const payload = new FormData();
  payload.append('company_name', companyName);
  payload.append('legal_person', legalPerson);
  payload.append('legal_id_number', legalIdNumber);
  payload.append('subject_type', String(params.subject_type));
  payload.append('license_image', params.license_image);

  try {
    const data = await apiFetch(API_ENDPOINTS.user.submitAgentReview, {
      method: 'POST',
      body: payload,
      token,
    });
    console.log('提交代理商审核接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('提交代理商审核失败:', error);
    throw error;
  }
}

/**
 * 收货地址相关类型与接口
 * 对应后端:
 * - 列表:  /shopAddress/index
 * - 新增:  /shopAddress/add
 * - 编辑:  /shopAddress/edit
 * - 删除:  /shopAddress/delete
 *
 * 示例完整接口:
 * - 列表:  http://18.166.211.131/index.php/api/shopAddress/index
 * - 新增:  http://18.166.211.131/index.php/api/shopAddress/add
 * - 编辑:  http://18.166.211.131/index.php/api/shopAddress/edit
 * - 删除:  http://18.166.211.131/index.php/api/shopAddress/delete
 */

export interface AddressItem {
  id?: number | string;
  name?: string;
  phone?: string;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  /** 1 为默认地址，0 为非默认 */
  is_default?: number | string;
  [key: string]: any;
}

export interface AddressListData {
  list: AddressItem[];
  [key: string]: any;
}

/**
 * 获取收货地址列表
 */
export async function fetchAddressList(
  token: string = localStorage.getItem(AUTH_TOKEN_KEY) || '',
): Promise<ApiResponse<AddressListData>> {
  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看收货地址');
  }

  try {
    const data = await apiFetch<AddressListData>(API_ENDPOINTS.address.list, {
      method: 'GET',
      token,
    });
    console.log('收货地址列表接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取收货地址列表失败:', error);
    throw error;
  }
}

export interface SaveAddressParams {
  id?: number | string | null;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  /** "1" 或 "0" */
  is_default?: string;
  token?: string;
}

/**
 * 新增或编辑收货地址
 * 后端使用不同接口，但字段结构基本一致
 */
export async function saveAddress(params: SaveAddressParams): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再编辑收货地址');
  }

  const formData = new FormData();
  if (params.id !== undefined && params.id !== null && params.id !== '') {
    formData.append('id', String(params.id));
  }
  formData.append('name', params.name);
  formData.append('phone', params.phone);
  formData.append('province', params.province);
  formData.append('city', params.city);
  formData.append('district', params.district);
  formData.append('address', params.address);
  formData.append('is_default', params.is_default ?? '0');

  const isEdit =
    params.id !== undefined && params.id !== null && params.id !== '';

  try {
    const data = await apiFetch(isEdit ? API_ENDPOINTS.address.edit : API_ENDPOINTS.address.add, {
      method: 'POST',
      body: formData,
      token,
    });
    console.log(isEdit ? '编辑收货地址接口原始响应:' : '新增收货地址接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error(isEdit ? '编辑收货地址失败:' : '新增收货地址失败:', error);
    throw error;
  }
}

export interface DeleteAddressParams {
  id: number | string;
  token?: string;
}

/**
 * 删除收货地址
 */
export async function deleteAddress(
  params: DeleteAddressParams,
): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再删除收货地址');
  }

  if (params.id === null || params.id === undefined || params.id === '') {
    throw new Error('缺少要删除的收货地址 ID');
  }

  const formData = new FormData();
  formData.append('id', String(params.id));

  try {
    const data = await apiFetch(API_ENDPOINTS.address.delete, {
      method: 'POST',
      body: formData,
      token,
    });
    console.log('删除收货地址接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('删除收货地址失败:', error);
    throw error;
  }
}

/**
 * 获取默认收货地址
 * 对应后端: /shopAddress/getDefault
 * 示例接口: http://18.166.211.131/index.php/api/shopAddress/getDefault
 */
export async function fetchDefaultAddress(
  token: string = localStorage.getItem(AUTH_TOKEN_KEY) || '',
): Promise<ApiResponse<AddressItem>> {
  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再获取默认收货地址');
  }

  try {
    const data = await apiFetch<AddressItem>(API_ENDPOINTS.address.getDefault, {
      method: 'GET',
      token,
    });
    console.log('获取默认收货地址接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取默认收货地址失败:', error);
    throw error;
  }
}

/**
 * 创建订单接口
 * 对应后端: /shopOrder/create
 * 示例接口: http://18.166.211.131/index.php/api/shopOrder/create
 */
export interface CreateOrderItem {
  product_id: number;
  quantity: number;
}

export interface CreateOrderParams {
  items: CreateOrderItem[];
  pay_type: 'money' | 'score';
  address_id?: number | null;
  remark?: string;
  token?: string;
}

export async function createOrder(
  params: CreateOrderParams,
): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再创建订单');
  }

  if (!params.items || params.items.length === 0) {
    throw new Error('请选择要购买的商品');
  }

  if (!params.pay_type) {
    throw new Error('请选择支付方式');
  }

  // 如果没有指定 address_id，尝试获取默认收货地址
  let addressId = params.address_id;
  if (addressId === undefined || addressId === null) {
    try {
      const defaultAddressResponse = await fetchDefaultAddress(token);
      if (defaultAddressResponse.code === 1 && defaultAddressResponse.data?.id) {
        addressId = typeof defaultAddressResponse.data.id === 'string' 
          ? parseInt(defaultAddressResponse.data.id, 10) 
          : defaultAddressResponse.data.id;
      }
    } catch (error) {
      // 获取默认地址失败，继续使用 null，让后端判断是否需要地址
      console.warn('获取默认收货地址失败，将使用 null:', error);
      addressId = null;
    }
  }

  // 构建 JSON 请求体，按照后端要求的格式
  const requestBody = {
    items: params.items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
    })),
    pay_type: params.pay_type,
    address_id: addressId ?? null,
    remark: params.remark || '',
  };

  try {
    const data = await apiFetch(API_ENDPOINTS.shopOrder.create, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      token,
    });
    console.log('创建订单接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('创建订单失败:', error);
    throw error;
  }
}

/**
 * 充值公司账户列表
 * 对应后端: /Recharge/getCompanyAccountList?usage=recharge
 * 示例接口: http://18.166.211.131/index.php/api/Recharge/getCompanyAccountList?usage=recharge
 */
export interface CompanyAccountItem {
  id: number;
  type: string;
  account_name: string;
  account_number: string;
  bank_name: string | null;
  bank_branch: string | null;
  qrcode: string;
  status: number;
  sort: number;
  remark: string;
  create_time: number;
  update_time: number;
  type_text: string;
  status_text: string;
  [key: string]: any;
}

export interface CompanyAccountListData {
  list: CompanyAccountItem[];
  [key: string]: any;
}

export interface FetchCompanyAccountListParams {
  usage?: string;
  token?: string;
}

export async function fetchCompanyAccountList(
  params: FetchCompanyAccountListParams = {},
): Promise<ApiResponse<CompanyAccountListData>> {
  const usage = params.usage || 'recharge';
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再获取充值账户信息');
  }

  const search = new URLSearchParams();
  if (usage) {
    search.set('usage', usage);
  }

  const path = `${API_ENDPOINTS.recharge.companyAccountList}?${search.toString()}`;

  try {
    const data = await apiFetch<CompanyAccountListData>(path, {
      method: 'GET',
      token,
    });
    console.log('充值公司账户列表接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取充值公司账户列表失败:', error);
    throw error;
  }
}

/**
 * 提交充值订单
 * 对应后端: /Recharge/submitOrder
 * 示例接口: http://18.166.211.131/index.php/api/Recharge/submitOrder
 */
export interface SubmitRechargeOrderParams {
  /** 充值金额(元) */
  amount: number;
  /** 支付方式: bank_card=银行卡, alipay=支付宝, wechat=微信, usdt=USDT */
  payment_type: 'bank_card' | 'alipay' | 'wechat' | 'usdt';
  /** 公司收款账户ID */
  company_account_id: number;
  /** 付款截图文件(支持jpg/png/gif格式)，与payment_screenshot_id或payment_screenshot_url二选一 */
  payment_screenshot?: File;
  /** 付款截图附件ID（通过/api/ajax/upload接口上传后获取），与payment_screenshot或payment_screenshot_url二选一 */
  payment_screenshot_id?: number;
  /** 付款截图文件路径（通过/api/ajax/upload接口上传后获取），与payment_screenshot或payment_screenshot_id二选一 */
  payment_screenshot_url?: string;
  token?: string;
}

export interface SubmitRechargeOrderResponse {
  order_no: string;
  order_id: number;
  [key: string]: any;
}

export async function submitRechargeOrder(
  params: SubmitRechargeOrderParams,
): Promise<ApiResponse<SubmitRechargeOrderResponse>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再提交充值订单');
  }

  if (!params.amount || params.amount <= 0) {
    throw new Error('请输入有效的充值金额');
  }

  if (!params.payment_type) {
    throw new Error('请选择支付方式');
  }

  if (!params.company_account_id) {
    throw new Error('请选择充值账户');
  }

  const formData = new FormData();
  formData.append('amount', String(params.amount));
  formData.append('payment_type', params.payment_type);
  formData.append('company_account_id', String(params.company_account_id));

  // 处理付款截图：优先使用文件，其次使用ID，最后使用URL
  if (params.payment_screenshot instanceof File) {
    formData.append('payment_screenshot', params.payment_screenshot);
  } else if (params.payment_screenshot_id) {
    formData.append('payment_screenshot_id', String(params.payment_screenshot_id));
  } else if (params.payment_screenshot_url) {
    formData.append('payment_screenshot_url', params.payment_screenshot_url);
  }

  try {
    const data = await apiFetch(API_ENDPOINTS.recharge.submitOrder, {
      method: 'POST',
      body: formData,
      token,
    });
    console.log('提交充值订单接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('提交充值订单失败:', error);
    throw error;
  }
}

/**
 * 提交提现申请
 * 对应后端: /Recharge/submitWithdraw
 * 示例接口: http://18.166.211.131/index.php/api/Recharge/submitWithdraw
 */
export interface SubmitWithdrawParams {
  /** 提现金额(元) */
  amount: number;
  /** 用户绑定的收款账户ID */
  payment_account_id: number | null;
  /** 支付密码 */
  pay_password: string;
  /** 提现备注 */
  remark?: string;
  token?: string;
}

export interface SubmitWithdrawResponse {
  [key: string]: any;
}

export async function submitWithdraw(
  params: SubmitWithdrawParams,
): Promise<ApiResponse<SubmitWithdrawResponse>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再提交提现申请');
  }

  if (!params.amount || params.amount <= 0) {
    throw new Error('请输入有效的提现金额');
  }

  if (!params.payment_account_id) {
    throw new Error('请选择收款账户');
  }

  if (!params.pay_password) {
    throw new Error('请输入支付密码');
  }

  const requestBody = {
    amount: params.amount,
    payment_account_id: params.payment_account_id,
    pay_password: params.pay_password,
    remark: params.remark || '',
  };

  try {
    const data = await apiFetch<SubmitWithdrawResponse>(
      API_ENDPOINTS.recharge.submitWithdraw,
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
        token,
      },
    );
    console.log('提交提现申请接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('提交提现申请失败:', error);
    throw error;
  }
}

/**
 * 获取我的充值订单列表
 * 对应后端: /Recharge/getMyOrderList
 * 示例接口: http://18.166.211.131/index.php/api/Recharge/getMyOrderList?page=1&limit=10
 */
export interface RechargeOrderItem {
  id: number;
  order_no: string;
  user_id: number;
  amount: string;
  payment_type: string;
  company_account_id: number;
  payment_screenshot: string;
  status: number;
  audit_admin_id: number;
  audit_time: number;
  audit_remark: string;
  create_time: number;
  update_time: number;
  payment_type_text: string;
  status_text: string;
  create_time_text: string;
  audit_time_text: string;
}

export interface RechargeOrderListData {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  data: RechargeOrderItem[];
  has_more: boolean;
}

export interface GetMyOrderListParams {
  page?: number;
  limit?: number;
  token?: string;
}

export async function getMyOrderList(
  params: GetMyOrderListParams = {},
): Promise<ApiResponse<RechargeOrderListData>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
  const page = params.page || 1;
  const limit = params.limit || 10;

  const search = new URLSearchParams();
  search.append('page', String(page));
  search.append('limit', String(limit));

  const path = `${API_ENDPOINTS.recharge.getMyOrderList}?${search.toString()}`;

  try {
    const data = await apiFetch<RechargeOrderListData>(path, {
      method: 'GET',
      token,
    });
    console.log('获取充值订单列表接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取充值订单列表失败:', error);
    throw error;
  }
}

/**
 * 获取我的提现记录列表
 * 对应后端: /Recharge/getMyWithdrawList
 * 示例接口: http://18.166.211.131/index.php/api/Recharge/getMyWithdrawList?page=1&limit=10
 */
export interface WithdrawOrderItem {
  id: number;
  user_id: number;
  payment_account_id: number;
  amount: string;
  fee: string;
  actual_amount: string;
  account_type: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_branch: string;
  status: number;
  audit_time: number;
  audit_admin_id: number;
  audit_reason: string;
  pay_time: number | null;
  pay_admin_id: number;
  pay_reason: string;
  remark: string;
  create_time: number;
  update_time: number;
  account_type_text: string;
  status_text: string;
  create_time_text: string;
  audit_time_text: string;
  pay_time_text: string;
}

export interface WithdrawOrderListData {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  data: WithdrawOrderItem[];
  has_more: boolean;
}

export interface GetMyWithdrawListParams {
  page?: number;
  limit?: number;
  token?: string;
}

export async function getMyWithdrawList(
  params: GetMyWithdrawListParams = {},
): Promise<ApiResponse<WithdrawOrderListData>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
  const page = params.page || 1;
  const limit = params.limit || 10;

  const search = new URLSearchParams();
  search.append('page', String(page));
  search.append('limit', String(limit));

  const path = `${API_ENDPOINTS.recharge.getMyWithdrawList}?${search.toString()}`;

  try {
    const data = await apiFetch<WithdrawOrderListData>(path, {
      method: 'GET',
      token,
    });
    console.log('获取提现记录列表接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取提现记录列表失败:', error);
    throw error;
  }
}

/**
 * 余额日志（资金明细）
 * 对应后端: /Account/balance
 * 示例接口: http://18.166.211.131/index.php/api/Account/balance?page=1&limit=10
 */
export interface BalanceLogItem {
  id: number;
  user_id: number;
  money: string;
  before: string;
  after: string;
  memo: string;
  create_time: number;
}

export interface BalanceLogData {
  list: BalanceLogItem[];
  total: number;
  per_page: number;
  current_page: number;
}

export interface GetBalanceLogParams {
  page?: number;
  limit?: number;
  token?: string;
}

export async function getBalanceLog(
  params: GetBalanceLogParams = {},
): Promise<ApiResponse<BalanceLogData>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
  const page = params.page || 1;
  const limit = params.limit || 10;

  const search = new URLSearchParams();
  search.append('page', String(page));
  search.append('limit', String(limit));

  const path = `${API_ENDPOINTS.account.balance}?${search.toString()}`;

  try {
    const data = await apiFetch<BalanceLogData>(path, {
      method: 'GET',
      token,
    });
    console.log('获取余额日志接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取余额日志失败:', error);
    throw error;
  }
}

/**
 * 交易专场相关接口
 * 对应后端:
 * - 列表: /collectionSession/index
 * - 详情: /collectionSession/detail?id=1
 */

export interface CollectionSessionItem {
  id: number;
  title: string;
  image: string;
  start_time: string; // HH:mm
  end_time: string;   // HH:mm
  is_active: boolean;
  [key: string]: any;
}

export interface CollectionSessionListData {
  list: CollectionSessionItem[];
  [key: string]: any;
}

/**
 * 获取交易专场列表
 * 示例接口: http://18.166.211.131/index.php/api/collectionSession/index
 */
export async function fetchCollectionSessions(): Promise<
  ApiResponse<CollectionSessionListData>
> {
  try {
    const data = await apiFetch<CollectionSessionListData>(
      API_ENDPOINTS.collectionSession.index,
      {
        method: 'GET',
      },
    );
    console.log('交易专场列表接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取交易专场列表失败:', error);
    throw error;
  }
}

export interface CollectionSessionDetailData extends CollectionSessionItem {
  status: string;
  sort: number;
  create_time: number;
  update_time: number;
  [key: string]: any;
}

/**
 * 获取交易专场详情
 * 示例接口: http://18.166.211.131/index.php/api/collectionSession/detail?id=1
 */
export async function fetchCollectionSessionDetail(
  id: number | string,
): Promise<ApiResponse<CollectionSessionDetailData>> {
  const search = new URLSearchParams();
  search.set('id', String(id));

  const path = `${API_ENDPOINTS.collectionSession.detail}?${search.toString()}`;

  try {
    const data = await apiFetch<CollectionSessionDetailData>(path, {
      method: 'GET',
    });
    console.log('交易专场详情接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取交易专场详情失败:', error);
    throw error;
  }
}

/**
 * 交易商品相关接口
 * 对应后端:
 * - 列表: /collectionItem/index?page=1&limit=10
 * - 按专场获取: /collectionItem/bySession?session_id=1&page=1&limit=10
 * - 详情: /collectionItem/detail?id=1
 */

export interface CollectionItem {
  id: number;
  session_id: number;
  title: string;
  image: string;
  price: number;
  stock: number;
  sales: number;
  [key: string]: any;
}

export interface CollectionItemListData {
  list: CollectionItem[];
  total: number;
  page: number;
  limit: number;
  [key: string]: any;
}

export interface FetchCollectionItemsParams {
  page?: number;
  limit?: number;
  session_id?: number;
}

/**
 * 获取交易商品列表
 * 示例接口: http://18.166.211.131/index.php/api/collectionItem/index?page=1&limit=10
 */
export async function fetchCollectionItems(
  params: FetchCollectionItemsParams = {},
): Promise<ApiResponse<CollectionItemListData>> {
  const { page = 1, limit = 10, session_id } = params;
  const search = new URLSearchParams();
  search.set('page', String(page));
  search.set('limit', String(limit));
  if (session_id) {
    search.set('session_id', String(session_id));
  }

  const path = `${API_ENDPOINTS.collectionItem.index}?${search.toString()}`;

  try {
    const data = await apiFetch<CollectionItemListData>(path, {
      method: 'GET',
    });
    console.log('交易商品列表接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取交易商品列表失败:', error);
    throw error;
  }
}

/**
 * 根据专场ID获取商品列表
 * 示例接口: http://18.166.211.131/index.php/api/collectionItem/bySession?session_id=1&page=1&limit=10
 */
export async function fetchCollectionItemsBySession(
  sessionId: number | string,
  params: { page?: number; limit?: number } = {},
): Promise<ApiResponse<CollectionItemListData>> {
  const { page = 1, limit = 10 } = params;
  const search = new URLSearchParams();
  search.set('session_id', String(sessionId));
  search.set('page', String(page));
  search.set('limit', String(limit));

  const path = `${API_ENDPOINTS.collectionItem.bySession}?${search.toString()}`;

  try {
    const data = await apiFetch<CollectionItemListData>(path, {
      method: 'GET',
    });
    console.log('按专场获取商品列表接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('按专场获取商品列表失败:', error);
    throw error;
  }
}

export interface CollectionItemDetailData extends CollectionItem {
  images?: string[];
  description?: string;
  artist?: string;
  status?: string;
  sort?: number;
  create_time?: number;
  update_time?: number;
  [key: string]: any;
}

/**
 * 获取交易商品详情
 * 示例接口: http://18.166.211.131/index.php/api/collectionItem/detail?id=1
 */
export async function fetchCollectionItemDetail(
  id: number | string,
): Promise<ApiResponse<CollectionItemDetailData>> {
  const search = new URLSearchParams();
  search.set('id', String(id));

  const path = `${API_ENDPOINTS.collectionItem.detail}?${search.toString()}`;

  try {
    const data = await apiFetch<CollectionItemDetailData>(path, {
      method: 'GET',
    });
    console.log('交易商品详情接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取交易商品详情失败:', error);
    throw error;
  }
}

/**
 * 购买藏品接口
 * 对应后端: /collectionItem/buy
 * 示例接口: http://18.166.211.131/index.php/api/collectionItem/buy
 */
export interface BuyCollectionItemParams {
  /** 藏品ID */
  item_id: number | string;
  /** 购买数量，默认1 */
  quantity?: number;
  /** 支付方式: money=余额, score=积分 */
  pay_type: 'money' | 'score';
  /** 产品ID记录（如'第一天产品'） */
  product_id_record?: string;
  token?: string;
}

export async function buyCollectionItem(
  params: BuyCollectionItemParams,
): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再购买藏品');
  }

  if (!params.item_id) {
    throw new Error('缺少藏品ID');
  }

  if (!params.pay_type) {
    throw new Error('请选择支付方式');
  }

  const formData = new FormData();
  formData.append('item_id', String(params.item_id));
  formData.append('quantity', String(params.quantity || 1));
  formData.append('pay_type', params.pay_type);
  if (params.product_id_record) {
    formData.append('product_id_record', params.product_id_record);
  }

  try {
    const data = await apiFetch(API_ENDPOINTS.collectionItem.buy, {
      method: 'POST',
      body: formData,
      token,
    });
    console.log('购买藏品接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('购买藏品失败:', error);
    throw error;
  }
}

/**
 * 购买记录列表
 * 对应后端: /collectionItem/purchaseRecords
 */
export interface PurchaseRecordItem {
  order_id: number;
  order_no: string;
  total_amount: number;
  status: string;
  pay_type: string;
  pay_time: number;
  item_id: number;
  item_title: string;
  item_image: string;
  price: number;
  quantity: number;
  subtotal: number;
  pay_time_text: string;
  status_text: string;
  pay_type_text: string;
  [key: string]: any;
}

export interface PurchaseRecordListData {
  list: PurchaseRecordItem[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  has_more: boolean;
  consignment_coupon?: number;
}

export interface GetPurchaseRecordsParams {
  page?: number;
  limit?: number;
  token?: string;
}

export async function getPurchaseRecords(
  params: GetPurchaseRecordsParams = {},
): Promise<ApiResponse<PurchaseRecordListData>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
  const page = params.page || 1;
  const limit = params.limit || 10;

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看购买记录');
  }

  const search = new URLSearchParams();
  search.append('page', String(page));
  search.append('limit', String(limit));

  const path = `${API_ENDPOINTS.collectionItem.purchaseRecords}?${search.toString()}`;

  try {
    const data = await apiFetch<PurchaseRecordListData>(path, {
      method: 'GET',
      token,
    });
    console.log('获取购买记录列表接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取购买记录列表失败:', error);
    throw error;
  }
}

/**
 * 为兼容前端逻辑，利用购买记录作为我的藏品列表
 */
export interface MyCollectionItem {
  id: number;
  user_collection_id?: number | string;
  item_id: number;
  title: string;
  image: string;
  price: string;
  buy_time: number;
  buy_time_text: string;
  delivery_status: number;
  delivery_status_text: string;
  consignment_status: number;
  consignment_status_text: string;
  original_record?: PurchaseRecordItem;
  [key: string]: any;
}

export interface MyCollectionListData {
  list: MyCollectionItem[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  has_more: boolean;
  consignment_coupon?: number;
}

export interface GetMyCollectionParams extends GetPurchaseRecordsParams {}

export async function getMyCollection(
  params: GetMyCollectionParams = {},
): Promise<ApiResponse<MyCollectionListData>> {
  const response = await getPurchaseRecords(params);

  const mappedList: MyCollectionItem[] =
    response.data?.list?.map((record) => ({
      id: record.order_id,
      user_collection_id: record.order_id,
      item_id: record.item_id,
      title: record.item_title,
      image: record.item_image,
      price: String(record.price ?? record.total_amount ?? 0),
      buy_time: record.pay_time,
      buy_time_text: record.pay_time_text,
      delivery_status: 0,
      delivery_status_text: '未提货',
      consignment_status: 0,
      consignment_status_text: '未寄售',
      original_record: record,
    })) || [];

  return {
    ...response,
    data: {
      list: mappedList,
      total: response.data?.total ?? mappedList.length,
      per_page: response.data?.per_page ?? mappedList.length,
      current_page: response.data?.current_page ?? (params.page || 1),
      last_page: response.data?.last_page ?? 1,
      has_more: response.data?.has_more ?? false,
      consignment_coupon: response.data?.consignment_coupon ?? 0,
    },
  };
}

/**
 * 寄售商品列表
 * 对应后端: /collectionItem/consignmentList
 */
export interface ConsignmentItem {
  id: number;
  item_id: number;
  title: string;
  image: string;
  price: number;
  status: string;
  status_text: string;
  created_at?: string;
  [key: string]: any;
}

export interface ConsignmentListData {
  list: ConsignmentItem[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  has_more: boolean;
}

export interface GetConsignmentListParams {
  page?: number;
  limit?: number;
  token?: string;
}

export async function getConsignmentList(
  params: GetConsignmentListParams = {},
): Promise<ApiResponse<ConsignmentListData>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
  const page = params.page || 1;
  const limit = params.limit || 10;

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看寄售列表');
  }

  const search = new URLSearchParams();
  search.append('page', String(page));
  search.append('limit', String(limit));

  const path = `${API_ENDPOINTS.collectionItem.consignmentList}?${search.toString()}`;

  try {
    const data = await apiFetch<ConsignmentListData>(path, {
      method: 'GET',
      token,
    });
    console.log('获取寄售列表接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取寄售列表失败:', error);
    throw error;
  }
}

/**
 * 申请提货
 * 对应后端: /collectionItem/deliver
 */
export interface DeliverCollectionItemParams {
  user_collection_id: number | string;
  address_id?: number | string | null;
  token?: string;
}

export async function deliverCollectionItem(
  params: DeliverCollectionItemParams,
): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再申请提货');
  }

  if (!params.user_collection_id) {
    throw new Error('缺少用户藏品 ID');
  }

  const body = {
    user_collection_id: params.user_collection_id,
    address_id: params.address_id ?? null,
  };

  try {
    const data = await apiFetch(API_ENDPOINTS.collectionItem.deliver, {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    });
    console.log('申请提货接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('申请提货失败:', error);
    throw error;
  }
}

/**
 * 申请寄售
 * 对应后端: /collectionItem/consign
 */
export interface ConsignCollectionItemParams {
  user_collection_id: number | string;
  price: number;
  token?: string;
}

export async function consignCollectionItem(
  params: ConsignCollectionItemParams,
): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再申请寄售');
  }

  if (!params.user_collection_id) {
    throw new Error('缺少用户藏品 ID');
  }

  if (params.price === undefined || params.price === null || Number(params.price) <= 0) {
    throw new Error('请填写有效的寄售价格');
  }

  const body = {
    user_collection_id: params.user_collection_id,
    price: params.price,
  };

  try {
    const data = await apiFetch(API_ENDPOINTS.collectionItem.consign, {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    });
    console.log('申请寄售接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('申请寄售失败:', error);
    throw error;
  }
}

