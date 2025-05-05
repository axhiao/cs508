'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const userIdParam = searchParams.get('userId');
    if (userIdParam && currentUserId && parseInt(userIdParam, 10) !== currentUserId) {
      const userIdNum = parseInt(userIdParam, 10);
      let user = conversations.find(c => c.user_id === userIdNum);
      if (user) {
        setSelectedUser(user);
      } else {
        fetch(`/api/users/${userIdNum}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.user_id) {
              setSelectedUser({
                user_id: data.user_id,
                username: data.username,
                last_message: '',
                unread_count: 0,
              });
            }
          });
      }
    } else if (userIdParam && currentUserId && parseInt(userIdParam, 10) === currentUserId) {
      setSelectedUser(null); // 不允许和自己聊天
    }
  }, [searchParams, currentUserId]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.user_id);
    }
  }, [selectedUser]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch conversations');
      }

      setConversations(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await fetch(`/api/messages?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch messages');
      }

      setMessages(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver_id: selectedUser.user_id,
          content: newMessage.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      setNewMessage('');
      fetchMessages(selectedUser.user_id);
    } catch (error) {
      setError(error.message);
    }
  };

  // 判断是否允许输入消息：只要selectedUser存在即可
  const canSendMessage = !!selectedUser;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-gray-600">
          Chat with other users about listings and transactions.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Conversations</h2>
          </div>
          <div className="divide-y">
            {conversations.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No conversations yet</p>
            ) : (
              conversations.filter(conversation => conversation.user_id !== currentUserId).map((conversation) => (
                <button
                  key={conversation.user_id}
                  onClick={async () => {
                    // 标记消息为已读
                    await fetch('/api/messages', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: conversation.user_id })
                    });
                    setSelectedUser(conversation);
                    // 不再手动 fetchMessages
                    setTimeout(fetchConversations, 500);
                  }}
                  className={`w-full p-4 text-left hover:bg-gray-50 ${
                    selectedUser?.user_id === conversation.user_id
                      ? 'bg-blue-50'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{conversation.username}</p>
                      <p className="text-sm text-gray-500">
                        {conversation.last_message}
                      </p>
                    </div>
                    {conversation.unread_count > 0 && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-md">
          {selectedUser ? (
            <>
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">
                  Chat with {selectedUser.username}
                </h2>
              </div>
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <p className="text-gray-400 text-center">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.message_id}
                      className={`flex ${
                        message.sender_id === selectedUser.user_id
                          ? 'justify-start'
                          : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender_id === selectedUser.user_id
                            ? 'bg-gray-100'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender_id === selectedUser.user_id
                              ? 'text-gray-500'
                              : 'text-blue-100'
                          }`}
                        >
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    disabled={!canSendMessage}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || !canSendMessage}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="h-96 flex items-center justify-center text-gray-500">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 