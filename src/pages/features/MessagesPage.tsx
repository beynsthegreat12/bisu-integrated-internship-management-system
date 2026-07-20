import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  const { user } = useAuth()
  const [selectedPartner, setSelectedPartner] = useState<number | null>(null)
  const [messageInput, setMessageInput] = useState('')

  const { data: conversations } = trpc.message.listConversations.useQuery()
  const { data: messages } = trpc.message.getThread.useQuery(
    { partnerId: selectedPartner! },
    { enabled: !!selectedPartner }
  )
  const sendMutation = trpc.message.send.useMutation()
  const utils = trpc.useUtils()

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPartner || !messageInput.trim()) return
    sendMutation.mutate(
      { receiverId: selectedPartner, content: messageInput.trim() },
      {
        onSuccess: () => {
          setMessageInput('')
          utils.message.getThread.invalidate({ partnerId: selectedPartner })
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">Messages</h1>
        <p className="text-gray-500 mt-1">Real-time communication with students, coordinators, and supervisors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-240px)]">
        {/* Conversations List */}
        <Card className="border-0 shadow-sm lg:col-span-1 overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-sm">Conversations</h2>
            </div>
            <div className="overflow-y-auto h-full max-h-[calc(100vh-300px)]">
              {(!conversations || conversations.length === 0) ? (
                <div className="p-8 text-center text-gray-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv: any) => (
                  <button
                    key={conv.partnerId}
                    onClick={() => setSelectedPartner(conv.partnerId)}
                    className={`w-full flex items-center gap-3 p-4 border-b hover:bg-gray-50 transition-colors text-left ${
                      selectedPartner === conv.partnerId ? 'bg-[#7B1F3A]/5 border-l-2 border-l-[#7B1F3A]' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#7B1F3A] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-white">U</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">User #{conv.partnerId}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{conv.lastMessage?.content}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-[#7B1F3A] text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="border-0 shadow-sm lg:col-span-2 flex flex-col overflow-hidden">
          {selectedPartner ? (
            <>
              <div className="p-4 border-b">
                <p className="font-semibold">Chat with User #{selectedPartner}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                        msg.senderId === user?.id
                          ? 'bg-[#7B1F3A] text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.senderId === user?.id ? 'text-white/70' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" className="bg-[#7B1F3A] hover:bg-[#7B1F3A]/90" disabled={sendMutation.isPending || !messageInput.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
