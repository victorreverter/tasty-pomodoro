import type { Quote } from '../types';

export const quotes: Quote[] = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus is a matter of deciding what things you're not going to do.", author: "John Carmack" },
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Concentrate all your thoughts upon the work at hand.", author: "Alexander Graham Bell" },
  { text: "Time is what we want most, but what we use worst.", author: "William Penn" },
  { text: "Productivity is never an accident. It is always the result of commitment to excellence.", author: "Paul J. Meyer" },
  { text: "Either you run the day or the day runs you.", author: "Jim Rohn" },
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "What we think, we become.", author: "Buddha" },
  { text: "Dream big. Start small. Act now.", author: "Robin Sharma" },
  { text: "A little progress each day adds up to big results.", author: "Satya Nani" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Your focus determines your reality.", author: "George Lucas" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
];

export const getRandomQuote = (excludeIndex?: number): { quote: Quote; index: number } => {
  let index: number;
  do {
    index = Math.floor(Math.random() * quotes.length);
  } while (index === excludeIndex && quotes.length > 1);
  return { quote: quotes[index], index };
};
