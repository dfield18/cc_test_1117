'use client';

import { useState, useRef, useEffect } from 'react';
import { Recommendation } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recommendations?: Recommendation[];
}

const SUGGESTED_QUESTIONS = [
  'Best Card for Travel',
  "I'm 40 and love to travel and make $100k a year",
  'Best card for groceries and gas',
  'Best no-annual-fee starter card',
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ];
    setMessages(newMessages);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      
      // Check if the response contains an error
      if (!response.ok || data.error) {
        const errorMessage = data.error || 'Failed to get recommendations';
        const errorDetails = data.details ? `\n\nDetails: ${data.details}` : '';
        throw new Error(`${errorMessage}${errorDetails}`);
      }
      
      // Add assistant response
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: data.rawModelAnswer || 'Here are some recommendations for you:',
          recommendations: data.recommendations || [],
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Sorry, I encountered an error. Please try again.';
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `❌ Error: ${errorMessage}\n\nPlease check:\n- Your OpenAI API key is set correctly in .env.local\n- The Google Sheet is public and accessible\n- Check the browser console and server logs for more details`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Credit Card Recommendation Chatbot
          </h1>
          <p className="text-gray-600">
            Get personalized credit card recommendations powered by AI
          </p>
        </header>

        {/* Suggested Questions */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="h-96 overflow-y-auto mb-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>Start a conversation to get credit card recommendations!</p>
                <p className="text-sm mt-2">Try one of the suggested questions above.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Recommendations */}
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <p className="font-semibold mb-2 text-sm">Recommended Cards:</p>
                        <div className="space-y-2">
                          {message.recommendations.map((rec, recIndex) => (
                            <div
                              key={recIndex}
                              className="bg-white rounded p-3 text-gray-800"
                            >
                              <h4 className="font-semibold text-blue-600 mb-1">
                                {rec.credit_card_name}
                              </h4>
                              <p className="text-sm mb-2">{rec.reason}</p>
                              <a
                                href={rec.apply_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                              >
                                Apply Now →
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <p className="text-gray-600">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about credit cards..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>

        {/* Recommendations List (if any message has recommendations) */}
        {messages.some((m) => m.recommendations && m.recommendations.length > 0) && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Recommended Credit Cards
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {messages
                .flatMap((m) => m.recommendations || [])
                .map((rec, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-xl font-semibold text-blue-600 mb-2">
                      {rec.credit_card_name}
                    </h3>
                    <p className="text-gray-700 mb-4">{rec.reason}</p>
                    <a
                      href={rec.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Apply Now →
                    </a>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

