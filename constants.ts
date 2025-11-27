import { Artist, Product, NewsItem, Banner, Order } from './types';

export const ARTISTS: Artist[] = [
  { 
    id: '1', 
    name: '崔宏波', 
    image: 'https://picsum.photos/seed/artist1/150/150',
    title: '国家一级美术师',
    bio: '崔宏波，当代著名山水画家。自幼酷爱丹青，师从多位名家。其作品风格独特，笔墨苍劲有力，意境深远。多次参加全国性美术展览并获奖，作品被多家博物馆及私人收藏家收藏。'
  },
  { 
    id: '2', 
    name: '李泽江', 
    image: 'https://picsum.photos/seed/artist2/150/150',
    title: '中国美术家协会会员',
    bio: '李泽江，擅长花鸟画，尤精牡丹。其笔下的牡丹雍容华贵，艳而不俗。致力于传统水墨与现代审美的融合，形成了鲜明的个人艺术风格。'
  },
  { 
    id: '3', 
    name: '叶建波', 
    image: 'https://picsum.photos/seed/artist3/150/150',
    title: '著名书法家',
    bio: '叶建波，书法家，书法理论家。工诸体，尤擅行草。其书法作品气势磅礴，行云流水，具有极高的艺术欣赏价值。'
  },
  { 
    id: '4', 
    name: '何加玉', 
    image: 'https://picsum.photos/seed/artist4/150/150',
    title: '当代实力派画家',
    bio: '何加玉，专注于山水画创作三十余年。作品多取材于祖国大好河山，画面气象万千，展现了深厚的传统功力与创新精神。'
  },
  { 
    id: '5', 
    name: '张文轩', 
    image: 'https://picsum.photos/seed/artist5/150/150',
    title: '新锐艺术家',
    bio: '张文轩，青年艺术家代表人物。作品风格前卫，色彩大胆，试图探索传统文化在当代语境下的新表达。'
  },
  { 
    id: '6', 
    name: '刘艺', 
    image: 'https://picsum.photos/seed/artist6/150/150',
    title: '资深画家',
    bio: '刘艺，擅长人物画。其人物造型生动，神态逼真，笔墨简练而传神，深受藏家喜爱。'
  },
];

export const PRODUCTS: Product[] = [
  { id: '1', title: '《大吉祥》', artist: '高喜占', price: 9880.00, image: 'https://picsum.photos/seed/art1/300/300', category: 'painting' },
  { id: '2', title: '《果香》', artist: '高喜占', price: 9880.00, image: 'https://picsum.photos/seed/art2/300/300', category: 'painting' },
  { id: '3', title: '《冠群芳》', artist: '赵春雨', price: 9880.00, image: 'https://picsum.photos/seed/art3/300/300', category: 'painting' },
  { id: '4', title: '《古居图》', artist: '张成', price: 9880.00, image: 'https://picsum.photos/seed/art4/300/300', category: 'painting' },
  { id: '5', title: '《喜上眉梢》', artist: '王明', price: 5600.00, image: 'https://picsum.photos/seed/art5/300/300', category: 'painting' },
  { id: '6', title: '《旭日东升》', artist: '李华', price: 12000.00, image: 'https://picsum.photos/seed/art6/300/300', category: 'painting' },
];

export const NEWS: NewsItem[] = [
  { 
    id: '1', 
    date: '2025-11-15 09:01:49', 
    title: '关于数权中心系统升级维护完成并恢复交易的公告', 
    isUnread: true,
    type: 'announcement',
    content: `尊敬的用户：\n\n您好！\n\n数权中心系统已于2025年11月15日09:00完成系统升级维护工作。目前平台各项功能已恢复正常使用，您可以正常进行交易、充值、提现等操作。\n\n本次升级优化了交易撮合引擎，提升了系统并发处理能力，为您提供更加流畅的交易体验。\n\n感谢您的理解与支持！`
  },
  { 
    id: '2', 
    date: '2025-11-10 19:13:48', 
    title: '关于数权中心系统升级维护的公告', 
    isUnread: true,
    type: 'announcement',
    content: `尊敬的用户：\n\n为了提供更优质的服务，本平台将于2025年11月14日23:00至11月15日09:00进行系统升级维护。\n\n维护期间，将暂停所有交易服务及资金存取功能。请您提前做好相关安排，由此给您带来的不便，敬请谅解。`
  },
  { 
    id: '3', 
    date: '2025-10-24 15:54:18', 
    title: '关于10月24日“数权中心”板块临时调整部分场次交易时间的通告', 
    isUnread: true,
    type: 'announcement',
    content: `尊敬的用户：\n\n接交易所通知，因网络波动原因，原定于今日16:00进行的“非遗专场”交易将推迟至17:00开始，结束时间顺延至17:30。\n\n其他场次交易时间不变。请广大交易商互相转告，合理安排交易时间。`
  },
  {
    id: '4',
    date: '2025-11-14 10:00:00',
    title: '热烈祝贺当代著名画家崔宏波先生作品入驻平台',
    isUnread: false,
    type: 'dynamic',
    content: `近日，当代著名画家、国家一级美术师崔宏波先生正式签约入驻数权中心平台。\n\n崔宏波先生擅长山水画，其作品大气磅礴，笔墨苍劲，多次在国内外书画大赛中获奖。本次入驻，崔先生将带来其代表作《山河锦绣》系列，并以数字化资产的形式限量发售。\n\n首批藏品将于本月20日开启申购，敬请关注！`
  },
  {
    id: '5',
    date: '2025-11-12 14:20:00',
    title: '平台“双十一”艺术品交易额突破新高',
    isUnread: false,
    type: 'dynamic',
    content: `截止昨日24:00，数权中心平台“双十一”艺术品专场活动圆满收官。\n\n据统计，本次活动累计交易额突破5000万元，同比增长120%。其中，非遗文创类产品受到年轻藏家的热烈追捧，成交量占比超过40%。\n\n这标志着数字化艺术品交易市场正在迎来新的爆发期，平台将继续致力于挖掘优质文化资产，回馈广大用户。`
  }
];

export const BANNERS: Banner[] = [
  {
    id: '1',
    image: 'https://picsum.photos/seed/banner1/800/400',
    tag: '全国首张文化数字资产交易牌照',
    title: '文化商品数字化交易'
  },
  {
    id: '2',
    image: 'https://picsum.photos/seed/art_showcase/800/400',
    tag: '艺术鉴赏',
    title: '名家名作 限量发售'
  },
  {
    id: '3',
    image: 'https://picsum.photos/seed/tech_art/800/400',
    tag: '平台动态',
    title: '最新交易规则公告'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-20231115-01',
    productName: '《大吉祥》',
    productImage: 'https://picsum.photos/seed/art1/150/150',
    price: 9880.00,
    quantity: 1,
    total: 9880.00,
    status: '买入成功',
    date: '2023-11-15 10:30:00',
    type: 'product',
    subStatusIndex: 0
  },
  {
    id: 'ORD-20231114-02',
    productName: '《喜上眉梢》',
    productImage: 'https://picsum.photos/seed/art5/150/150',
    price: 5600.00,
    quantity: 1,
    total: 5600.00,
    status: '卖出成功',
    date: '2023-11-14 15:20:00',
    type: 'product',
    subStatusIndex: 1
  },
  {
    id: 'ORD-20231112-03',
    productName: '《旭日东升》',
    productImage: 'https://picsum.photos/seed/art6/150/150',
    price: 12000.00,
    quantity: 1,
    total: 12000.00,
    status: '寄售中',
    date: '2023-11-12 09:00:00',
    type: 'transaction',
    subStatusIndex: 1
  },
  {
    id: 'ORD-20231110-04',
    productName: '积分兑换商品A',
    productImage: 'https://picsum.photos/seed/gift1/150/150',
    price: 200.00,
    quantity: 2,
    total: 400.00,
    status: '待收货',
    date: '2023-11-10 11:00:00',
    type: 'points',
    subStatusIndex: 2
  }
];