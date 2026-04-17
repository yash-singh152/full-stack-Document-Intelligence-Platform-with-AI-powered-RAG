import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  MessageSquare, 
  Loader2, 
  RefreshCcw, 
  Star, 
  ChevronRight,
  Info,
  Send,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBooks, getBookDetail, uploadBooks, askQuestion, getRecommendations } from './api';

const App = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [qaLoading, setQaLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'detail'

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await getBooks();
      setBooks(res.data);
    } catch (err) {
      console.error("Failed to fetch books", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async () => {
    setLoading(true);
    try {
      await uploadBooks(5);
      fetchBooks();
    } catch (err) {
      alert("Failed to scrape books");
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = async (book) => {
    setSelectedBook(book);
    setDetailLoading(true);
    setView('detail');
    try {
      const recs = await getRecommendations(book.id);
      setRecommendations(recs.data);
    } catch (err) {
      console.error("Failed to fetch recommendations", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setQaLoading(true);
    const userQ = question;
    setQuestion("");
    setChatHistory(prev => [...prev, { type: 'user', text: userQ }]);

    try {
      const res = await askQuestion(userQ);
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        text: res.data.answer, 
        sources: res.data.sources 
      }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { type: 'bot', text: "Sorry, I couldn't process that question." }]);
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-600 rounded-2xl shadow-lg shadow-primary-500/20">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">DocIntel Platform</h1>
            <p className="text-slate-400 text-sm">AI-Powered Book Intelligence & RAG</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleScrape}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 transition-colors rounded-xl border border-slate-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            Scrape New Books
          </button>
        </div>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {view === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {loading && books.length === 0 ? (
                Array(8).fill(0).map((_, i) => (
                  <div key={i} className="glass-card h-64 rounded-2xl animate-pulse" />
                ))
              ) : (
                books.map(book => (
                  <div 
                    key={book.id} 
                    onClick={() => handleBookClick(book)}
                    className="glass-card p-5 rounded-2xl cursor-pointer group hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-lg text-xs font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        {book.rating}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-slate-800 px-2 py-1 rounded-md">
                        {book.genre || "Book"}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary-400 mb-2 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-3 mb-4">
                      {book.description}
                    </p>
                    <div className="flex items-center text-xs text-primary-500 font-bold group-hover:translate-x-1 transition-transform">
                      View Details <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Book Info */}
              <div className="lg:col-span-2 space-y-6">
                <button 
                  onClick={() => setView('dashboard')}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Library
                </button>

                <div className="glass-card p-8 rounded-3xl space-y-6">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-primary-600/20 text-primary-400 rounded-full text-xs font-bold">
                        {selectedBook?.genre}
                      </span>
                    </div>
                    <h2 className="text-4xl font-bold">{selectedBook?.title}</h2>
                    <p className="text-slate-400">By {selectedBook?.author}</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-lg font-semibold">
                      <Info className="w-5 h-5 text-primary-400" /> AI Insights
                    </h4>
                    <div className="p-4 bg-primary-900/10 border border-primary-800/20 rounded-xl italic text-slate-300">
                      "{selectedBook?.summary}"
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Description</h4>
                    <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                      {selectedBook?.description}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-4">
                  <h4 className="text-xl font-bold">Related Books</h4>
                  {detailLoading ? (
                    <div className="flex gap-4">
                      <div className="glass-card h-40 w-full rounded-2xl animate-pulse" />
                      <div className="glass-card h-40 w-full rounded-2xl animate-pulse" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {recommendations.map(req => (
                        <div 
                          key={req.id} 
                          onClick={() => handleBookClick(req)}
                          className="glass-card p-4 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors"
                        >
                          <h6 className="text-xs font-bold line-clamp-2">{req.title}</h6>
                          <div className="flex items-center gap-1 text-yellow-500 text-[10px] mt-2">
                            <Star className="w-2 h-2 fill-current" /> {req.rating}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Q&A Interface */}
              <div className="space-y-6">
                <div className="glass-card rounded-3xl flex flex-col h-[600px] overflow-hidden">
                  <div className="p-6 border-b border-slate-800/50 bg-slate-800/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-primary-400" />
                      <div>
                        <h4 className="font-bold text-sm">Document QA</h4>
                        <p className="text-[10px] text-slate-500">Ask about your books</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chatHistory.length === 0 && (
                      <div className="text-center py-10 space-y-4">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-50">
                          <MessageSquare className="w-8 h-8 text-primary-400" />
                        </div>
                        <p className="text-slate-500 text-xs px-10">
                          Ask questions like "What is this book about?" or "Which book has the best rating?"
                        </p>
                      </div>
                    )}
                    {chatHistory.map((chat, i) => (
                      <div key={i} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                          chat.type === 'user' 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-slate-800 text-slate-200 border border-slate-700'
                        }`}>
                          {chat.text}
                          {chat.sources && (
                            <div className="mt-2 pt-2 border-t border-slate-700/50 text-[10px] text-primary-400 font-bold uppercase tracking-wider">
                              Sources: {chat.sources.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {qaLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-800 p-3 rounded-2xl animate-pulse flex gap-2">
                          <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAsk} className="p-4 bg-slate-800/30 border-t border-slate-800/50">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Type your question..."
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                      />
                      <button 
                        type="submit"
                        disabled={qaLoading}
                        className="absolute right-2 top-2 p-1.5 bg-primary-600 hover:bg-primary-500 rounded-lg text-white transition-colors disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center py-10 border-t border-slate-800/50">
        <p className="text-slate-500 text-xs">
          Built with React, Tailwind, Django, ChromaDB, and Sentence Transformers
        </p>
      </footer>
    </div>
  );
};

export default App;
