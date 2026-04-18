Crypto Pulse News AI

An intelligent cryptocurrency news aggregator featuring automated AI translation and seamless Telegram channel integration.

🚀 Key Features

Real-time Monitoring: Instant fetching of live cryptocurrency news and market updates via CoinDesk API.

Smart AI Translation: Automatic high-quality translation of news headlines and descriptions to ensure global content accessibility.

Telegram Integration: Professional dashboard for administrators to review and publish curated news directly to Telegram channels with a single click.

Dynamic Media Assets: Smart image selection system that fetches relevant, high-quality visuals for every news piece using the Unsplash API.

Responsive Design: Fully optimized for mobile, tablet, and desktop viewing.

🛠 Tech Stack

Frontend Framework: Next.js 16.1.6 (utilizing Turbopack for lightning-fast builds)

Language: TypeScript for robust, type-safe development

Styling: Tailwind CSS for a modern, utility-first UI

Backend & Database: Supabase (PostgreSQL) for secure data persistence and management

Deployment: Vercel for continuous integration and high-performance hosting

External APIs: CoinDesk (Market Data), Unsplash (Media).

📂 Project Structure

/app: Core application logic using Next.js App Router.

/components: Reusable UI components built with Tailwind CSS.

/lib: Utility functions for API integrations and data processing.

/services: Logic for automated translation and Telegram bot communication.

⚙️ Getting Started

Clone the repository:

git clone https://github.com/mayerpeter502-cloud/crypto-news.git


Install dependencies:

npm install


Configure Environment Variables:
Create a .env.local file and add your API keys for CoinDesk, Telegram Bot, and Supabase.

Run the development server:

npm run dev


📄 License

This project is developed as part of a professional full-stack portfolio.
