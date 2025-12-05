import { ProfileResponse, PromotionCardData, TeamMembersListData } from '../types';

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
    /** 余额划转到服务费 */
    transferBalanceToServiceFee: '/Account/transferBalanceToServiceFee',
    /** 服务费明细 */
    serviceFeeLog: '/Account/serviceFeeLog',
    /** 服务费充值 */
    rechargeServiceFee: '/Account/rechargeServiceFee',
    /** 全部明细 */
    allLog: '/Account/allLog',
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
    /** 提交拓展提现申请 */
    submitStaticIncomeWithdraw: '/Recharge/submitStaticIncomeWithdraw',
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
    /** 购买商品（一步到位：创建订单并支付） */
    buy: '/shopOrder/buy',
    /** 待付款订单列表 */
    pendingPay: '/shopOrder/pendingPay',
    /** 待发货订单列表 */
    pendingShip: '/shopOrder/pendingShip',
    /** 待确认收货订单列表 */
    pendingConfirm: '/shopOrder/pendingConfirm',
    /** 已完成订单列表 */
    completed: '/shopOrder/completed',
    /** 确认收货 */
    confirm: '/shopOrder/confirm',
    /** 支付订单 */
    pay: '/shopOrder/pay',
    /** 订单详情 */
    detail: '/shopOrder/detail',
    /** 删除订单 */
    delete: '/shopOrder/delete',
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
    /** 交易商品原始详情（下架也可查看） */
    originalDetail: '/collectionItem/originalDetail',
    /** 购买藏品 */
    buy: '/collectionItem/buy',
    /** 获取购买记录列表 */
    purchaseRecords: '/collectionItem/purchaseRecords',
    /** 获取寄售商品列表 */
    consignmentList: '/collectionItem/consignmentList',
    /** 获取我的寄售列表 */
    myConsignmentList: '/collectionItem/myConsignmentList',
    /** 获取寄售详情 */
    consignmentDetail: '/collectionItem/consignmentDetail',
    /** 取消寄售 */
    cancelConsignment: '/collectionItem/cancelConsignment',
    /** 申请提货 */
    deliver: '/collectionItem/deliver',
    /** 申请寄售 */
    consign: '/collectionItem/consign',
    /** 提货订单列表 */
    deliveryList: '/collectionItem/deliveryList',
  },
  artist: {
    /** 艺术家列表 */
    index: '/artist/index',
    /** 艺术家详情 */
    detail: '/artist/detail',
    /** 艺术家作品详情 */
    workDetail: '/artist/workDetail',
    /** 全部艺术家作品列表 */
    allWorks: '/artist/allWorks',
  },
  signIn: {
    /** 获取签到活动规则 */
    rules: '/SignIn/rules',
    /** 获取签到信息 */
    info: '/SignIn/info',
    /** 执行签到 */
    do: '/SignIn/do',
    /** 获取签到记录 */
    records: '/SignIn/records',
    /** 获取提现进度 */
    progress: '/SignIn/progress',
  },
  team: {
    /** 获取推广卡信息 */
    promotionCard: '/Team/promotionCard',
    /** 获取团队成员列表 */
    members: '/Team/members',
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

export interface TransferBalanceToServiceFeeParams {
  amount: number | string;
  token?: string;
}

export interface TransferBalanceToServiceFeeResponse {
  balance_available: number;
  service_fee_balance: number;
}

/**
 * 余额划转到服务费
 * @param params 划转参数
 */
export async function transferBalanceToServiceFee(
  params: TransferBalanceToServiceFeeParams,
): Promise<ApiResponse<TransferBalanceToServiceFeeResponse>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再尝试划转');
  }

  if (!params.amount || Number(params.amount) <= 0) {
    throw new Error('请输入有效的划转金额');
  }

  try {
    const url = `${API_ENDPOINTS.account.transferBalanceToServiceFee}?amount=${params.amount}`;
    const data = await apiFetch<TransferBalanceToServiceFeeResponse>(url, {
      method: 'POST',
      token,
    });
    console.log('余额划转到服务费接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('余额划转到服务费失败:', error);
    throw error;
  }
}

/**
 * 服务费明细项
 */
export interface ServiceFeeLogItem {
  id: number;
  amount: number;
  before_service_fee: number;
  after_service_fee: number;
  remark: string;
  create_time: number;
}

/**
 * 服务费明细列表数据
 */
export interface ServiceFeeLogListData {
  list: ServiceFeeLogItem[];
  total: number;
  per_page: number;
  current_page: number;
}

/**
 * 获取服务费明细参数
 */
export interface GetServiceFeeLogParams {
  page?: number;
  limit?: number;
  token?: string;
}

/**
 * 获取服务费明细
 * @param params 查询参数
 */
export async function getServiceFeeLog(
  params: GetServiceFeeLogParams = {},
): Promise<ApiResponse<ServiceFeeLogListData>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
  const page = params.page || 1;
  const limit = params.limit || 10;

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看服务费明细');
  }

  const search = new URLSearchParams();
  search.append('page', String(page));
  search.append('limit', String(limit));

  const path = `${API_ENDPOINTS.account.serviceFeeLog}?${search.toString()}`;

  try {
    const data = await apiFetch<ServiceFeeLogListData>(path, {
      method: 'GET',
      token,
    });
    console.log('服务费明细接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取服务费明细失败:', error);
    throw error;
  }
}

/**
 * 服务费充值参数
 */
export interface RechargeServiceFeeParams {
  amount: number | string;
  remark?: string;
  /** 充值来源：不传或传空使用可用余额（balance_available），传 "withdrawable_money" 使用可提现金额 */
  source?: 'withdrawable_money' | '';
  token?: string;
}

/**
 * 服务费充值
 * @param params 充值参数
 */
export async function rechargeServiceFee(
  params: RechargeServiceFeeParams,
): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再尝试充值');
  }

  if (!params.amount || Number(params.amount) <= 0) {
    throw new Error('请输入有效的充值金额');
  }

  // 构建 URL 参数（兼容性）
  const search = new URLSearchParams();
  search.append('amount', String(params.amount));
  if (params.remark) {
    search.append('remark', params.remark);
  }

  const url = `${API_ENDPOINTS.account.rechargeServiceFee}?${search.toString()}`;

  // POST body 数据
  const payload: Record<string, any> = {
    amount: Number(params.amount),
  };

  if (params.source) {
    payload.source = params.source;
  }

  try {
    const data = await apiFetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      token,
    });
    console.log('服务费充值接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('服务费充值失败:', error);
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
 * 购买商品（一步到位：创建订单并支付）
 * 对应后端: /shopOrder/buy
 * 示例接口: http://18.166.211.131/index.php/api/shopOrder/buy
 */
export interface BuyShopOrderParams {
  items: CreateOrderItem[];
  pay_type: 'money' | 'score';
  address_id?: number | null;
  remark?: string;
  token?: string;
}

export async function buyShopOrder(
  params: BuyShopOrderParams,
): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再购买商品');
  }

  if (!params.items || params.items.length === 0) {
    throw new Error('请选择要购买的商品');
  }

  if (!params.pay_type) {
    throw new Error('请选择支付方式');
  }

  // 检查商品是否为实物商品，如果是实物商品，必须提供收货地址
  // 先获取第一个商品的详情来判断是否为实物商品
  let isPhysicalProduct = false;
  if (params.items && params.items.length > 0) {
    try {
      const firstProductId = params.items[0].product_id;
      const productDetailResponse = await fetchShopProductDetail(firstProductId);
      if (productDetailResponse.code === 1 && productDetailResponse.data) {
        // 检查是否为实物商品：is_physical === '1' 表示实物商品
        isPhysicalProduct = productDetailResponse.data.is_physical === '1';
      }
    } catch (error) {
      console.warn('获取商品详情失败，无法判断是否为实物商品:', error);
      // 如果获取失败，假设是实物商品，要求必须提供地址
      isPhysicalProduct = true;
    }
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
      // 如果是实物商品但没有获取到地址，抛出错误
      if (isPhysicalProduct) {
        throw new Error('实物商品必须填写收货地址，请先添加收货地址');
      }
      // 虚拟商品可以没有地址
      console.warn('获取默认收货地址失败，将使用 null:', error);
      addressId = null;
    }
  }

  // 如果是实物商品但没有地址ID，抛出错误
  if (isPhysicalProduct && (addressId === null || addressId === undefined)) {
    throw new Error('实物商品必须填写收货地址，请先添加收货地址');
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
    const data = await apiFetch(API_ENDPOINTS.shopOrder.buy, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      token,
    });
    console.log('购买商品接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('购买商品失败:', error);
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
 * 提交拓展提现申请参数
 */
export interface SubmitStaticIncomeWithdrawParams {
  /** 提现金额(元) */
  amount: number;
  /** 用户绑定的收款账户ID */
  payment_account_id: number;
  /** 支付密码 */
  pay_password: string;
  /** 提现备注 */
  remark?: string;
  token?: string;
}

/**
 * 提交拓展提现申请响应
 */
export interface SubmitStaticIncomeWithdrawResponse {
  withdraw_id: number;
  status: number;
  fee: number;
  actual_amount: number;
}

/**
 * 提交拓展提现申请
 * 对应后端: /Recharge/submitStaticIncomeWithdraw
 */
export async function submitStaticIncomeWithdraw(
  params: SubmitStaticIncomeWithdrawParams,
): Promise<ApiResponse<SubmitStaticIncomeWithdrawResponse>> {
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
    const data = await apiFetch<SubmitStaticIncomeWithdrawResponse>(
      API_ENDPOINTS.recharge.submitStaticIncomeWithdraw,
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
        token,
      },
    );
    console.log('提交拓展提现申请接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('提交拓展提现申请失败:', error);
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
  amount: number;
  before_balance: number;
  after_balance: number;
  remark: string;
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
 * 全部明细项
 */
export interface AllLogItem {
  id: number;
  type: 'balance_available' | 'withdrawable_money' | 'service_fee_balance' | 'score';
  amount: number;
  before_value: number;
  after_value: number;
  remark: string;
  create_time: number;
}

/**
 * 全部明细列表数据
 */
export interface AllLogData {
  list: AllLogItem[];
  total: number;
  per_page: number;
  current_page: number;
}

/**
 * 获取全部明细参数
 */
export interface GetAllLogParams {
  page?: number;
  limit?: number;
  /** 明细类型：all(全部), balance_available(可用余额), withdrawable_money(提现余额), service_fee_balance(服务费余额), score(积分) */
  type?: 'all' | 'balance_available' | 'withdrawable_money' | 'service_fee_balance' | 'score';
  token?: string;
}

/**
 * 获取全部明细
 * @param params 查询参数
 */
export async function getAllLog(
  params: GetAllLogParams = {},
): Promise<ApiResponse<AllLogData>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
  const page = params.page || 1;
  const limit = params.limit || 10;
  const type = params.type || 'all';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看明细');
  }

  const search = new URLSearchParams();
  search.append('page', String(page));
  search.append('limit', String(limit));
  search.append('type', type);

  const path = `${API_ENDPOINTS.account.allLog}?${search.toString()}`;

  try {
    const data = await apiFetch<AllLogData>(path, {
      method: 'GET',
      token,
    });
    console.log('获取全部明细接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取全部明细失败:', error);
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
  status_text?: string;
  sort?: number;
  create_time?: number;
  update_time?: number;
  [key: string]: any;
}

export interface CollectionItemOriginalDetailData
  extends CollectionItemDetailData {
  status_text?: string;
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
 * 获取交易商品原始详情（无论上下架状态均可查看）
 * 示例接口: http://18.166.211.131/index.php/api/collectionItem/originalDetail?id=1
 */
export async function fetchCollectionItemOriginalDetail(
  id: number | string,
): Promise<ApiResponse<CollectionItemOriginalDetailData>> {
  const search = new URLSearchParams();
  search.set('id', String(id));

  const path = `${API_ENDPOINTS.collectionItem.originalDetail}?${search.toString()}`;

  try {
    const data = await apiFetch<CollectionItemOriginalDetailData>(path, {
      method: 'GET',
    });
    console.log('交易商品原始详情接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取交易商品原始详情失败:', error);
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
  /** 寄售ID（寄售商品必填） */
  consignment_id?: number | string;
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
  if (params.consignment_id) {
    formData.append('consignment_id', String(params.consignment_id));
  }
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
  /** 主要状态文本（优先显示提货状态，如果已提货则显示提货订单状态，否则显示订单原始状态） */
  status_text: string;
  pay_type_text: string;
  /** 提货状态文本（如果已提货：待发货/待收货/已签收，如果未提货：空） */
  delivery_status?: string;
  /** 订单原始状态 */
  order_status?: string;
  /** 订单原始状态文本 */
  order_status_text?: string;
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
  /** 订单号 */
  order_no?: string;
  /** 提货状态：1=已提货，0=未提货 */
  delivery_status: number;
  /** 提货状态文本（如果已提货：待发货/待收货/已签收，如果未提货：未提货） */
  delivery_status_text: string;
  consignment_status: number;
  consignment_status_text: string;
  /** 订单原始状态 */
  order_status?: string;
  /** 订单原始状态文本 */
  order_status_text?: string;
  /** 主要状态文本（优先显示提货状态，如果已提货则显示提货订单状态，否则显示订单原始状态） */
  status_text?: string;
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
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  // 查询提货订单列表，用于匹配已提货的藏品
  let deliveryOrdersMap: Map<number | string, { status: string; status_text: string }> = new Map();
  try {
    // 查询所有状态的提货订单
    const deliveryResponse = await getDeliveryList({ page: 1, limit: 100, token });
    if (deliveryResponse.code === 1 && deliveryResponse.data?.list) {
      deliveryResponse.data.list.forEach((order: any) => {
        if (order.user_collection_id) {
          deliveryOrdersMap.set(order.user_collection_id, {
            status: order.status,
            status_text: order.status_text || (order.status === 'paid' ? '待发货' : order.status === 'shipped' ? '待收货' : '已签收'),
          });
        }
      });
    }
  } catch (error) {
    console.warn('查询提货订单列表失败，将使用API返回的delivery_status字段:', error);
  }

  const mappedList: MyCollectionItem[] =
    response.data?.list?.map((record) => {
      // 判断是否已提货：如果 delivery_status 字段存在且不为空，说明已提货
      // delivery_status 可能是字符串（如"待发货"、"待收货"、"已签收"）或数字（1=已提货，0=未提货）
      const deliveryStatusValue = record.delivery_status;
      
      // 检查 status_text 是否是提货状态（待发货/待收货/已签收）
      const statusText = record.status_text || '';
      const isDeliveryStatusText = statusText === '待发货' || statusText === '待收货' || statusText === '已签收';
      
      // 尝试从提货订单列表中查找
      const userCollectionId = (record as any).user_collection_id ?? 
                               (record as any).collection_id ?? 
                               (record as any).id ?? 
                               record.order_id;
      const deliveryOrder = deliveryOrdersMap.get(userCollectionId);
      
      // 如果 delivery_status 不为空，或者 status_text 是提货状态，或者找到提货订单，说明已提货
      const isDelivered = (deliveryStatusValue !== undefined && 
                         deliveryStatusValue !== null && 
                         deliveryStatusValue !== '' &&
                         (typeof deliveryStatusValue === 'string' 
                           ? deliveryStatusValue.trim() !== '' 
                           : deliveryStatusValue === 1)) || isDeliveryStatusText || !!deliveryOrder;
      
      // delivery_status 为数字类型时，1 表示已提货，0 表示未提货
      // 如果是字符串类型，说明已提货（包含提货状态文本）
      const deliveryStatusNum = typeof deliveryStatusValue === 'number' 
        ? deliveryStatusValue 
        : (isDelivered ? 1 : 0);
      
      // 提货状态文本：如果已提货，优先使用 delivery_status，然后使用提货订单状态，最后使用 status_text（如果是提货状态），否则显示"未提货"
      let deliveryStatusText = '未提货';
      if (isDelivered) {
        if (typeof deliveryStatusValue === 'string' && deliveryStatusValue.trim() !== '') {
          deliveryStatusText = deliveryStatusValue.trim();
        } else if (deliveryOrder) {
          // 使用提货订单的状态文本
          deliveryStatusText = deliveryOrder.status_text;
        } else if (isDeliveryStatusText) {
          deliveryStatusText = statusText;
        } else {
          deliveryStatusText = record.status_text || '已提货';
        }
      }
      
      return {
        id: record.order_id,
        // 优先使用响应中的 user_collection_id，如果没有则尝试从其他字段获取
        user_collection_id: (record as any).user_collection_id ?? 
                           (record as any).collection_id ?? 
                           (record as any).id ?? 
                           record.order_id,
        item_id: record.item_id,
        title: record.item_title,
        image: record.item_image,
        price: String(record.price ?? record.total_amount ?? 0),
        buy_time: record.pay_time,
        buy_time_text: record.pay_time_text,
        order_no: record.order_no,
        // 提货状态：1=已提货，0=未提货
        delivery_status: deliveryStatusNum,
        // 提货状态文本：如果已提货，使用 delivery_status（待发货/待收货/已签收），否则显示"未提货"
        delivery_status_text: deliveryStatusText,
        // 寄售状态：处理空字符串、null、undefined、字符串状态等情况，统一映射为数字
        // 0=未寄售，1=待审核，2=寄售中，3=寄售失败，4=已售出
        consignment_status: (() => {
          const status = (record as any).consignment_status;
          if (status === '' || status === null || status === undefined) {
            return 0;
          }
          if (typeof status === 'number') {
            return status;
          }
          // 处理字符串状态
          if (typeof status === 'string') {
            const statusStr = status.trim();
            if (statusStr === '未寄售' || statusStr === '') {
              return 0;
            } else if (statusStr === '待审核') {
              return 1;
            } else if (statusStr === '寄售中') {
              return 2;
            } else if (statusStr === '寄售失败') {
              return 3;
            } else if (statusStr === '已售出') {
              return 4;
            }
            // 如果是不认识的字符串，但有值，默认返回 2（寄售中）
            return 2;
          }
          return 0;
        })(),
        // 寄售状态文本：优先使用 consignment_status（如果是字符串），否则使用 consignment_status_text
        consignment_status_text: (() => {
          const status = (record as any).consignment_status;
          const statusText = (record as any).consignment_status_text;
          // 如果 consignment_status 是字符串，直接使用
          if (typeof status === 'string' && status.trim() !== '') {
            return status.trim();
          }
          // 否则使用 consignment_status_text
          return statusText ?? '未寄售';
        })(),
        // 保存订单原始状态信息
        order_status: record.order_status ?? record.status,
        // 如果未提货，order_status_text 应该保存订单原始状态；如果已提货，保存订单原始状态（如果有）
        order_status_text: record.order_status_text ?? (isDelivered ? undefined : record.status_text),
        // 保存主要状态文本（API 已优先显示提货状态，如果已提货则显示提货状态，否则显示订单状态）
        // 如果已提货，status_text 是提货状态；如果未提货，status_text 是订单状态
        status_text: record.status_text,
        original_record: record,
      };
    }) || [];

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

  const search = new URLSearchParams();
  search.append('page', String(page));
  search.append('limit', String(limit));

  const path = `${API_ENDPOINTS.collectionItem.consignmentList}?${search.toString()}`;

  try {
    const data = await apiFetch<ConsignmentListData>(path, {
      method: 'GET',
      token: token || undefined,
    });
    console.log('获取寄售列表接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取寄售列表失败:', error);
    throw error;
  }
}

/**
 * 获取我的寄售列表
 * 对应后端: /collectionItem/myConsignmentList
 * 示例接口: http://18.166.211.131/index.php/api/collectionItem/myConsignmentList?page=1&limit=10&status=0
 */
export interface MyConsignmentItem {
  consignment_id: number;
  user_id: number;
  user_collection_id: number;
  item_id: number;
  consignment_price: number;
  consignment_status: number;
  create_time: number;
  update_time: number;
  title: string;
  image: string;
  original_price: number;
  session_id: number;
  user_collection_status: number;
  consignment_status_text: string;
  create_time_text: string;
  update_time_text: string;
  days_passed: number;
  can_force_delivery: boolean;
}

export interface MyConsignmentListData {
  list: MyConsignmentItem[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  has_more: boolean;
}

export interface GetMyConsignmentListParams {
  page?: number;
  limit?: number;
  /** 寄售状态: 0=全部, 1=寄售中, 2=已售出, 3=已取消 */
  status?: number;
  token?: string;
}

export async function getMyConsignmentList(
  params: GetMyConsignmentListParams = {},
): Promise<ApiResponse<MyConsignmentListData>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
  const page = params.page || 1;
  const limit = params.limit || 10;
  const status = params.status !== undefined ? params.status : 0;

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看我的寄售列表');
  }

  const search = new URLSearchParams();
  search.append('page', String(page));
  search.append('limit', String(limit));
  if (status !== undefined) {
    search.append('status', String(status));
  }

  const path = `${API_ENDPOINTS.collectionItem.myConsignmentList}?${search.toString()}`;

  try {
    const data = await apiFetch<MyConsignmentListData>(path, {
      method: 'GET',
      token,
    });
    return data;
  } catch (error: any) {
    console.error('获取我的寄售列表失败:', error);
    throw error;
  }
}

/**
 * 获取寄售详情
 * 对应后端: /collectionItem/consignmentDetail
 * 示例接口: http://18.166.211.131/index.php/api/collectionItem/consignmentDetail?consignment_id=1
 */
export interface ConsignmentDetailData extends MyConsignmentItem {
  description: string;
  artist: string;
  delivery_status: number;
  remaining_days: number;
  /** 买家用户ID（仅已售出时有值） */
  buyer_id?: number;
  /** 买家用户名（仅已售出时有值） */
  buyer_username?: string;
  /** 买家昵称（仅已售出时有值） */
  buyer_nickname?: string;
  /** 买家手机号（仅已售出时有值） */
  buyer_mobile?: string;
}

export interface GetConsignmentDetailParams {
  consignment_id: number;
  token?: string;
}

export async function getConsignmentDetail(
  params: GetConsignmentDetailParams,
): Promise<ApiResponse<ConsignmentDetailData>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看寄售详情');
  }

  if (!params.consignment_id) {
    throw new Error('缺少寄售记录ID');
  }

  const search = new URLSearchParams();
  search.append('consignment_id', String(params.consignment_id));

  const path = `${API_ENDPOINTS.collectionItem.consignmentDetail}?${search.toString()}`;

  try {
    const data = await apiFetch<ConsignmentDetailData>(path, {
      method: 'GET',
      token,
    });
    return data;
  } catch (error: any) {
    console.error('获取寄售详情失败:', error);
    throw error;
  }
}

/**
 * 取消寄售
 * 对应后端: /collectionItem/cancelConsignment
 * 示例接口: http://18.166.211.131/index.php/api/collectionItem/cancelConsignment
 */
export interface CancelConsignmentParams {
  consignment_id: number;
  token?: string;
}

export async function cancelConsignment(
  params: CancelConsignmentParams,
): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再取消寄售');
  }

  if (!params.consignment_id) {
    throw new Error('缺少寄售记录ID');
  }

  try {
    const data = await apiFetch(API_ENDPOINTS.collectionItem.cancelConsignment, {
      method: 'POST',
      token,
      body: JSON.stringify({
        consignment_id: params.consignment_id,
      }),
    });
    return data;
  } catch (error: any) {
    console.error('取消寄售失败:', error);
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

  // 如果 address_id 为 null，尝试获取默认收货地址
  let addressId = params.address_id ?? null;
  
  if (!addressId || addressId === null) {
    try {
      const defaultAddressResponse = await fetchDefaultAddress(token);
      if (defaultAddressResponse.code === 1 && defaultAddressResponse.data?.id) {
        addressId = typeof defaultAddressResponse.data.id === 'string' 
          ? parseInt(defaultAddressResponse.data.id, 10) 
          : defaultAddressResponse.data.id;
      }
    } catch (error) {
      // 如果没有默认地址，抛出错误提示用户
      throw new Error('请先选择收货地址');
    }
    
    // 再次检查，如果仍然没有地址ID，抛出错误
    if (!addressId || addressId === null) {
      throw new Error('请先选择收货地址');
    }
  }

  const body = {
    user_collection_id: params.user_collection_id,
    address_id: addressId,
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

/**
 * 获取提货订单列表
 * 对应后端: /collectionItem/deliveryList
 * 订单状态: paid=待发货, shipped=已发货, completed=已完成
 */
export interface GetDeliveryListParams {
  page?: number;
  limit?: number;
  status?: 'paid' | 'shipped' | 'completed';
  token?: string;
}

export interface DeliveryOrderItem {
  id: number;
  order_no: string;
  user_id: number;
  total_amount: number;
  total_score: number;
  pay_type: 'money' | 'score';
  status: 'paid' | 'shipped' | 'completed';
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  shipping_no: string;
  shipping_company: string;
  remark: string;
  admin_remark: string;
  pay_time: number;
  ship_time: number;
  complete_time: number;
  create_time: number;
  update_time: number;
  user_collection_id: number;
  collection_title: string;
  collection_image: string;
  collection_item_id: number;
  status_text: string;
  pay_time_text: string;
  ship_time_text: string;
  complete_time_text: string;
}

export interface DeliveryListData {
  list: DeliveryOrderItem[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  has_more: boolean;
}

export async function getDeliveryList(
  params: GetDeliveryListParams = {},
): Promise<ApiResponse<ShopOrderListData>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
  const page = params.page || 1;
  const limit = params.limit || 10;

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看提货订单');
  }

  const search = new URLSearchParams();
  search.set('page', String(page));
  search.set('limit', String(limit));
  if (params.status) {
    search.set('status', params.status);
  }

  const path = `${API_ENDPOINTS.collectionItem.deliveryList}?${search.toString()}`;

  try {
    const response = await apiFetch<DeliveryListData>(path, {
      method: 'GET',
      token,
    });
    console.log('提货订单列表接口原始响应:', response);

    // Map delivery orders to ShopOrderItem format
    const mappedList: ShopOrderItem[] =
      response.data?.list?.map((item) => ({
        id: item.id,
        order_no: item.order_no,
        user_id: item.user_id,
        total_amount: item.total_amount,
        total_score: item.total_score,
        pay_type: item.pay_type,
        status: item.status,
        recipient_name: item.recipient_name,
        recipient_phone: item.recipient_phone,
        recipient_address: item.recipient_address,
        shipping_no: item.shipping_no,
        shipping_company: item.shipping_company,
        remark: item.remark,
        admin_remark: item.admin_remark,
        pay_time: item.pay_time,
        ship_time: item.ship_time,
        complete_time: item.complete_time,
        create_time: item.create_time,
        update_time: item.update_time,
        status_text: item.status_text,
        pay_time_text: item.pay_time_text,
        ship_time_text: item.ship_time_text,
        complete_time_text: item.complete_time_text,
        // Map collection fields to product fields for compatibility
        product_name: item.collection_title,
        product_image: item.collection_image,
        thumbnail: item.collection_image,
        quantity: 1,
        // Store original delivery-specific fields
        user_collection_id: item.user_collection_id,
        collection_title: item.collection_title,
        collection_image: item.collection_image,
        collection_item_id: item.collection_item_id,
      })) || [];

    return {
      ...response,
      data: {
        list: mappedList,
        total: response.data?.total ?? mappedList.length,
        page: response.data?.current_page ?? page,
        limit: response.data?.per_page ?? limit,
      },
    };
  } catch (error: any) {
    console.error('获取提货订单列表失败:', error);
    throw error;
  }
}

/**
 * 艺术家相关接口
 * 对应后端:
 * - 列表: /artist/index?page=1&limit=10
 * - 详情: /artist/detail?id=1
 * - 作品详情: /artist/workDetail?id=1
 */

export interface ArtistApiItem {
  id: number;
  name: string;
  image: string;
  title?: string;
  bio?: string;
  [key: string]: any;
}

export interface ArtistListData {
  list: ArtistApiItem[];
  total: number;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export interface FetchArtistsParams {
  page?: number;
  limit?: number;
}

/**
 * 获取艺术家列表
 * 示例: /artist/index?page=1&limit=10
 */
export async function fetchArtists(
  params: FetchArtistsParams = {},
): Promise<ApiResponse<ArtistListData>> {
  const { page = 1, limit = 10 } = params;
  const search = new URLSearchParams();
  search.set('page', String(page));
  search.set('limit', String(Math.min(limit, 50)));

  const path = `${API_ENDPOINTS.artist.index}?${search.toString()}`;

  try {
    const data = await apiFetch<ArtistListData>(path, {
      method: 'GET',
    });
    console.log('艺术家列表接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取艺术家列表失败:', error);
    throw error;
  }
}

export interface ArtistWorkItem {
  id: number;
  artist_id: number;
  title: string;
  image: string;
  description?: string;
  sort?: number;
  status?: string;
  [key: string]: any;
}

export interface ArtistDetailData extends ArtistApiItem {
  works?: ArtistWorkItem[];
}

export interface ArtistAllWorkItem {
  id: number;
  artist_id: number;
  artist_name: string;
  artist_title?: string;
  title: string;
  image: string;
  description?: string;
  [key: string]: any;
}

export interface ArtistAllWorksListData {
  list: ArtistAllWorkItem[];
  total: number;
  page?: number;
  limit?: number;
  [key: string]: any;
}

/**
 * 获取艺术家详情
 * 示例: /artist/detail?id=1
 */
export async function fetchArtistDetail(
  id: number | string,
): Promise<ApiResponse<ArtistDetailData>> {
  const search = new URLSearchParams();
  search.set('id', String(id));

  const path = `${API_ENDPOINTS.artist.detail}?${search.toString()}`;

  try {
    const data = await apiFetch<ArtistDetailData>(path, {
      method: 'GET',
    });
    console.log('艺术家详情接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取艺术家详情失败:', error);
    throw error;
  }
}

/**
 * 获取艺术家作品详情
 * 示例: /artist/workDetail?id=1
 */
export async function fetchArtistWorkDetail(
  id: number | string,
): Promise<ApiResponse<ArtistWorkItem>> {
  const search = new URLSearchParams();
  search.set('id', String(id));

  const path = `${API_ENDPOINTS.artist.workDetail}?${search.toString()}`;

  try {
    const data = await apiFetch<ArtistWorkItem>(path, {
      method: 'GET',
    });
    console.log('艺术家作品详情接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取艺术家作品详情失败:', error);
    throw error;
  }
}

/**
 * 获取全部艺术家作品列表
 * 示例: /artist/allWorks?page=1&limit=10
 */
export interface FetchArtistAllWorksParams {
  page?: number;
  limit?: number;
}

export async function fetchArtistAllWorks(
  params: FetchArtistAllWorksParams = {},
): Promise<ApiResponse<ArtistAllWorksListData>> {
  const { page = 1, limit = 20 } = params;
  const search = new URLSearchParams();
  search.set('page', String(page));
  search.set('limit', String(Math.min(limit, 50)));

  const path = `${API_ENDPOINTS.artist.allWorks}?${search.toString()}`;

  try {
    const data = await apiFetch<ArtistAllWorksListData>(path, {
      method: 'GET',
    });
    console.log('全部艺术家作品列表接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取全部艺术家作品列表失败:', error);
    throw error;
  }
}

/**
 * 积分订单相关接口
 * 对应后端:
 * - 待付款: /shopOrder/pendingPay
 * - 待发货: /shopOrder/pendingShip
 * - 待确认收货: /shopOrder/pendingConfirm
 * - 已完成: /shopOrder/completed
 * - 确认收货: /shopOrder/confirm
 */

export interface ShopOrderItemDetail {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_thumbnail: string;
  price: number;
  score_price: number;
  quantity: number;
  subtotal: number;
  subtotal_score: number;
  create_time: number;
  is_physical: string;
  is_card_product: string;
  [key: string]: any;
}

export interface ShopOrderItem {
  id: number | string;
  order_no?: string;
  user_id?: number;
  total_amount?: number | string;
  total_score?: number | string;
  pay_type?: 'money' | 'score' | string;
  status?: number | string;
  recipient_name?: string;
  recipient_phone?: string;
  recipient_address?: string;
  shipping_no?: string;
  shipping_company?: string;
  remark?: string;
  admin_remark?: string;
  pay_time?: number | string;
  ship_time?: number | string;
  complete_time?: number | string;
  create_time?: number | string;
  update_time?: number | string;
  items?: ShopOrderItemDetail[];
  product_type?: string;
  product_type_text?: string;
  status_text?: string;
  pay_type_text?: string;
  create_time_text?: string;
  pay_time_text?: string;
  ship_time_text?: string;
  complete_time_text?: string;
  // Legacy fields for backward compatibility
  product_id?: number;
  product_name?: string;
  product_image?: string;
  thumbnail?: string;
  quantity?: number;
  price?: number | string;
  [key: string]: any;
}

export interface ShopOrderListData {
  list: ShopOrderItem[];
  total: number;
  page: number;
  limit: number;
  [key: string]: any;
}

export interface FetchShopOrdersParams {
  page?: number;
  limit?: number;
  token?: string;
}

/**
 * 获取待付款订单列表
 * 示例接口: http://18.166.211.131/index.php/api/shopOrder/pendingPay?page=1&limit=10
 */
export async function fetchPendingPayOrders(
  params: FetchShopOrdersParams = {},
): Promise<ApiResponse<ShopOrderListData>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
  const page = params.page || 1;
  const limit = params.limit || 10;

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看订单');
  }

  const search = new URLSearchParams();
  search.append('page', String(page));
  search.append('limit', String(limit));

  const path = `${API_ENDPOINTS.shopOrder.pendingPay}?${search.toString()}`;

  try {
    const data = await apiFetch<ShopOrderListData>(path, {
      method: 'GET',
      token,
    });
    console.log('获取待付款订单列表接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取待付款订单列表失败:', error);
    throw error;
  }
}

/**
 * 获取待发货订单列表
 * 示例接口: http://18.166.211.131/index.php/api/shopOrder/pendingShip?page=1&limit=10
 */
export async function fetchPendingShipOrders(
  params: FetchShopOrdersParams = {},
): Promise<ApiResponse<ShopOrderListData>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
  const page = params.page || 1;
  const limit = params.limit || 10;

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看订单');
  }

  const search = new URLSearchParams();
  search.append('page', String(page));
  search.append('limit', String(limit));

  const path = `${API_ENDPOINTS.shopOrder.pendingShip}?${search.toString()}`;

  try {
    const data = await apiFetch<ShopOrderListData>(path, {
      method: 'GET',
      token,
    });
    console.log('获取待发货订单列表接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取待发货订单列表失败:', error);
    throw error;
  }
}

/**
 * 获取待确认收货订单列表
 * 示例接口: http://18.166.211.131/index.php/api/shopOrder/pendingConfirm?page=1&limit=10
 */
export async function fetchPendingConfirmOrders(
  params: FetchShopOrdersParams = {},
): Promise<ApiResponse<ShopOrderListData>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
  const page = params.page || 1;
  const limit = params.limit || 10;

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看订单');
  }

  const search = new URLSearchParams();
  search.append('page', String(page));
  search.append('limit', String(limit));

  const path = `${API_ENDPOINTS.shopOrder.pendingConfirm}?${search.toString()}`;

  try {
    const data = await apiFetch<ShopOrderListData>(path, {
      method: 'GET',
      token,
    });
    console.log('获取待确认收货订单列表接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取待确认收货订单列表失败:', error);
    throw error;
  }
}

/**
 * 获取已完成订单列表
 * 示例接口: http://18.166.211.131/index.php/api/shopOrder/completed?page=1&limit=10
 */
export async function fetchCompletedOrders(
  params: FetchShopOrdersParams = {},
): Promise<ApiResponse<ShopOrderListData>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
  const page = params.page || 1;
  const limit = params.limit || 10;

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看订单');
  }

  const search = new URLSearchParams();
  search.append('page', String(page));
  search.append('limit', String(limit));

  const path = `${API_ENDPOINTS.shopOrder.completed}?${search.toString()}`;

  try {
    const data = await apiFetch<ShopOrderListData>(path, {
      method: 'GET',
      token,
    });
    console.log('获取已完成订单列表接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取已完成订单列表失败:', error);
    throw error;
  }
}

/**
 * 确认收货
 * 对应后端: /shopOrder/confirm
 * 示例接口: http://18.166.211.131/index.php/api/shopOrder/confirm
 */
export interface ConfirmOrderParams {
  id: number | string | null;
  token?: string;
}

export async function confirmOrder(
  params: ConfirmOrderParams,
): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再确认收货');
  }

  if (params.id === null || params.id === undefined || params.id === '') {
    throw new Error('缺少订单ID');
  }

  const body = {
    id: params.id,
  };

  try {
    const data = await apiFetch(API_ENDPOINTS.shopOrder.confirm, {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    });
    console.log('确认收货接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('确认收货失败:', error);
    throw error;
  }
}

/**
 * 获取订单详情
 * 对应后端: /shopOrder/detail
 * 示例接口: http://18.166.211.131/index.php/api/shopOrder/detail?id=31
 */
export interface GetOrderDetailParams {
  id: number | string;
  token?: string;
}

export async function getOrderDetail(
  params: GetOrderDetailParams,
): Promise<ApiResponse<ShopOrderItem>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看订单详情');
  }

  if (params.id === null || params.id === undefined || params.id === '') {
    throw new Error('缺少订单ID');
  }

  const search = new URLSearchParams();
  search.append('id', String(params.id));

  const path = `${API_ENDPOINTS.shopOrder.detail}?${search.toString()}`;

  try {
    const data = await apiFetch<ShopOrderItem>(path, {
      method: 'GET',
      token,
    });
    console.log('获取订单详情接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取订单详情失败:', error);
    throw error;
  }
}

/**
 * 支付订单
 * 对应后端: /shopOrder/buy
 * 示例接口: http://18.166.211.131/index.php/api/shopOrder/buy
 * 
 * 注意：此接口需要订单的完整信息（items, pay_type等），
 * 如果只提供订单ID，需要先获取订单详情
 */
export interface PayOrderParams {
  id: number | string;
  token?: string;
}

export async function payOrder(
  params: PayOrderParams,
): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再支付订单');
  }

  if (params.id === null || params.id === undefined || params.id === '') {
    throw new Error('缺少订单ID');
  }

  // 由于 /shopOrder/buy 需要完整的订单信息，先获取订单详情
  try {
    const orderDetailResponse = await getOrderDetail({ id: params.id, token });
    
    if (orderDetailResponse.code !== 1 || !orderDetailResponse.data) {
      throw new Error(orderDetailResponse.msg || '获取订单详情失败');
    }

    const order = orderDetailResponse.data;

    // 构建 buy 接口需要的参数
    if (!order.items || order.items.length === 0) {
      throw new Error('订单中没有商品信息');
    }

    // 判断是否为实物商品
    const isPhysicalProduct = order.product_type === 'physical' || 
                             (order.items && order.items.some(item => item.is_physical === '1'));

    // 获取地址ID：如果订单有收货地址信息，说明创建时已有地址，尝试从订单中获取或使用默认地址
    // 注意：订单详情可能不包含 address_id 字段，需要从收货地址信息推断或使用默认地址
    let addressId = (order as any).address_id || null;
    
    if (isPhysicalProduct && (!addressId || addressId === null)) {
      try {
        const defaultAddressResponse = await fetchDefaultAddress(token);
        if (defaultAddressResponse.code === 1 && defaultAddressResponse.data?.id) {
          addressId = typeof defaultAddressResponse.data.id === 'string' 
            ? parseInt(defaultAddressResponse.data.id, 10) 
            : defaultAddressResponse.data.id;
        }
      } catch (error) {
        // 如果是实物商品但没有地址，抛出错误
        throw new Error('实物商品必须填写收货地址，请先添加收货地址');
      }
      
      // 再次检查，如果是实物商品但仍然没有地址ID，抛出错误
      if (!addressId || addressId === null) {
        throw new Error('实物商品必须填写收货地址，请先添加收货地址');
      }
    }

    const requestBody = {
      items: order.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      pay_type: order.pay_type || 'score',
      address_id: addressId ?? null,
      remark: order.remark || '',
    };

    const data = await apiFetch(API_ENDPOINTS.shopOrder.buy, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      token,
    });
    console.log('支付订单接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('支付订单失败:', error);
    throw error;
  }
}

/**
 * 删除订单
 * 对应后端: /shopOrder/delete
 * 示例接口: http://18.166.211.131/index.php/api/shopOrder/delete
 */
export interface DeleteOrderParams {
  id: number | string;
  token?: string;
}

export async function deleteOrder(
  params: DeleteOrderParams,
): Promise<ApiResponse> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再删除订单');
  }

  if (params.id === null || params.id === undefined || params.id === '') {
    throw new Error('缺少订单ID');
  }

  const formData = new FormData();
  formData.append('order_id', String(params.id));

  try {
    const data = await apiFetch(API_ENDPOINTS.shopOrder.delete, {
      method: 'POST',
      body: formData,
      token,
    });
    console.log('删除订单接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('删除订单失败:', error);
    throw error;
  }
}

/**
 * 签到相关接口
 * 对应后端:
 * - 活动规则: /SignIn/rules
 * - 签到信息: /SignIn/info
 * - 执行签到: /SignIn/do
 * - 签到记录: /SignIn/records
 */

/**
 * 签到活动配置
 */
export interface SignInConfig {
  daily_reward: number;
  referrer_reward: number;
  calendar_range_months: number;
  calendar_start: string;
  calendar_end: string;
}

/**
 * 签到活动信息
 */
export interface SignInActivity {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  register_reward: number;
  sign_reward_min: number;
  sign_reward_max: number;
  invite_reward_min: number;
  invite_reward_max: number;
  withdraw_min_amount: number;
  withdraw_daily_limit: number;
  withdraw_audit_hours: number;
}

/**
 * 签到规则项
 */
export interface SignInRule {
  key: string;
  title: string;
  description: string;
}

/**
 * 签到规则数据
 */
export interface SignInRulesData {
  config: SignInConfig;
  activity: SignInActivity;
  rules: SignInRule[];
}

/**
 * 获取签到活动规则
 * 示例接口: http://18.166.211.131/index.php/api/SignIn/rules
 */
export async function fetchSignInRules(): Promise<ApiResponse<SignInRulesData>> {
  try {
    const data = await apiFetch<SignInRulesData>(API_ENDPOINTS.signIn.rules, {
      method: 'GET',
    });
    console.log('获取签到规则接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取签到规则失败:', error);
    throw error;
  }
}

/**
 * 签到日历数据
 */
export interface SignInCalendar {
  start: string;
  end: string;
  signed_dates: string[];
  records: Array<{
    date: string;
    reward_score: number;
    record_id: number;
  }>;
}

/**
 * 签到记录项
 */
export interface SignInRecordItem {
  id: number;
  sign_date: string;
  reward_score: number;
  reward_money: number;
  reward_type: string;
  create_time: number;
  config?: {
    daily_reward: number;
    referrer_reward: number;
  };
}

/**
 * 签到信息数据
 */
export interface SignInInfoData {
  today_signed: boolean;
  today_reward: number;
  daily_reward: number;
  total_reward: number;
  sign_days: number;
  streak: number;
  calendar: SignInCalendar;
  recent_records: SignInRecordItem[];
  config: {
    daily_reward: number;
    referrer_reward: number;
  };
  activity: SignInActivity;
  reward_type: string;
}

/**
 * 获取签到信息
 * 示例接口: http://18.166.211.131/index.php/api/SignIn/info
 */
export async function fetchSignInInfo(
  token: string = localStorage.getItem(AUTH_TOKEN_KEY) || '',
): Promise<ApiResponse<SignInInfoData>> {
  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看签到信息');
  }

  try {
    const data = await apiFetch<SignInInfoData>(API_ENDPOINTS.signIn.info, {
      method: 'GET',
      token,
    });
    console.log('获取签到信息接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取签到信息失败:', error);
    throw error;
  }
}

/**
 * 执行签到响应数据
 */
export interface SignInDoData extends SignInInfoData {
  sign_record_id: number;
  sign_date: string;
  referrer_reward: number;
  message: string;
}

/**
 * 执行签到
 * 示例接口: http://18.166.211.131/index.php/api/SignIn/do
 */
export async function doSignIn(
  token: string = localStorage.getItem(AUTH_TOKEN_KEY) || '',
): Promise<ApiResponse<SignInDoData>> {
  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再签到');
  }

  try {
    const data = await apiFetch<SignInDoData>(API_ENDPOINTS.signIn.do, {
      method: 'POST',
      body: JSON.stringify({}),
      token,
    });
    console.log('执行签到接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('执行签到失败:', error);
    throw error;
  }
}

/**
 * 签到记录列表数据
 */
export interface SignInRecordsData {
  total: number;
  page: number;
  page_size: number;
  total_score: number;
  total_money: number;
  is_today_signed: boolean;
  lucky_draw_info?: {
    current_draw_count: number;
    daily_limit: number;
    used_today: number;
    remaining_count: number;
  };
  lucky_draw_rules?: string;
  records: SignInRecordItem[];
}

/**
 * 获取签到记录
 * 示例接口: http://18.166.211.131/index.php/api/SignIn/records
 */
export interface GetSignInRecordsParams {
  page?: number;
  limit?: number;
  token?: string;
}

export async function getSignInRecords(
  params: GetSignInRecordsParams = {},
): Promise<ApiResponse<SignInRecordsData>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
  const page = params.page || 1;
  const limit = params.limit || 10;

  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看签到记录');
  }

  try {
    const data = await apiFetch<SignInRecordsData>(API_ENDPOINTS.signIn.records, {
      method: 'POST',
      body: JSON.stringify({}),
      token,
    });
    console.log('获取签到记录接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取签到记录失败:', error);
    throw error;
  }
}

/**
 * 签到提现进度数据
 */
export interface SignInProgressData {
  withdrawable_money: number;
  withdraw_min_amount: number;
  progress: number;
  remaining_amount: number;
  can_withdraw: boolean;
  total_money: number;
  activity: {
    id: number;
    name: string;
    withdraw_min_amount: number;
    withdraw_daily_limit: number;
    withdraw_audit_hours: number;
  };
}

/**
 * 获取签到提现进度
 * 示例接口: http://18.166.211.131/index.php/api/SignIn/progress
 */
export async function fetchSignInProgress(
  token: string = localStorage.getItem(AUTH_TOKEN_KEY) || '',
): Promise<ApiResponse<SignInProgressData>> {
  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看提现进度');
  }

  try {
    const data = await apiFetch<SignInProgressData>(API_ENDPOINTS.signIn.progress, {
      method: 'GET',
      token,
    });
    console.log('获取签到提现进度接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取签到提现进度失败:', error);
    throw error;
  }
}

/**
 * 获取推广卡信息
 * @param token 用户 Token
 */
export async function fetchPromotionCard(
  token: string = localStorage.getItem(AUTH_TOKEN_KEY) || '',
): Promise<ApiResponse<PromotionCardData>> {
  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看推广卡');
  }

  try {
    const data = await apiFetch<PromotionCardData>(API_ENDPOINTS.team.promotionCard, {
      method: 'GET',
      token,
    });
    console.log('获取推广卡信息接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取推广卡信息失败:', error);
    throw error;
  }
}

export interface FetchTeamMembersParams {
  page?: number;
  page_size?: number;
  token?: string;
}

/**
 * 获取团队成员列表
 * @param params 查询参数
 */
export async function fetchTeamMembers(
  params: FetchTeamMembersParams = {},
): Promise<ApiResponse<TeamMembersListData>> {
  const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
  if (!token) {
    throw new Error('未找到用户登录信息，请先登录后再查看团队成员');
  }

  const page = params.page || 1;
  const page_size = params.page_size || 10;

  const search = new URLSearchParams();
  search.set('page', String(page));
  search.set('page_size', String(page_size));

  const path = `${API_ENDPOINTS.team.members}?${search.toString()}`;

  try {
    const data = await apiFetch<TeamMembersListData>(path, {
      method: 'GET',
      token,
    });
    console.log('获取团队成员列表接口原始响应:', data);
    return data;
  } catch (error: any) {
    console.error('获取团队成员列表失败:', error);
    throw error;
  }
}

