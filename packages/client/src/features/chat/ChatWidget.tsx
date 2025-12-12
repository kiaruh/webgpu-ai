'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';

interface Message {
    sender: string;
    text: string;
    isMe: boolean;
}

export const ChatWidget = () => {
    const socket = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [nickname, setNickname] = useState('');
    const [hasJoined, setHasJoined] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('message', (payload: { sender: string; text: string }) => {
            setMessages((prev) => [
                ...prev,
                { ...payload, isMe: payload.sender === nickname },
            ]);
        });

        return () => {
            socket.off('message');
        };
    }, [socket, nickname]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleJoin = () => {
        if (nickname.trim()) setHasJoined(true);
    };

    const handleSend = () => {
        if (input.trim() && socket) {
            const payload = { sender: nickname, text: input };
            socket.emit('message', payload);
            // Optimistic update handled by socket broadcast (or local append if we want instant feedback)
            setInput('');
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-80 h-96 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Live Chat</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        {!hasJoined ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
                                <p className="text-sm text-center text-zinc-500">Pick a nickname to join</p>
                                <input
                                    type="text"
                                    placeholder="Enter nickname..."
                                    className="w-full px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-blue-500"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                                />
                                <button
                                    onClick={handleJoin}
                                    disabled={!nickname.trim()}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    Join
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {messages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex flex-col ${msg.sender === nickname ? 'items-end' : 'items-start'
                                                }`}
                                        >
                                            <span className="text-[10px] text-zinc-500 mb-1 px-1">{msg.sender}</span>
                                            <div
                                                className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${msg.sender === nickname
                                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-none'
                                                    }`}
                                            >
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        className="flex-1 px-3 py-2 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-blue-500"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim()}
                                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
            >
                <MessageSquare size={24} />
            </motion.button>
        </div>
    );
};
