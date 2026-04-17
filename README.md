# DocIntel Platform: AI-Powered Book RAG

A full-stack Document Intelligence Platform for analyzing book data using Retrieval-Augmented Generation (RAG).

## Features
- **Book Scraping**: Automatically collects data from `books.toscrape.com`.
- **AI Analytics**: Generates summaries and predicts genres using LLMs.
- **RAG Pipeline**: Semantic search using `sentence-transformers` and `ChromaDB`.
- **Interactive Q&A**: Ask questions about the book collection and get source-backed answers.
- **Smart Recommendations**: Suggests similar books based on vector embeddings.

## Tech Stack
- **Backend**: Django REST Framework, ChromaDB, SQLite.
- **Frontend**: ReactJS, Tailwind CSS, Framer Motion.
- **AI**: Sentence Transformers (`all-MiniLM-L6-v2`), OpenAI API (Optional).

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure Environment Variables:
   Create a `.env` file in the `backend/` directory:
   ```env
   OPENAI_API_KEY=your_key_here
   ```
5. Run migrations:
   ```bash
   python manage.py migrate
   ```
6. Start the server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Initial Data Load
The platform needs data to function. You can trigger the initial scrape via the frontend "Scrape New Books" button or via the API:
```bash
curl -X POST http://localhost:8000/api/upload-book/ -d '{"limit": 10}' -H "Content-Type: application/json"
```

## Screenshots
(Add screenshots here after running)
