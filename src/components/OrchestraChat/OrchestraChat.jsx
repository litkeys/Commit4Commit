import { AtSign, FileCode, Paperclip, RotateCcw, Settings } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { sendMessage } from '../../utils/orchestraApi';
import { parseBullets, parseResponse } from '../../utils/parseOrchestralResponse';
import { useEditorStore } from '../../state/useEditorStore';
import './OrchestraChat.css';

const QUICK_ACTIONS = [
  'Explain',
  'Refactor',
  'Write tests',
  'Fix bug',
  'Optimize',
  'Add types',
  'Document',
  'Find leaks',
];

export default function OrchestraChat() {
  const { state, dispatch } = useEditorStore();
  const { activeTabId, chatInput, chatIsTyping, chatMessages, fileContents, openTabs } = state;
  const [appliedActions, setAppliedActions] = useState({});
  const [copiedBlocks, setCopiedBlocks] = useState({});
  const activeTab = openTabs.find((tab) => tab.id === activeTabId) ?? null;
  const activeFile = activeTab?.name ?? null;
  const isLoading = chatIsTyping;
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const quickActionTimeoutRef = useRef(null);
  const actionTimeoutsRef = useRef(new Map());
  const copyTimeoutsRef = useRef(new Map());

  const quickActionPrompts = {
    Explain: `Explain what ${activeFile ?? 'this file'} does. Be concise.`,
    Refactor: `Suggest a refactor for ${activeFile ?? 'this code'}. Show the improved version.`,
    'Write tests': `Write a complete test suite for ${activeFile ?? 'this file'} using Jest and React Testing Library.`,
    'Fix bug': `Analyze ${activeFile ?? 'this file'} for bugs and show the fix.`,
    Optimize: `What are the top 3 performance improvements for ${activeFile ?? 'this code'}?`,
    'Add types': `Add TypeScript types to ${activeFile ?? 'this file'}. Show the typed version.`,
    Document: `Write JSDoc comments for every function in ${activeFile ?? 'this file'}.`,
    'Find leaks': `Identify all memory leaks in ${activeFile ?? 'this file'} and show the cleanup code.`,
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatIsTyping]);

  useEffect(() => {
    return () => {
      window.clearTimeout(quickActionTimeoutRef.current);
      actionTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      copyTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  const handleSend = async (overrideContent = null) => {
    const content = (overrideContent ?? chatInput).trim();

    if (!content || isLoading) {
      return;
    }

    const activeChatTab = openTabs.find((tab) => tab.id === activeTabId) ?? null;
    const currentActiveFile = activeChatTab?.name ?? null;
    const activeContent = activeChatTab?.path ? fileContents[activeChatTab.path] : null;
    const fileContext = activeContent
      ? `\n\nHere is the current content of ${currentActiveFile}:\n\`\`\`\n${activeContent.slice(0, 2000)}\n\`\`\``
      : '';

    const userMsg = {
      id: `u_${Date.now()}`,
      role: 'user',
      content,
      file: currentActiveFile,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    dispatch({ type: 'SEND_CHAT_MESSAGE', payload: userMsg });
    dispatch({ type: 'SET_CHAT_INPUT', payload: '' });
    dispatch({ type: 'SET_CHAT_TYPING', payload: true });

    try {
      const history = [...chatMessages, userMsg]
        .slice(-10)
        .map((message) => ({ role: message.role, content: message.content }));

      const responseText = await sendMessage(history, currentActiveFile, fileContext);
      const blocks = parseResponse(responseText);
      const codeBlock = blocks.find((block) => block.type === 'code');
      const proseBlocks = blocks.filter((block) => block.type === 'prose');
      const mainProse = proseBlocks.map((block) => block.content).join('\n\n').trim();
      const parsed = parseBullets(mainProse);

      const agentMsg = {
        id: `a_${Date.now()}`,
        role: 'agent',
        content: parsed.type === 'mixed' ? parsed.intro : mainProse,
        bullets: parsed.type === 'mixed' ? parsed.bullets : null,
        hasCode: !!codeBlock,
        codeBlock: codeBlock?.content ?? null,
        language: codeBlock?.language ?? null,
        action: codeBlock
          ? codeBlock.language === 'test' || mainProse.toLowerCase().includes('test')
            ? 'INSERT AT CURSOR'
            : 'APPLY TO FILE'
          : null,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isReal: true,
      };

      dispatch({ type: 'RECEIVE_CHAT_RESPONSE', payload: agentMsg });
    } catch (error) {
      dispatch({
        type: 'RECEIVE_CHAT_RESPONSE',
        payload: {
          id: `e_${Date.now()}`,
          role: 'agent',
          content: `API error: ${error.message}. Check your VITE_GROQ_API_KEY in .env.`,
          hasCode: false,
          bullets: null,
          action: null,
          isError: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      });
    }
  };

  const handleQuickAction = (chipLabel) => {
    if (isLoading) {
      return;
    }

    const prompt = quickActionPrompts[chipLabel] ?? chipLabel;
    dispatch({ type: 'SET_CHAT_INPUT', payload: prompt });

    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });

    window.clearTimeout(quickActionTimeoutRef.current);
    quickActionTimeoutRef.current = window.setTimeout(() => {
      handleSend(prompt);
    }, 50);
  };

  const handleAction = (key) => {
    window.clearTimeout(actionTimeoutsRef.current.get(key));
    setAppliedActions((current) => ({ ...current, [key]: true }));

    const timeoutId = window.setTimeout(() => {
      setAppliedActions((current) => ({ ...current, [key]: false }));
      actionTimeoutsRef.current.delete(key);
    }, 1500);

    actionTimeoutsRef.current.set(key, timeoutId);
  };

  const handleCopy = async (key, codeBlock) => {
    try {
      await navigator.clipboard?.writeText(codeBlock);
    } catch {}

    window.clearTimeout(copyTimeoutsRef.current.get(key));
    setCopiedBlocks((current) => ({ ...current, [key]: true }));

    const timeoutId = window.setTimeout(() => {
      setCopiedBlocks((current) => ({ ...current, [key]: false }));
      copyTimeoutsRef.current.delete(key);
    }, 1500);

    copyTimeoutsRef.current.set(key, timeoutId);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="orchestra-root orchestra-chat">
      <header className="orch-header">
        <div className="orch-header-brand">
          <span className="orch-asterisk">✳</span>
          <span className="orch-name-main">ORCHESTRA</span>
        </div>

        <div className="orch-header-actions">
          <button
            className="orch-header-icon"
            type="button"
            aria-label="Clear Orchestra chat"
            onClick={() => dispatch({ type: 'CLEAR_CHAT' })}
          >
            <RotateCcw size={13} strokeWidth={1.5} />
          </button>
          <button className="orch-header-icon" type="button" aria-label="Orchestra settings">
            <Settings size={13} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <div className="orch-context-bar">
        <FileCode size={10} strokeWidth={1.5} />
        <span className="orch-context-file">{activeFile ?? 'No file selected'}</span>
        <span className="orch-context-range">LN 14-28</span>
      </div>

      <div className="orch-messages">
        <div className="orch-messages-scroll">
          {chatMessages.map((message) =>
            message.role === 'user' ? (
              <div key={message.id} className="orch-msg-user">
                <span className="orch-msg-label-user">
                  YOU
                  <span className="orch-msg-label-time">{message.time}</span>
                </span>
                <p className="orch-msg-text-user">{message.content}</p>
                {message.file ? <span className="orch-msg-ref">{message.file}</span> : null}
              </div>
            ) : (
              <div key={message.id} className="orch-msg-agent">
                <span className="orch-msg-label-agent">ORCHESTRA · {message.time}</span>
                <div className="orch-msg-bubble">
                  <div className="orch-msg-blocks">
                    {message.content ? <p className="orch-msg-text">{message.content}</p> : null}

                    {message.bullets?.length ? (
                      <ul className="orch-msg-bullets">
                        {message.bullets.map((bullet, index) => (
                          <li key={`${message.id}-${index}`}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}

                    {message.hasCode && message.codeBlock ? (
                      <div className="orch-code-block">
                        <div className="orch-code-header">
                          <span className="orch-code-lang">{message.language}</span>
                          <button
                            className="orch-code-copy"
                            type="button"
                            onClick={() => handleCopy(String(message.id), message.codeBlock)}
                          >
                            {copiedBlocks[String(message.id)] ? 'COPIED' : 'COPY'}
                          </button>
                        </div>
                        <pre className="orch-code-pre">
                          <code>{message.codeBlock}</code>
                        </pre>
                      </div>
                    ) : null}

                    {message.action ? (
                      <div className="orch-action-row">
                        <button
                          className={appliedActions[String(message.id)] ? 'orch-action-btn applied' : 'orch-action-btn'}
                          type="button"
                          onClick={() => handleAction(String(message.id))}
                        >
                          {appliedActions[String(message.id)] ? '✓ Applied' : message.action}
                        </button>
                      </div>
                    ) : null}

                    {message.isError ? <span className="orch-msg-error-badge">API ERROR</span> : null}
                  </div>
                </div>
              </div>
            )
          )}

          {chatIsTyping ? (
            <div className="orch-typing" aria-label="Orchestra is typing">
              <span />
              <span />
              <span />
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="orch-quick-bar">
        {QUICK_ACTIONS.map((chip) => (
          <button
            key={chip}
            className="orch-quick-chip"
            type="button"
            onClick={() => handleQuickAction(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="orch-input-area">
        <textarea
          ref={textareaRef}
          className="orch-textarea"
          disabled={isLoading}
          rows={2}
          placeholder={`@${activeFile ?? 'file'}  Ask Orchestra...`}
          value={chatInput}
          onChange={(event) => dispatch({ type: 'SET_CHAT_INPUT', payload: event.target.value })}
          onKeyDown={handleKeyDown}
        />
        <div className="orch-input-footer">
          <div className="orch-input-icons">
            <button className="orch-icon-btn" type="button" aria-label="Attach context">
              <Paperclip size={13} strokeWidth={1.5} />
            </button>
            <button className="orch-icon-btn" type="button" aria-label="Mention file">
              <AtSign size={13} strokeWidth={1.5} />
            </button>
          </div>
          <button
            className={isLoading ? 'orch-send-btn orch-send-loading' : 'orch-send-btn'}
            disabled={isLoading}
            type="button"
            onClick={() => handleSend()}
          >
            {isLoading ? '...' : '↵ SEND'}
          </button>
        </div>
      </div>
    </div>
  );
}
