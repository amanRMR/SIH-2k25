



import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import { API_CONFIG } from '../../utils/api';
import { MessageSquare, Globe, Mic, Power, ChevronDown, ChevronUp, Languages, WifiOff } from 'lucide-react';

const INDIAN_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'pa', name: 'Punjabi' }
];

const LiveTranslationPanel = ({ patientAadhaar }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [targetLanguage, setTargetLanguage] = useState('English');
    const [isOnline, setIsOnline] = useState(false); // Toggle state
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [connectionError, setConnectionError] = useState(null); // Track connection errors
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const messagesEndRef = useRef(null);

    const hospitalId = user?.hospitalId || user?.id || user?._id || user?.data?.hospitalId || user?.data?.id || user?.data?._id || user?.user?.id || user?.user?._id;

    // ... (existing helper functions) ...

    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]); // Send only base64 data, remove header
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const base64Audio = await blobToBase64(audioBlob);

                if (socket && isOnline) {
                    socket.emit("doctor_voice_message", {
                        room: hospitalId,
                        audio: base64Audio,
                        mimeType: "audio/webm"
                    });

                    // Optimistically add to messages
                    setMessages(prev => [...prev, {
                        id: Date.now(),
                        text: "Sent voice message...", // Placeholder or show nothing
                        sender: "Doctor", // Self
                        timestamp: new Date().toISOString(),
                        isSystem: true
                    }]);
                }

                // Stop all tracks to release mic
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // ... (existing helper functions) ...

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!isCollapsed) {
            scrollToBottom();
        }
    }, [messages, isCollapsed]);

    useEffect(() => {
        if (!hospitalId || !isOnline) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnectionError(null);
            }
            return;
        }

        // Initialize socket connection only when Online
        const socketInstance = io(API_CONFIG.baseURL || 'http://13.201.85.159:3000', {
            transports: ['polling', 'websocket'], // Try polling first which might work better with some proxies
            reconnectionAttempts: 5
        });

        socketInstance.on('connect', () => {
            console.log('Connected to LIVE translation service');
            setConnectionError(null);

            // Join rooms
            socketInstance.emit('join_room', hospitalId);
            if (patientAadhaar) {
                socketInstance.emit('join_room', patientAadhaar);
            }

            // Set initial language
            socketInstance.emit('change_language', {
                hospitalId,
                aadhaar: patientAadhaar,
                targetLanguage
            });
        });

        socketInstance.on('connect_error', (err) => {
            console.error('Socket Connection Error:', err);
            // Detect Mixed Content Error
            if (window.location.protocol === 'https:' && (API_CONFIG.baseURL || 'http://13.201.85.159:3000').includes('http:')) {
                setConnectionError('MIXED_CONTENT');
                console.warn('⚠️ MIXED CONTENT ERROR: Your site is HTTPS but backend is HTTP.');
            } else {
                setConnectionError('CONNECTION_FAILED');
            }
        });

        socketInstance.on('receive_translated_message', (data) => {
            setMessages((prev) => [...prev, {
                id: Date.now(),
                text: data.text,
                sender: data.originalSender,
                timestamp: new Date().toISOString(),
                isSystem: false
            }]);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [hospitalId, patientAadhaar, isOnline]);

    // Update language when dropdown changes
    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setTargetLanguage(newLang);

        if (socket && isOnline) {
            // Emit with both formats to ensure backend compatibility
            const payload = {
                room: hospitalId,
                language: newLang,
                // Also include alternative format
                hospitalId,
                aadhaar: patientAadhaar,
                targetLanguage: newLang
            };

            socket.emit('change_language', payload);
            console.log('✅ Language change emitted:', {
                room: hospitalId,
                language: newLang,
                patientAadhaar,
                socketConnected: socket.connected
            });
        } else {
            console.warn('⚠️ Cannot emit language change:', {
                hasSocket: !!socket,
                isOnline,
                socketConnected: socket?.connected
            });
        }
    };

    // Toggle Online/Offline
    const toggleOnline = () => {
        setIsOnline(!isOnline);
        if (!isOnline) setConnectionError(null); // Reset error when turning on
    };

    // ... (render return) ...
    // Note: I will replace the internal rendering logic for chat history below

    if (!hospitalId) return null;

    return (
        <div className={`fixed right-4 bottom-4 w-96 bg-white rounded-t-xl shadow-2xl border border-gray-200 flex flex-col transition-all duration-300 z-50 ${isCollapsed ? 'h-14' : 'h-[500px]'}`}>
            {/* Header - Green Background */}
            <div
                className={`text-white p-3 flex items-center justify-between rounded-t-xl cursor-pointer ${connectionError === 'MIXED_CONTENT' ? 'bg-amber-600' : 'bg-[#006B61]'}`}
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-bold text-base">Live Translation</span>
                    {patientAadhaar && <span className="text-xs bg-white/20 px-2 py-0.5 rounded">#{patientAadhaar.slice(-4)}</span>}
                </div>

                <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                    {/* Online/Offline Toggle */}
                    <button
                        onClick={toggleOnline}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${isOnline ? 'bg-white text-[#006B61]' : 'bg-red-500 text-white'}`}
                    >
                        <Power className="w-3 h-3" />
                        {isOnline ? 'ON' : 'OFF'}
                    </button>

                    {/* Expand/Collapse Icon */}
                    <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-white/80 hover:text-white">
                        {isCollapsed ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Main Area */}
            {!isCollapsed && (
                <>
                    {/* Language Selector Bar */}
                    <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Globe className="w-4 h-4 text-[#006B61]" />
                            <span className="font-medium">Translate to:</span>
                        </div>
                        <div className="relative">
                            <select
                                value={targetLanguage}
                                onChange={handleLanguageChange}
                                className="appearance-none bg-white border border-gray-300 text-gray-700 py-1 pl-3 pr-8 rounded text-sm focus:outline-none focus:border-[#006B61] cursor-pointer"
                            >
                                {INDIAN_LANGUAGES.map((lang) => (
                                    <option key={lang.code} value={lang.name}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                            <Languages className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    {/* Chat History */}
                    <div className="flex-1 bg-white overflow-y-auto p-4 space-y-3">
                        {!isOnline ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                                <Power className="w-10 h-10 mb-2" />
                                <p className="text-sm">Translation is OFF</p>
                            </div>
                        ) : connectionError === 'MIXED_CONTENT' ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 p-2">
                                <span className="bg-amber-100 text-amber-600 p-2 rounded-full"><WifiOff className="w-6 h-6" /></span>
                                <div>
                                    <h4 className="font-bold text-amber-700 text-sm">Connection Blocked</h4>
                                    <p className="text-xs text-amber-600 mt-1">Browser is blocking insecure connection.</p>
                                </div>
                                <div className="text-[10px] text-gray-500 bg-gray-50 p-2 rounded text-left w-full border border-gray-100">
                                    <strong>To Fix:</strong><br />
                                    1. Click "Lock" icon 🔒 in address bar.<br />
                                    2. Go to <b>Site Settings</b>.<br />
                                    3. Set "Insecure content" to <b>Allow</b>.<br />
                                    4. Reload page.
                                </div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                                <Mic className="w-10 h-10 mb-2" />
                                <p className="text-sm">Waiting for patient speech...</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className="animate-fadeIn">
                                    <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none border border-gray-100 shadow-sm ml-2">
                                        <p className="text-gray-800 text-sm leading-relaxed">{msg.text}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 ml-2 mt-1 block">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Bottom Status */}
                    {isOnline && !connectionError && (
                        <div className="p-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between px-4">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="text-xs font-medium text-gray-500">Listening...</span>
                            </div>

                            {/* Record Button for Doctor */}
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${isRecording
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {isRecording ? (
                                    <>
                                        <div className="w-2 h-2 bg-white rounded-sm" />
                                        <span>Stop</span>
                                    </>
                                ) : (
                                    <>
                                        <Mic className="w-3.5 h-3.5" />
                                        <span>Reply</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default LiveTranslationPanel;
