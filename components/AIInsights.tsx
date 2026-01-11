
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
// Use Transaction interface instead of non-existent Expense
import { Transaction } from '../types';

interface AIInsightsProps {
  // Use Transaction[] type
  expenses: Transaction[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ expenses }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getAIAdvice = useCallback(async () => {
    if (expenses.length < 3) {
      setInsight("Keep adding expenses! Once you have at least 3, I can analyze your spending patterns.");
      return;
    }

    setLoading(true);
    try {
      // Initialize GoogleGenAI with the API key from environment variables
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze this list of expenses (JSON format): ${JSON.stringify(expenses.slice(-15))}. 
      Give me a very short (max 2 sentences), encouraging financial tip based on these categories and amounts. 
      Focus on saving or potential habits. Keep it professional yet friendly.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      // Access the .text property directly from GenerateContentResponse
      setInsight(response.text || "You're doing great! Keep tracking to stay on top of your budget.");
    } catch (error) {
      console.error("Gemini Error:", error);
      setInsight("I'm having trouble thinking right now. Check back later!");
    } finally {
      setLoading(false);
    }
  }, [expenses]);

  return (
    <div className="bg-teal-900 text-teal-50 p-6 rounded-2xl shadow-lg mb-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-800 rounded-full -mr-16 -mt-16 opacity-50 transition-transform group-hover:scale-110"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-teal-700/50 p-2 rounded-lg">
            <i className="fa-solid fa-sparkles text-teal-200"></i>
          </div>
          <h3 className="text-lg font-bold">AI Spending Insights</h3>
        </div>
        
        {insight ? (
          <p className="text-teal-100 leading-relaxed mb-4 italic">
            "{insight}"
          </p>
        ) : (
          <p className="text-teal-200 leading-relaxed mb-4">
            Want to see what your data says? Our AI can analyze your habits and give you smart tips.
          </p>
        )}

        <button 
          onClick={getAIAdvice}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg font-semibold transition-all shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <i className="fa-solid fa-circle-notch animate-spin"></i>
              Analyzing...
            </>
          ) : (
            <>
              <i className="fa-solid fa-brain"></i>
              {insight ? 'Refresh Insight' : 'Get Insight'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AIInsights;