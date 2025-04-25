import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Bubble = React.memo(({ bubble, onAnimationEnd }) => {
  const bubbleRef = useRef(null);
  const position = useMemo(() => ({
    left: `${Math.random() * 100}%`,
    animationDuration: `${5 + Math.random() * 10}s`,
    fontSize: `${20 + Math.random() * 10}px`,
    animationDelay: `${Math.random() * 5}s`,
    maxWidth: '300px',
  }), []);

  useEffect(() => {
    const currentBubbleRef = bubbleRef.current;
    if (currentBubbleRef) {
      currentBubbleRef.addEventListener('animationend', () => onAnimationEnd(bubble.id));
    }
    return () => {
      if (currentBubbleRef) {
        currentBubbleRef.removeEventListener('animationend', () => onAnimationEnd(bubble.id));
      }
    };
  }, [bubble.id, onAnimationEnd]);

  return (
    <div
      ref={bubbleRef}
      className="bubble"
      style={position}
    >
      {bubble.content}
    </div>
  );
});

function App() {
  const [message, setMessage] = useState('');
  const [bubbles, setBubbles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchTime = useRef(0);

  const fetchRandomMessages = useCallback(async () => {
    const now = Date.now();
    try {
      const response = await axios.get(`${API_URL}/api/messages/random`);
      setBubbles(prevBubbles => {
        const newMessages = response.data.filter(
          newMsg => !prevBubbles.some(prevMsg => prevMsg.id === newMsg.id)
        );
        return [...prevBubbles, ...newMessages];
      });
      lastFetchTime.current = now;
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, []);

  useEffect(() => {
    fetchRandomMessages();
  }, [fetchRandomMessages]);

  const handleAnimationEnd = useCallback((bubbleId) => {
    setBubbles(prevBubbles => {
      const remainingBubbles = prevBubbles.filter(bubble => bubble.id !== bubbleId);
      
      if (remainingBubbles.length < 8) {
        fetchRandomMessages();
      }
      
      return remainingBubbles;
    });
  }, [fetchRandomMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/messages`, { content: message });
      setMessage('');
    } catch (error) {
      console.error('Error submitting message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="bubbles-container">
        {bubbles.map((bubble) => (
          <Bubble
            key={bubble.id}
            bubble={bubble}
            onAnimationEnd={handleAnimationEnd}
          />
        ))}
      </div>
      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          maxLength={280}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default App; 