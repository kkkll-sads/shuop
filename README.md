# Cultural Asset Trader (数权中心)

A comprehensive mobile-first web application for trading cultural digital assets, featuring artwork showcases, marketplaces, news feeds, and order management.

## 📱 Project Overview

This project is a React-based web application designed to simulate a mobile app experience ("数权中心"). It facilitates the trading of digital cultural assets, including paintings, calligraphy, and other artistic works.

### Key Features

*   **Home Page**:
    *   Auto-playing banner carousel with touch swipe support.
    *   Vertical scrolling platform news ticker.
    *   Quick access to sub-modules (About Us, News, Artists, Masterpieces).
    *   Dedicated "Trading Zone" entrance.
    *   Artist showcase preview.
*   **Marketplace (商城)**:
    *   Product search and categorization (Art, Intangible Heritage, etc.).
    *   Sorting options (Price, Sales, Newest).
    *   Product Detail page with specification selection sheet.
*   **Trading Zone (交易专区)**:
    *   Visual dashboard for ongoing and upcoming trading sessions.
*   **News Center (资讯)**:
    *   Tabbed view for "Platform Announcements" and "Platform Dynamics".
    *   Read status tracking (Red dot indicator).
    *   Local storage persistence for read items.
    *   "Clear All Unread" functionality.
*   **Order Center (订单)**:
    *   Categorized order management (Product, Transaction, Delivery, Points).
    *   Tabbed order lists for different statuses.
*   **Profile (我的)**:
    *   User dashboard with asset overview.
    *   Detailed asset view (Balance, Service Fees, Points).
    *   **User Status Badges**: Distinct icons for New, Regular, and Trading users.
    *   **Agent Badge**: Dedicated badge for verified agents.
*   **Sub-pages**:
    *   **Artist Detail**: Bio, profile, and works gallery.
    *   **Artist/Masterpiece Showcases**: Grid views for browsing content.
    *   **About Us**: Platform introduction.

## 🛠 Technology Stack

*   **Framework**: React 18+
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Language**: TypeScript
*   **Build Tooling**: Standard ES Modules (Simulated environment)

## 📂 Project Structure

```
/
├── index.html              # Entry HTML with global styles
├── index.tsx               # App entry point
├── App.tsx                 # Main routing and state management
├── types.ts                # TypeScript interface definitions
├── constants.ts            # Mock data (Artists, Products, News, Orders)
├── components/             # Reusable UI components
│   ├── BottomNav.tsx       # Main navigation bar
│   ├── GridShowcase.tsx    # Grid layout for items
│   ├── ProductSpecSheet.tsx# Bottom sheet for product options
│   └── SubPageLayout.tsx   # Wrapper for sub-pages with header
└── pages/                  # Application screens
    ├── Home.tsx            # Landing page
    ├── Market.tsx          # Shopping page
    ├── News.tsx            # Information feed
    ├── Orders.tsx          # Order dashboard
    ├── OrderListPage.tsx   # Specific order lists
    ├── Profile.tsx         # User profile & assets
    ├── TradingZone.tsx     # Special trading area
    ├── ProductDetail.tsx   # Product buying page
    ├── ArtistDetail.tsx    # Artist profile
    └── ... (Other static content pages)
```

## 🚀 Development Notes

*   **Mobile First**: The UI is optimized for mobile viewports (`max-width: 480px` roughly recommended for desktop testing).
*   **No Scrollbars**: Global CSS hides scrollbars to mimic a native app feel.
*   **Mock Data**: All data is currently static and located in `constants.ts`.
*   **Routing**: Implemented via conditional rendering in `App.tsx` (SPA behavior) rather than a library like `react-router-dom`, to keep the environment lightweight and self-contained.

## 🎨 Design System

*   **Primary Color**: Orange (`orange-500` / `orange-600`)
*   **Background**: Light Orange Gradient (`from-[#FFD6A5] to-gray-50`) for headers, White for content.
*   **Typography**: Sans-serif, tailored for legibility on small screens.# Cultural
