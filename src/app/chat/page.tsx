"use client";

import { useState } from 'react';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const userIdentifier = "test@example.com"; // Hardcoded for now

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse('');

    try {
      const params = new URLSearchParams({
        task: message,
        user_identifier: userIdentifier,
      });
      
      const res = await fetch(`/api/n8n-proxy?${params.toString()}`, {
        method: 'GET',
      });

      if (res.ok) {
        setResponse('Task enhancement request sent successfully!');
        setMessage('');
      } else {
        const errorData = await res.json();
        setResponse(`Error: ${errorData.error || 'Something went wrong.'}`);
      }
    } catch (error) {
      console.error('Error sending request:', error);
      setResponse('An unexpected error occurred.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold text-center mb-8">Chatbot Task Enhancer</h1>
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Enter a task to enhance (e.g., 'plan a trip to Japan')"
              rows={3}
            />
            <button
              type="submit"
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400"
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? 'Enhancing...' : 'Enhance and Add Task'}
            </button>
          </form>
          {response && (
            <div className="mt-4 p-4 bg-gray-200 rounded">
              <p>{response}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}