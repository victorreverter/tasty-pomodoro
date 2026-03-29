import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getRandomQuote } from '../../data/quotes';
import { useSettings } from '../../store/useSettings';

export function QuoteDisplay() {
  const showQuotes = useSettings((s) => s.showQuotes);
  const [quoteData, setQuoteData] = useState(() => getRandomQuote());

  useEffect(() => {
    if (!showQuotes) return;

    const interval = setInterval(() => {
      setQuoteData((prev) => getRandomQuote(prev.index));
    }, 15000);

    return () => clearInterval(interval);
  }, [showQuotes]);

  if (!showQuotes) return null;

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={quoteData.index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="text-center"
        >
          <p className="text-white/60 text-xs md:text-sm italic leading-relaxed text-shadow">
            &ldquo;{quoteData.quote.text}&rdquo;
          </p>
          <p className="text-white/30 text-[10px] md:text-xs mt-1 md:mt-2 tracking-wide">
            — {quoteData.quote.author}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
