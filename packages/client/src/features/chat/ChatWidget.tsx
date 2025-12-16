'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
    sender: string;
    text: string;
    isMe: boolean;
}

// ... imports

interface ChatWidgetProps {
    embedded?: boolean;
}

export const ChatWidget = ({ embedded = false }: ChatWidgetProps) => {
    const socket = useSocket();
    const [isOpen, setIsOpen] = useState(embedded); // Always open if embedded
    const [nickname, setNickname] = useState('');
    const [hasJoined, setHasJoined] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Retro "System" messages
    useEffect(() => {
        setMessages([
            { sender: 'System', text: 'Welcome to Immersive World.', isMe: false },
            { sender: 'System', text: 'Enter /help for commands.', isMe: false }
        ]);
    }, []);

    // Keep embedded open
    useEffect(() => {
        if (embedded) setIsOpen(true);
    }, [embedded]);

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
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [messages]);

    const handleJoin = () => {
        if (nickname.trim()) setHasJoined(true);
    };

    const handleSend = () => {
        if (input.trim() && socket) {
            const payload = { sender: nickname, text: input };
            socket.emit('message', payload);
            setInput('');
        }
    };

    // Glass styles
    const glassBox = "bg-black/40 backdrop-blur-md border border-white/10 rounded-xl";
    const glassInput = "bg-white/5 border border-white/10 rounded-lg text-white font-mono placeholder:text-neutral-500 focus:bg-white/10 transition-colors";
    const glassButton = "bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors text-white";

    // If embedded, we don't use fixed positioning or the floating button
    const containerClasses = embedded
        ? `w-full h-full ${glassBox} flex flex-col p-4`
        : `fixed bottom-6 right-6 z-50 font-mono mb-4 w-96 h-[500px] ${glassBox} shadow-2xl flex flex-col p-4`;

    const Content = (
        <div className={containerClasses}>
            {/* Retro Header (Hide close button if embedded) */}
            <div className="h-8 bg-neutral-800 flex items-center justify-between px-2 mb-1 border border-black select-none">
                <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Global Chat</span>
                {!embedded && (
                    <div className="flex gap-1">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-4 h-4 bg-red-900 border border-red-500 hover:bg-red-800 flex items-center justify-center"
                        >
                            <X size={10} className="text-white" />
                        </button>
                    </div>
                )}
            </div>

            {/* Content Body */}
            {!hasJoined ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 mx-1 mb-1">
                    <div className="text-center space-y-2">
                        <div className="text-sky-400 text-4xl mb-2 animate-pulse">📡</div>
                        <p className="text-sm text-neutral-300">Identify yourself, traveler.</p>
                    </div>
                    <input
                        type="text"
                        placeholder="Enter nickname..."
                        className={`w-full px-3 py-2 ${glassInput} outline-none focus:text-white`}
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                    />
                    <button
                        onClick={handleJoin}
                        disabled={!nickname.trim()}
                        className={`w-full py-2 text-xs font-bold uppercase ${glassButton} disabled:opacity-50`}
                    >
                        Login
                    </button>
                </div>
            ) : (
                <>
                    {/* Message Area */}
                    <div className={`flex-1 overflow-y-auto p-2 mx-1 mb-1 ${glassInput} font-medium scrollbar-hide`}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className="mb-1 leading-snug">
                                {msg.sender === 'System' ? (
                                    <span className="text-emerald-400">
                                        &lt;{msg.sender}&gt; {msg.text}
                                    </span>
                                ) : (
                                    <>
                                        <span className={`${msg.isMe ? 'text-cyan-400' : 'text-orange-400'}`}>
                                            {msg.sender}:
                                        </span>{' '}
                                        <span className="text-neutral-300">{msg.text}</span>
                                    </>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-1 flex gap-1">
                        <input
                            type="text"
                            placeholder="Say something..."
                            className={`flex-1 px-2 py-1 text-sm ${glassInput} outline-none focus:text-white`}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className={`px-3 ${glassButton} flex items-center justify-center`}
                        >
                            <Send size={14} className="text-neutral-300" />
                        </button>
                    </div>
                </>
            )}
        </div>
    );

    if (embedded) {
        return Content;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 font-mono">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.1 }}
                        className="origin-bottom-right" // Helps animation origin
                    >
                        {Content}
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className={`flex items-center justify-center w-16 h-16 ${glassButton} rounded-full shadow-2xl backdrop-blur-md bg-black/50 border border-white/20`}
                >
                    <MessageSquare size={28} className="text-sky-400" />
                </motion.button>
            )}
        </div>
    );
};
