import React, { useState } from 'react';
import API from '../api';
import { Bot, X, Mic, Volume2, Globe, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AIHealthAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('EN'); // 'EN' or 'TA'
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am NextGen AI Health Assistant. Describe your symptoms or ask about hospital services, lab reports, or OPD queue status.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const navigate = useNavigate();

  const toggleLanguage = (lang) => {
    setLanguage(lang);
    if (lang === 'TA') {
      setMessages([
        {
          sender: 'ai',
          text: 'வணக்கம்! நான் NextGen AI Assistant. உங்களுக்கு எப்படி உதவலாம்? உங்கள் அறிகுறிகள் அல்லது மருத்துவமனை சேவைகள் குறித்து கேளுங்கள்.'
        }
      ]);
    } else {
      setMessages([
        {
          sender: 'ai',
          text: 'Hello! I am NextGen AI Health Assistant. Describe your symptoms or ask about hospital services, lab reports, or OPD queue status.'
        }
      ]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await API.post('ai/symptom-assistant/', { symptoms: userMsg });
      const aiData = res.data;

      let replyText = language === 'TA'
        ? `உங்களின் அறிகுறிகள் ஆய்வு செய்யப்பட்டன:\nபரிந்துரைக்கப்பட்ட பிரிவு: ${aiData.department}\nபாதுகாப்பு நிலை: ${aiData.badge}\n${aiData.clinical_guidance}`
        : `Triage Assessment: ${aiData.badge}\nRecommended Department: ${aiData.department}\n${aiData.clinical_guidance}`;

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: replyText,
          department: aiData.department,
          badge: aiData.badge
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: language === 'TA' ? 'மன்னிக்கவும், பதிலை செயலாக்க முடியவில்லை.' : 'I am here to assist you with general hospital inquiries, appointment booking, and diagnostic guidance.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceSimulate = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setInput(language === 'TA' ? 'எனக்கு தலைவலி மற்றும் காய்ச்சல் உள்ளது' : 'Severe headache and high fever for 2 days');
    }, 1500);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div style={floatingTriggerStyle} onClick={() => setIsOpen(!isOpen)} title="NextGen AI Health Assistant">
        <Bot size={26} color="#FFFFFF" />
        <span style={pulseDotStyle}></span>
      </div>

      {/* AI Chat Drawer Window */}
      {isOpen && (
        <div style={widgetWindowStyle}>
          <div style={widgetHeaderStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={botAvatarStyle}><Bot size={18} color="#FFFFFF" /></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>NextGen AI Assistant</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--brand-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-success)', display: 'inline-block' }}></span> Active Clinical Support
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => toggleLanguage(language === 'EN' ? 'TA' : 'EN')}
                style={langToggleBtnStyle}
                title="Switch Language">
                <Globe size={13} /> {language === 'EN' ? 'தமிழ்' : 'English'}
              </button>
              <button onClick={() => setIsOpen(false)} style={closeBtnStyle}><X size={18} /></button>
            </div>
          </div>

          <div style={disclaimerBannerStyle}>
            ⚠️ NextGen AI Assistant provides decision-support information and does not replace a doctor's diagnosis.
          </div>

          <div style={messageListStyle}>
            {messages.map((m, idx) => (
              <div key={idx} style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '0.75rem 1rem',
                borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                background: m.sender === 'user' ? 'var(--brand-primary)' : 'var(--bg-subtle)',
                color: m.sender === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                fontSize: '0.88rem',
                lineHeight: '1.45',
                border: m.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                {m.department && (
                  <button
                    onClick={() => { setIsOpen(false); navigate('/appointments', { state: { department: m.department } }); }}
                    style={bookActionBtnStyle}>
                    📅 Book {m.department} Consultation
                  </button>
                )}
              </div>
            ))}
            {loading && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI analyzing symptoms...</div>}
          </div>

          <form onSubmit={handleSend} style={inputFormStyle}>
            <input
              type="text"
              placeholder={isRecording ? 'Listening...' : language === 'TA' ? 'இங்கே தட்டச்சு செய்யவும்...' : 'Type symptoms or health questions...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={inputStyle}
            />
            <button type="button" onClick={handleVoiceSimulate} style={{ ...iconBtnStyle, color: isRecording ? '#EF4444' : 'var(--text-muted)' }} title="Voice Input">
              <Mic size={16} />
            </button>
            <button type="submit" style={sendBtnStyle} disabled={!input.trim()}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

const floatingTriggerStyle = {
  position: 'fixed', bottom: '24px', right: '24px', width: '56px', height: '56px',
  borderRadius: '50%', background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)', display: 'flex', alignItems: 'center',
  justifyContent: 'center', cursor: 'pointer', zIndex: 9999, transition: 'transform 0.2s ease'
};

const pulseDotStyle = {
  position: 'absolute', top: '2px', right: '2px', width: '12px', height: '12px',
  borderRadius: '50%', background: '#10B981', border: '2px solid #FFFFFF'
};

const widgetWindowStyle = {
  position: 'fixed', bottom: '90px', right: '24px', width: '380px', height: '520px',
  background: 'var(--bg-card)', borderRadius: '18px', boxShadow: 'var(--shadow-lg)',
  border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column',
  overflow: 'hidden', zIndex: 9999
};

const widgetHeaderStyle = {
  padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)'
};

const botAvatarStyle = {
  width: '30px', height: '30px', borderRadius: '50%', background: 'var(--brand-primary)',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};

const langToggleBtnStyle = {
  background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px',
  padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-primary)'
};

const closeBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
};

const disclaimerBannerStyle = {
  fontSize: '0.72rem', background: 'var(--status-warning-bg)', color: 'var(--status-warning-text)',
  padding: '0.4rem 0.75rem', borderBottom: '1px solid var(--border-color)'
};

const messageListStyle = {
  flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem'
};

const bookActionBtnStyle = {
  marginTop: '0.5rem', width: '100%', padding: '0.4rem', borderRadius: '6px',
  border: 'none', background: '#10B981', color: '#FFFFFF', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer'
};

const inputFormStyle = {
  display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem',
  borderTop: '1px solid var(--border-color)', background: 'var(--bg-subtle)'
};

const inputStyle = {
  flex: 1, border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 0.75rem',
  fontSize: '0.85rem', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-primary)'
};

const iconBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.3rem'
};

const sendBtnStyle = {
  background: 'var(--brand-primary)', color: '#FFFFFF', border: 'none', borderRadius: '8px',
  width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
};
