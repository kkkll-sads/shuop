import { apiFetch, ApiResponse } from './networking';
import { API_ENDPOINTS, AUTH_TOKEN_KEY } from './config';
import { fetchDefaultAddress } from './user';


// 商品相关
export interface ShopProductItem {
    id: number;
    name: string;
    thumbnail: string;
    category: string;
    price: number;
    score_price: number;
    stock: number;
    sales: number;
    purchase_type: string;
    is_physical: string;
    [key: string]: any;
}

export interface ShopProductListData {
    list: ShopProductItem[];
    total: number;
    page: number;
    limit: number;
}

export interface FetchShopProductsParams {
    page?: number;
    limit?: number;
}

export async function fetchShopProducts(params: FetchShopProductsParams = {}): Promise<ApiResponse<ShopProductListData>> {
    const search = new URLSearchParams();
    if (params.page !== undefined) search.set('page', String(params.page));
    if (params.limit !== undefined) search.set('limit', String(params.limit));

    const path = `${API_ENDPOINTS.shopProduct.list}?${search.toString()}`;
    return apiFetch<ShopProductListData>(path, {
        method: 'GET',
    });
}

export interface ShopProductDetailData extends ShopProductItem {
    images?: string[];
    description?: string;
}

export async function fetchShopProductDetail(id: number | string): Promise<ApiResponse<ShopProductDetailData>> {
    const path = `${API_ENDPOINTS.shopProduct.detail}?id=${id}`;
    return apiFetch<ShopProductDetailData>(path, {
        method: 'GET',
    });
}

export interface ShopProductCategoriesData {
    list: string[];
}

export async function fetchShopProductCategories(): Promise<ApiResponse<ShopProductCategoriesData>> {
    return apiFetch<ShopProductCategoriesData>(API_ENDPOINTS.shopProduct.categories, {
        method: 'GET',
    });
}

export async function fetchShopProductsBySales(params: FetchShopProductsParams = {}): Promise<ApiResponse<ShopProductListData>> {
    const search = new URLSearchParams();
    if (params.page !== undefined) search.set('page', String(params.page));
    if (params.limit !== undefined) search.set('limit', String(params.limit));

    const path = `${API_ENDPOINTS.shopProduct.sales}?${search.toString()}`;
    return apiFetch<ShopProductListData>(path, {
        method: 'GET',
    });
}

export async function fetchShopProductsByLatest(params: FetchShopProductsParams = {}): Promise<ApiResponse<ShopProductListData>> {
    const search = new URLSearchParams();
    if (params.page !== undefined) search.set('page', String(params.page));
    if (params.limit !== undefined) search.set('limit', String(params.limit));

    const path = `${API_ENDPOINTS.shopProduct.latest}?${search.toString()}`;
    return apiFetch<ShopProductListData>(path, {
        method: 'GET',
    });
}

// 交易专场
export interface CollectionSessionItem {
    id: number;
    title: string;
    image: string;
    start_time: string;
    end_time: string;
    status: string; // pre, active, ended
    [key: string]: any;
}

export async function fetchCollectionSessions(): Promise<ApiResponse<{ list: CollectionSessionItem[] }>> {
    return apiFetch<{ list: CollectionSessionItem[] }>(API_ENDPOINTS.collectionSession.index, {
        method: 'GET',
    });
}

export async function fetchCollectionSessionDetail(id: number): Promise<ApiResponse<CollectionSessionItem>> {
    return apiFetch<CollectionSessionItem>(`${API_ENDPOINTS.collectionSession.detail}?id=${id}`, {
        method: 'GET',
    });
}

// 藏品交易
export interface CollectionItem {
    id: number;
    session_id: number;
    title: string;
    image: string;
    price: number;
    stock: number;
    [key: string]: any;
}

export async function fetchCollectionItems(params: { session_id?: number; page?: number } = {}): Promise<ApiResponse<{ list: CollectionItem[] }>> {
    const search = new URLSearchParams();
    if (params.session_id) search.set('session_id', String(params.session_id));
    if (params.page) search.set('page', String(params.page));

    const path = `${API_ENDPOINTS.collectionItem.index}?${search.toString()}`;
    return apiFetch<{ list: CollectionItem[] }>(path, {
        method: 'GET',
    });
}

export async function fetchCollectionItemDetail(id: number): Promise<ApiResponse<CollectionItem>> {
    return apiFetch<CollectionItem>(`${API_ENDPOINTS.collectionItem.detail}?id=${id}`, {
        method: 'GET',
    });
}

export async function buyCollectionItem(params: {
    id?: number;
    item_id?: number;
    consignment_id?: number | string;
    quantity?: number;
    pay_password?: string;
    token?: string;
    pay_type?: 'money' | 'score';
    product_id_record?: string;
}): Promise<ApiResponse> {
    const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    const payload = new FormData();

    // 使用 item_id 字段名（API 规范）
    // 优先使用 item_id，其次使用 id
    const itemId = params.item_id ?? params.id;
    if (itemId) {
        payload.append('item_id', String(itemId));
    }

    // 如果是寄售商品，需要传递 consignment_id（优先按寄售购买）
    if (params.consignment_id) {
        payload.append('consignment_id', String(params.consignment_id));
    }

    // 购买数量，默认为 1
    payload.append('quantity', String(params.quantity ?? 1));

    // 支付方式: money=余额, score=积分
    if (params.pay_type) {
        payload.append('pay_type', params.pay_type);
    }

    // 产品ID记录（如'第一天产品'）
    if (params.product_id_record) {
        payload.append('product_id_record', params.product_id_record);
    }

    return apiFetch(API_ENDPOINTS.collectionItem.buy, {
        method: 'POST',
        body: payload,
        token,
    });
}

// 我的藏品
export interface MyCollectionItem {
    id: number;
    item_id: number;
    title: string;
    image: string;
    price: string; // 可能是字符串格式 '9880.00'
    buy_time: number;
    buy_time_text: string;
    delivery_status: number; // 0 未提货 1 已提货
    delivery_status_text: string;
    consignment_status: number; // 0 未寄售, 1 待寄售, 2 寄售中, 3 失败, 4 已售出
    consignment_status_text: string;
    user_collection_id?: number | string;
    original_record?: any;
    [key: string]: any;
}

export async function getMyCollection(params: { page?: number; type?: string; token?: string } = {}): Promise<ApiResponse<{ list: MyCollectionItem[], total: number, has_more?: boolean }>> {
    const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.type) search.set('type', params.type); // 例如 'forsale' 寄售中

    const path = `${API_ENDPOINTS.collectionItem.purchaseRecords}?${search.toString()}`;
    return apiFetch<{ list: MyCollectionItem[], total: number, has_more?: boolean }>(path, {
        method: 'GET',
        token,
    });
}

// 兼容旧名称
export const fetchMyCollectionList = getMyCollection;


// 寄售相关
export async function consignCollectionItem(params: { user_collection_id?: number | string; id?: number; price: number; token?: string }): Promise<ApiResponse> {
    const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    const payload = new FormData();
    // 兼容 id 和 user_collection_id
    payload.append('user_collection_id', String(params.user_collection_id || params.id));
    payload.append('price', String(params.price));

    return apiFetch(API_ENDPOINTS.collectionItem.consign, {
        method: 'POST',
        body: payload,
        token,
    });
}

export async function cancelConsignment(params: { id?: number; consignment_id?: number; token?: string }): Promise<ApiResponse> {
    const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    const payload = new FormData();
    payload.append('consignment_id', String(params.consignment_id || params.id));

    return apiFetch(API_ENDPOINTS.collectionItem.cancelConsignment, {
        method: 'POST',
        body: payload,
        token,
    });
}

// 申请提货
export interface DeliverParams {
    user_collection_id?: number | string;
    id?: number; // 兼容旧字段
    address_id: number | null;
    token?: string;
}

export async function deliverCollectionItem(params: DeliverParams): Promise<ApiResponse> {
    const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    const payload = new FormData();
    payload.append('user_collection_id', String(params.user_collection_id || params.id));
    if (params.address_id) {
        payload.append('address_id', String(params.address_id));
    }

    return apiFetch(API_ENDPOINTS.collectionItem.deliver, {
        method: 'POST',
        body: payload,
        token,
    });
}

// 兼容旧名称
export const applyDelivery = deliverCollectionItem;

// 艺术家
export interface ArtistItem {
    id: number;
    name: string;
    avatar: string;
    title: string;
    description: string;
}

export async function fetchArtistList(): Promise<ApiResponse<{ list: ArtistItem[] }>> {
    return apiFetch<{ list: ArtistItem[] }>(API_ENDPOINTS.artist.index, {
        method: 'GET',
    });
}


// ----------------------------------------------------------------------------
// Shop Order API (积分商城/普通商品订单)
// ----------------------------------------------------------------------------

export interface ShopOrderItemDetail {
    id: number;
    shop_order_id: number;
    product_id: number;
    product_name: string;
    product_image: string;
    product_thumbnail?: string;
    price: number;
    score_price?: number;
    subtotal: number;
    subtotal_score?: number;
    quantity: number;
    [key: string]: any;
}

export interface ShopOrderItem {
    id: number;
    order_no: string;
    total_amount: number | string;
    total_score: number | string;
    status: number;
    status_text: string;
    pay_type: string;
    createtime: number;
    items: ShopOrderItemDetail[];
    product_image?: string; // Fallback
    product_name?: string; // Fallback
    thumbnail?: string; // Fallback
    quantity?: number; // Fallback
    [key: string]: any;
}

export interface FetchShopOrderParams {
    page?: number;
    limit?: number;
    token?: string;
}

export async function fetchPendingPayOrders(params: FetchShopOrderParams = {}): Promise<ApiResponse<{ list: ShopOrderItem[], total: number }>> {
    const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));

    const path = `${API_ENDPOINTS.shopOrder.pendingPay}?${search.toString()}`;
    return apiFetch<{ list: ShopOrderItem[], total: number }>(path, { method: 'GET', token });
}

export async function fetchPendingShipOrders(params: FetchShopOrderParams = {}): Promise<ApiResponse<{ list: ShopOrderItem[], total: number }>> {
    const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));

    const path = `${API_ENDPOINTS.shopOrder.pendingShip}?${search.toString()}`;
    return apiFetch<{ list: ShopOrderItem[], total: number }>(path, { method: 'GET', token });
}

export async function fetchPendingConfirmOrders(params: FetchShopOrderParams = {}): Promise<ApiResponse<{ list: ShopOrderItem[], total: number }>> {
    const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));

    const path = `${API_ENDPOINTS.shopOrder.pendingConfirm}?${search.toString()}`;
    return apiFetch<{ list: ShopOrderItem[], total: number }>(path, { method: 'GET', token });
}

export async function fetchCompletedOrders(params: FetchShopOrderParams = {}): Promise<ApiResponse<{ list: ShopOrderItem[], total: number }>> {
    const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));

    const path = `${API_ENDPOINTS.shopOrder.completed}?${search.toString()}`;
    return apiFetch<{ list: ShopOrderItem[], total: number }>(path, { method: 'GET', token });
}

export async function confirmOrder(params: { id: number | string; token?: string }): Promise<ApiResponse> {
    const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    const payload = new FormData();
    payload.append('id', String(params.id));

    return apiFetch(API_ENDPOINTS.shopOrder.confirm, {
        method: 'POST', body: payload, token
    });
}

export async function payOrder(params: { id: number | string; token?: string }): Promise<ApiResponse> {
    const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    const payload = new FormData();
    payload.append('id', String(params.id));

    return apiFetch(API_ENDPOINTS.shopOrder.pay, {
        method: 'POST', body: payload, token
    });
}

export async function deleteOrder(params: { id: number | string; token?: string }): Promise<ApiResponse> {
    const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    const payload = new FormData();
    payload.append('id', String(params.id));

    return apiFetch(API_ENDPOINTS.shopOrder.delete, {
        method: 'POST', body: payload, token
    });
}

export async function getOrderDetail(params: { id: number | string; token?: string }): Promise<ApiResponse<ShopOrderItem>> {
    const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    const path = `${API_ENDPOINTS.shopOrder.detail}?id=${params.id}`;
    return apiFetch<ShopOrderItem>(path, { method: 'GET', token });
}

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

// ----------------------------------------------------------------------------
// Collection / Consignment API (藏品/寄售)
// ----------------------------------------------------------------------------

export async function fetchCollectionItemsBySession(sessionId: number | string, params: { page?: number; limit?: number } = {}): Promise<ApiResponse<{ list: CollectionItem[] }>> {
    const search = new URLSearchParams();
    search.set('session_id', String(sessionId));
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));

    // 使用 bySession 接口
    const path = `${API_ENDPOINTS.collectionItem.bySession}?${search.toString()}`;
    return apiFetch<{ list: CollectionItem[] }>(path, { method: 'GET' });
}

export type CollectionItemDetailData = CollectionItem & {
    images?: string[];
    description?: string;
    [key: string]: any;
};

export async function fetchCollectionItemOriginalDetail(id: number | string): Promise<ApiResponse<CollectionItemDetailData>> {
    const path = `${API_ENDPOINTS.collectionItem.originalDetail}?id=${id}`;
    return apiFetch<CollectionItemDetailData>(path, { method: 'GET' });
}

export interface ConsignmentItem {
    id: number;
    consignment_id: number; // 关键字段
    session_id?: number | string;
    title: string;
    image: string;
    price: number;
    consignment_price?: number;
    stock?: number;
    sales?: number;
    [key: string]: any;
}

export async function getConsignmentList(params: { page?: number; limit?: number } = {}): Promise<ApiResponse<{ list: ConsignmentItem[] }>> {
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));

    return apiFetch<{ list: ConsignmentItem[] }>(`${API_ENDPOINTS.collectionItem.consignmentList}?${search.toString()}`, { method: 'GET' });
}

export interface MyConsignmentItem {
    consignment_id: number;
    user_collection_id: number;
    title: string;
    image: string;
    original_price: number | string;
    consignment_price: number | string;
    consignment_status: number;
    consignment_status_text: string;
    create_time: number;
    create_time_text: string;
    [key: string]: any;
}

export async function getMyConsignmentList(params: { page?: number; limit?: number; status?: number; token?: string } = {}): Promise<ApiResponse<{ list: MyConsignmentItem[], has_more?: boolean }>> {
    const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));
    if (params.status !== undefined) search.set('status', String(params.status));

    const path = `${API_ENDPOINTS.collectionItem.myConsignmentList}?${search.toString()}`;
    return apiFetch<{ list: MyConsignmentItem[], has_more?: boolean }>(path, { method: 'GET', token });
}

export interface PurchaseRecordItem {
    order_id: number;
    item_title: string;
    item_image: string;
    quantity: number;
    price: number | string;
    total_amount: number | string;
    pay_type_text: string;
    status_text: string;
    order_status_text?: string;
    pay_time: number;
    pay_time_text: string;
    [key: string]: any;
}

export async function getPurchaseRecords(params: { page?: number; limit?: number; token?: string } = {}): Promise<ApiResponse<{ list: PurchaseRecordItem[], has_more?: boolean }>> {
    const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));

    const path = `${API_ENDPOINTS.collectionItem.purchaseRecords}?${search.toString()}`;
    return apiFetch<{ list: PurchaseRecordItem[], has_more?: boolean }>(path, { method: 'GET', token });
}

export interface ConsignmentDetailData {
    id: number;
    title: string;
    image: string;
    images?: string[];
    description?: string;
    price: number;
    consignment_price: number;
    status: number;
    status_text: string;
    [key: string]: any;
}

export async function getConsignmentDetail(params: { consignment_id: number; token?: string }): Promise<ApiResponse<ConsignmentDetailData>> {
    const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    const path = `${API_ENDPOINTS.collectionItem.consignmentDetail}?id=${params.consignment_id}`;
    return apiFetch<ConsignmentDetailData>(path, { method: 'GET', token });
}

export async function getDeliveryList(params: { page?: number; limit?: number; status?: string; token?: string; } = {}): Promise<ApiResponse<{ list: ShopOrderItem[], has_more?: boolean }>> {
    const token = params.token || localStorage.getItem(AUTH_TOKEN_KEY) || '';
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));
    if (params.status) search.set('status', params.status);

    const path = `${API_ENDPOINTS.collectionItem.deliveryList}?${search.toString()}`;
    return apiFetch<{ list: ShopOrderItem[], has_more?: boolean }>(path, { method: 'GET', token });
}

export async function fetchArtistDetail(id: number | string): Promise<ApiResponse<ArtistDetailData>> {
    const path = `${API_ENDPOINTS.artist.detail}?id=${id}`;
    return apiFetch<ArtistDetailData>(path, { method: 'GET' });
}

export type ArtistApiItem = ArtistItem;
export type ArtistListData = { list: ArtistItem[] };
export const fetchArtists = fetchArtistList;

export interface ArtistWorkItem {
    id: number;
    title: string;
    image: string;
    price?: number;
    description?: string;
    [key: string]: any;
}

export interface ArtistDetailData extends ArtistItem {
    works?: ArtistWorkItem[];
    [key: string]: any;
}

export interface ArtistAllWorkItem {
    id: number;
    artist_id: number;
    image: string;
    title: string;
    artist_title?: string;
    artist_name: string;
    description?: string;
    [key: string]: any;
}

export interface ArtistAllWorksListData {
    list: ArtistAllWorkItem[];
    total: number;
}

export async function fetchArtistAllWorks(params: { page?: number; limit?: number } = {}): Promise<ApiResponse<ArtistAllWorksListData>> {
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));

    const path = `${API_ENDPOINTS.artist.allWorks}?${search.toString()}`;
    return apiFetch<ArtistAllWorksListData>(path, { method: 'GET' });
}
