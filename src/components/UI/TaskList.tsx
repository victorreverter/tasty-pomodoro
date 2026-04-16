import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, CheckCircle2 } from 'lucide-react';
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
              className="flex items-center gap-2 group"
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`flex-shrink-0 transition-colors ${
                  task.completed ? 'text-[var(--accent)]' : 'text-white/30 hover:text-white/60'
                }`}
              >
                {task.completed ? <CheckCircle2 size={18} /> : <Check size={18} />}
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
                className="text-white/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
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