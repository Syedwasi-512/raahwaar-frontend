# 👟 Raahwaar-PK | Shopify-Standard Footwear Storefront

![Frontend](https://img.shields.io/badge/Frontend-React--19-blue?style=for-the-badge&logo=react)
![UI](https://img.shields.io/badge/Design-Shopify--Polaris-white?style=for-the-badge&logo=tailwindcss)
![State](https://img.shields.io/badge/State-Redux--Toolkit-purple?style=for-the-badge&logo=redux)

**Raahwaar-PK** is a premium e-commerce storefront designed with a focus on minimalist aesthetics, high-speed interactions, and seamless user experience. Inspired by the Shopify ecosystem, it features a fluid architecture and elite-level UX components.

🚀 **[Live Storefront](https://raahwaar-pk.vercel.app)**

---

## 💎 Elite UX & Performance Features

### ⚡ Zero-Latency UX (Optimistic UI)
- Implemented **Optimistic UI Updates** for all cart operations (Add/Update/Remove). The UI reflects changes in **0ms**, syncing with the backend asynchronously with a robust **Rollback Mechanism** in case of failure.

### 🔍 Shopify 2.0 Product Experience
- **Circular Lens Magnifier:** Built a professional hover-zoom effect for high-resolution product inspection.
- **Fluid Layout:** Adhered to the `1300px` fluid width standard and **1:1 Square Image Aspect Ratios** for a polished, high-fashion footwear catalog.
- **Advanced Filtering:** Multi-attribute filtering (Size, Color, Brand, Condition) with deep-linked URL synchronization.

### 🤖 Intelligent AI Assistant
- Interactive **AI Chatbot** UI with auto-scroll and **Markdown Rendering**.
- The assistant provides clickable product links, allowing users to navigate from chat directly to product pages, increasing conversion potential.

### 📈 SEO & Social Engineering
- **Dynamic Meta Management:** Integrated `react-helmet-async` for SEO. Each product page generates specific **Open Graph (OG)** tags for high-quality previews on WhatsApp, Facebook, and LinkedIn.
- **Recently Viewed Persistence:** Implemented LocalStorage-based history tracking to enhance user re-engagement without database overhead.

---

## 🛠️ Architecture & Tools
- **React 19:** Leveraging the latest concurrent rendering features.
- **Redux Toolkit:** Centralized state management for products and search.
- **Tailwind CSS:** Custom design tokens for a "low visual weight" professional feel.

---

## 🏗️ Frontend Architecture & UI Workflow

The storefront is built as a **Single Page Application (SPA)** with a focus on fluid interactions and state-driven UI consistency.

- **Global State Management:** Uses **Redux Toolkit** to synchronize product catalogs, search queries, and real-time filtering across different views.
- **Optimistic State Engine:** Cart operations are handled through an **Optimistic UI pattern**. The local state is updated immediately on user action, while backend synchronization happens in the background, with a built-in **State Rollback** logic for network resilience.
- **SEO & Meta-Hydration:** Dynamic metadata is injected using `react-helmet-async` on a per-product basis, ensuring that shared links generate rich, informative social previews.
- **Performance Strategy:** Implements **Component Memoization** and **Lazy Loading** for routes and heavy assets (like the AI assistant and Cart drawer), ensuring a light initial bundle size.

## 📸 Visual Preview & Interface

| 👟 Premium Storefront | ✨ Dynamic Product Experience |
|:---:|:---:|
| <img src="../frontend/src/assets/home.png" width="400" /> | <img src="../frontend/src/assets/product_detail.png" width="400" /> |
| *Fluid 1:1 Aspect Ratio Catalog* | *Interactive Magnifier & Vertical Specs* |

| 🤖 AI Personal Shopper | 💳 Secure Checkout Flow |
|:---:|:---:|
| <img src="../frontend/src/assets/ai_chat.png" width="400" /> | <img src="../frontend/src/assets/order.png" width="400" /> |
| *Llama 3.1 Powered RAG Assistant* | *Optimized for Trust & Conversions* |

| 📊 Admin Control Panel | 📱 Responsive Architecture |
|:---:|:---:|
| <img src="../frontend/src/assets/admin.png" width="400" /> | <img src="../frontend/src/assets/mobile.jpeg" width="200" /> |
| *Real-time Inventory & Order Sync* | *Seamless High-Density Mobile UX* |