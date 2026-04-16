import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { useSettings } from '../../store/useSettings';

export function TaskList() {
  const { enableTaskList, tasks, addTask, toggleTask, deleteTask } = useSettings();
  const [newTaskText, setNewTaskText] = useState('');

  if (!enableTaskList) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newTaskText.trim();
    if (text) {
      addTask(text);
      setNewTaskText('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full glass rounded-2xl p-4"
    >
      <h3 className="text-white/70 text-xs uppercase tracking-wider font-medium mb-3">Tasks</h3>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 bg-white/10 text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:border-white/30 outline-none placeholder:text-white/30"
        />
        <button
          type="submit"
          className="bg-[var(--accent)] text-white rounded-lg p-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
        </button>
      </form>

      <div className="space-y-2">
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-start gap-3 group"
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  task.completed
                    ? 'bg-[var(--accent)] border-[var(--accent)]'
                    : 'border-white/40 hover:border-white/60'
                }`}
              >
                {task.completed && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span
                className={`flex-1 text-sm break-words transition-all ${
                  task.completed ? 'text-white/40 line-through' : 'text-white/80'
                }`}
              >
                {task.text}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-white/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <p className="text-white/30 text-sm text-center py-2">No tasks yet</p>
        )}
      </div>
    </motion.div>
  );
}