import { useState, useEffect, useRef } from 'react';
import BottomNav from '../../components/pages/BottomNav/BottomNav';
import './InquiriesPage.css';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  text: string;
  userId: number;
  createdAt: string;
  user: { id: number; firstName: string };
}

interface Inquiry {
  id: number;
  status: string;
  property: { id: number; title: string; price: number };
  user: { id: number; firstName: string; username: string };
  messages?: Message[];
}

export default function InquiriesPage() {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [showAmount, setShowAmount] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const [listOpen, setListOpen] = useState(false); // ← вернул

  // Получаем userId из initData (основной способ) или из initDataUnsafe (запасной)
  const getUserId = (): number | undefined => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return undefined;

    // Способ 1: парсим initData (надёжнее)
    try {
      const initData = (tg as any).initData || '';
      const params = new URLSearchParams(initData);
      const userStr = params.get('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch (e) {}

    // Способ 2: initDataUnsafe (если вдруг сработает)
    return tg.initDataUnsafe?.user?.id;
  };

  const userId = getUserId();

  const fetchInquiries = async () => {
    const res = await fetch(
      'https://realty-bot-prod.onrender.com/api/inquiries',
      {
        headers: { 'x-user-id': String(userId) },
      },
    );
    const data = await res.json();
    setInquiries(data);
  };

  const fetchMessages = async (inquiryId: number) => {
    const res = await fetch(
      `https://realty-bot-prod.onrender.com/api/inquiries/${inquiryId}/messages`,
    );
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId);
      const interval = setInterval(() => fetchMessages(selectedId), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedId]);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !selectedId) return;
    await fetch(
      `https://realty-bot-prod.onrender.com/api/inquiries/${selectedId}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(userId), text }),
      },
    );
    setText('');
    fetchMessages(selectedId);
  };

  const updateStatus = async (inquiryId: number, status: string) => {
    const body: any = { status };
    if (status === 'done' && amount) {
      if (Number(amount) <= 0) {
        alert('Сумма сделки не может равняться нулю или быть ниже.');
      }
      body.amount = Number(amount);
    }
    await fetch(
      `https://realty-bot-prod.onrender.com/api/inquiries/${inquiryId}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(userId),
        },
        body: JSON.stringify(body),
      },
    );
    setShowAmount(false);
    setAmount('');
    fetchInquiries();
  };

  const selected = inquiries.find((i) => i.id === selectedId);

  return (
    <div className="page inquiries-page">
      <h2>📋 Чат</h2>

      <button className="inquiries-toggle" onClick={() => setListOpen(true)}>
        ☰
      </button>

      {listOpen && (
        <div
          className="inquiries-overlay inquiries-overlay--open"
          onClick={() => setListOpen(false)}
        />
      )}

      <div className="inquiries-layout">
        <div
          className={`inquiries-list ${listOpen ? 'inquiries-list--open' : ''}`}
        >
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className={`inquiry-item ${selectedId === inq.id ? 'inquiry-item--active' : ''}`}
              onClick={() => {
                setSelectedId(inq.id);
                setShowAmount(false);
                setListOpen(false);
              }}
            >
              <strong>{inq.property?.title || 'Без названия'}</strong>
              <div
                className="chat-message__avatar"
                onClick={() => navigate(`/profile/${inq.user?.id}`)}
              >
                {inq.user?.firstName?.charAt(0) || '?'}
              </div>
              <span>👤 {inq.user?.firstName}</span>
              <span className={`inquiry-status inquiry-status--${inq.status}`}>
                {inq.status === 'new'
                  ? '🆕'
                  : inq.status === 'in_progress'
                    ? '🔄'
                    : '✅'}
              </span>
            </div>
          ))}
        </div>
        <div className="inquiries-chat">
          {selected ? (
            <>
              <div className="chat-header">
                <div>
                  <strong>{selected.property?.title}</strong>
                  <span className="chat-header__price">
                    {selected.property?.price} zł/мес
                  </span>
                </div>
                <div className="chat-actions">
                  {selected.status === 'new' && (
                    <button
                      onClick={() => updateStatus(selected.id, 'in_progress')}
                    >
                      🔄 В работу
                    </button>
                  )}
                  {selected.status === 'in_progress' && (
                    <>
                      {!showAmount ? (
                        <button onClick={() => setShowAmount(true)}>
                          ✅ Завершить
                        </button>
                      ) : (
                        <div className="chat-amount">
                          <input
                            type="number"
                            placeholder="Сумма сделки"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                          <button
                            onClick={() => updateStatus(selected.id, 'done')}
                          >
                            ✓
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="chat-messages" ref={chatRef}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-message ${msg.userId === Number(userId) ? 'chat-message--mine' : ''}`}
                  >
                    <div
                      className="chat-message__avatar"
                      onClick={() => navigate(`/profile/${msg.user?.id}`)}
                    >
                      {msg.user?.firstName?.charAt(0) || '?'}
                    </div>
                    <div className="chat-message__bubble">{msg.text}</div>
                    <div className="chat-message__time">
                      {new Date(msg.createdAt).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-input">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Сообщение..."
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>➤</button>
              </div>
            </>
          ) : (
            <div className="chat-empty">Выберите заявку</div>
          )}
        </div>
      </div>

      <BottomNav activeTab="inquiries" />
    </div>
  );
}
