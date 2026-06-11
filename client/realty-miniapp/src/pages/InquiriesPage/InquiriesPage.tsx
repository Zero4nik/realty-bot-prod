import { useState, useEffect, useRef } from 'react';
import BottomNav from '../../components/pages/BottomNav/BottomNav';
import './InquiriesPage.css';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
  property: { id: number; title: string; price: number; city: string };
  user: { id: number; firstName: string; username: string };
  messages?: Message[];
}

export default function InquiriesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [brokerPercent, setBrokerPercent] = useState('0');
  const [showAmount, setShowAmount] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const [listOpen, setListOpen] = useState(false);

  const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  const [currentUserDbId, setCurrentUserDbId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!telegramId) return;
    fetch(`https://realty-bot-prod-1.onrender.com/api/users/${telegramId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (user?.id) setCurrentUserDbId(user.id);
        if (user?.role === 'admin') setIsAdmin(true);
      })
      .catch(() => {});
  }, [telegramId]);

  const fetchInquiries = async () => {
    const res = await fetch(
      'https://realty-bot-prod-1.onrender.com/api/inquiries',
      {
        headers: { 'x-user-id': String(telegramId) },
      },
    );
    const data = await res.json();
    setInquiries(data);
  };

  const fetchMessages = async (inquiryId: number) => {
    const res = await fetch(
      `https://realty-bot-prod-1.onrender.com/api/inquiries/${inquiryId}/messages`,
    );
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  useEffect(() => {
    const inquiryParam = searchParams.get('inquiry');
    if (!inquiryParam || inquiries.length === 0) return;

    const inquiryId = Number(inquiryParam);
    if (inquiries.some((inq) => inq.id === inquiryId)) {
      setSelectedId(inquiryId);
    }
  }, [inquiries, searchParams]);
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
      `https://realty-bot-prod-1.onrender.com/api/inquiries/${selectedId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(telegramId),
        },
        body: JSON.stringify({ text }),
      },
    );
    setText('');
    fetchMessages(selectedId);
  };

  const resetCompleteForm = () => {
    setShowAmount(false);
    setAmount('');
    setBrokerPercent('0');
  };

  const updateStatus = async (inquiryId: number, status: string) => {
    const body: { status: string; amount?: number; brokerPercent?: number } =
      { status };

    if (status === 'done') {
      if (Number(amount) <= 0) {
        alert('Сумма сделки не может равняться нулю или быть ниже.');
        return;
      }
      const percent = Number(brokerPercent);
      if (percent < 0 || percent > 100) {
        alert('Процент брокера должен быть от 0 до 100.');
        return;
      }
      body.amount = Number(amount);
      body.brokerPercent = percent;
    }

    const res = await fetch(
      `https://realty-bot-prod-1.onrender.com/api/inquiries/${inquiryId}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(telegramId),
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      alert('Не удалось завершить сделку');
      return;
    }

    resetCompleteForm();
    fetchInquiries();
  };

  const selected = inquiries.find((i) => i.id === selectedId);

  const getSenderLabel = (msg: Message) => {
    if (!selected) return '?';
    return msg.userId === selected.user?.id ? '👤 Покупатель' : '👔 Агент';
  };

  const getSenderInitial = (msg: Message) => {
    if (!selected) return '?';
    return msg.userId === selected.user?.id ? 'П' : 'А';
  };

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
                resetCompleteForm();
                setListOpen(false);
              }}
            >
              <strong>{inq.property?.title || 'Без названия'}</strong>
              <span>👤 {inq.user?.firstName}</span>
              <span className={`inquiry-status inquiry-status--${inq.status}`}>
                {inq.status === 'new'
                  ? '🆕'
                  : inq.status === 'done'
                    ? '✅'
                    : '🔄'}
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
                  {isAdmin && selected.status === 'new' && !showAmount && (
                    <button onClick={() => setShowAmount(true)}>
                      ✅ Завершить
                    </button>
                  )}
                </div>
              </div>

              {isAdmin && showAmount && selected.status === 'new' && (
                <div className="chat-complete-form">
                  <input
                    type="number"
                    placeholder="Сумма сделки"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Процент брокера %"
                    value={brokerPercent}
                    min={0}
                    max={100}
                    onChange={(e) => setBrokerPercent(e.target.value)}
                  />
                  <button
                    onClick={() => updateStatus(selected.id, 'done')}
                  >
                    Сохранить
                  </button>
                  <button
                    className="chat-complete-form__cancel"
                    onClick={resetCompleteForm}
                  >
                    Отмена
                  </button>
                </div>
              )}

              <div className="chat-inquiry-card">
                <strong>🏠 {selected.property?.title}</strong>
                <p>📍 {`Город:${selected.property?.city}`}</p>
                <p>💰 {selected.property?.price} zł/мес</p>
                <p>👤 Клиент: {selected.user?.firstName}</p>
              </div>

              <div className="chat-messages" ref={chatRef}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-message ${msg.userId === currentUserDbId ? 'chat-message--mine' : ''}`}
                  >
                    <div
                      className="chat-message__avatar"
                      onClick={() => navigate(`/profile/${msg.user?.id}`)}
                    >
                      {getSenderInitial(msg)}
                    </div>
                    <div>
                      <div className="chat-message__sender">
                        {getSenderLabel(msg)}
                      </div>
                      <div className="chat-message__bubble">{msg.text}</div>
                      <div className="chat-message__time">
                        {new Date(msg.createdAt).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
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
