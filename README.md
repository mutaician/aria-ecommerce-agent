# Aria - E-commerce Store Management AI Agent

## 📋 Project Overview
Aria is an intelligent AI assistant for e-commerce store management built with Mastra.ai. This conversational agent is designed to handle inventory management, sales analysis, product operations, and content generation, featuring persistent memory and context awareness.

## 🚀 Getting Started

Follow these steps to get Aria up and running on your local machine.

### Prerequisites
- Node.js (v18 or later recommended)
- pnpm (or npm/yarn)

### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/mutaician/aria-ecommerce-agent.git
    cd aria-ecommerce-agent
    ```
2.  **Install dependencies:**
    Using pnpm (recommended):
    ```bash
    pnpm install
    ```
    Or using npm:
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
    Then, open the `.env` file and add your API keys and any other necessary configurations. Minimally, you will need a Google AI API Key if you are using Gemini models.
    ```env
    GOOGLE_GENERATIVE_AI_API_KEY=your_google_gemini_api_key_here
    ```

### Running the Project
Mastra.ai projects typically run a development server that provides a playground for interacting with your agents and workflows.

1.  **Start the development server:**
    ```bash
    pnpm dev
    ```
    Or if you are using npm:
    ```bash
    npm run dev
    ```
    This command will usually start the Mastra playground, which you can open in your web browser (often at `http://localhost:4111` or a similar address displayed in your terminal).

2.  **Interact with Aria:**
    Once the playground is open, you can interact with the "Aria" agent. Try some of the example queries:
    *   "Check the stock level for Wireless Headphones"
    *   "Generate a sales report for the last 30 days"
    *   "Add a new product: 'Smart Watch Pro' priced at $299.99 in Electronics category"
    *   "What are my top-selling products this month?"
    *   "Which products are running low on stock?"
    *   "Hide the product with the name T-shirt from the store for now."
    *   "Generate a news blog post with the topic of eco-friendly products."
    *   "Create a social media post for Instagram announcing a 20% off flash sale on all headphones."
    *   "What was our total revenue last quarter?"
    *   "Can you give me some SEO keywords for 'classic jeans'?"



## 🏗️ Technical Architecture
-   **Framework**: Mastra.ai
-   **Language Model**: Configured for Google Gemini 
-   **Memory**: LibSQL-based persistent storage
-   **Runtime**: Node.js/TypeScript
-   **Data Layer**: In-memory simulation with JSON exports (for this example project)

## 🛠️ Tools
Aria is equipped with a suite of tools to manage an e-commerce store, including:
*   **Inventory Management**: `getProductStock`, `updateInventory`, `getLowStockAlerts`
*   **Product Management**: `getProduct`, `addNewProduct`, `updateProduct`, `toggleVisibility`, `getProductsByCollectionTool`, `getAllProducts`
*   **Sales & Analytics**: `getSalesData`, `salesAnalytics`, `revenueReports`
*   **Content Generation**: `generateProductDescription`, `generateSEO`, `generateBlogPost`, `generateSocialMediaContent`

For detailed tool documentation, please refer to the source code in `src/mastra/tools/`.

## 🗂️ Project Structure
The project follows a modular structure:
```
aria-ecommerce-agent/
├── package.json
├── tsconfig.json
├── .env
├── src/
│   ├── mastra/             # Mastra.ai specific configurations
│   │   ├── agents/         # Agent definitions (Aria)
│   │   ├── tools/          # Agent tools (inventory, products, sales, content)
│   │   └── mcp/            # MCP server setup (if used)
│   ├── data/               # Data store simulation, models, and seed data
│   ├── utils/              # Utility functions (logging, formatting)
│   └── scripts/            # CLI scripts (seed data, test agent)
└── README.md
```

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue.

## 📄 License
This project is licensed under the MIT License. See the `LICENSE` file for details (if one exists).
