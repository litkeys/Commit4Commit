import {
  Command,
  FileCode2,
  LayoutDashboard,
  MessageSquare,
  Sidebar as SidebarIcon,
  Terminal,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../state/useEditorStore';
import './CommandPalette.css';

export default function CommandPalette() {
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const {
    state,
    closeCommandPalette,
    dispatch,
    openFileByPath,
    togglePanel,
    toggleSidebar,
  } = useEditorStore();

  const commands = [
    {
      id: 'open-app',
      label: 'Open File: App.jsx',
      icon: FileCode2,
      action: () => openFileByPath('src/App.jsx'),
    },
    {
      id: 'open-main',
      label: 'Open File: main.jsx',
      icon: FileCode2,
      action: () => openFileByPath('src/main.jsx'),
    },
    {
      id: 'toggle-terminal',
      label: 'Toggle Terminal',
      icon: Terminal,
      action: togglePanel,
    },
    {
      id: 'toggle-sidebar',
      label: 'Toggle Sidebar',
      icon: SidebarIcon,
      action: toggleSidebar,
    },
    {
      id: 'open-chat',
      label: 'Toggle Orchestra Chat',
      icon: MessageSquare,
      action: () => dispatch({ type: 'TOGGLE_RIGHT_PANEL' }),
    },
    {
      id: 'open-dashboard',
      label: 'Toggle Orchestra Dashboard',
      icon: LayoutDashboard,
      action: () =>
        dispatch({
          type: 'SET_EDITOR_VIEW',
          payload: state.editorView === 'dashboard' ? 'monaco' : 'dashboard',
        }),
    },
    {
      id: 'format-document',
      label: 'Format Document',
      icon: Command,
      action: () => {},
    },
    {
      id: 'goto-line',
      label: 'Go to Line...',
      icon: Command,
      action: () => {},
    },
  ];

  const filteredCommands = commands.filter((command) =>
    command.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    if (!state.commandPaletteOpen) {
      return;
    }

    setQuery('');
    setSelectedIndex(0);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [state.commandPaletteOpen]);

  useEffect(() => {
    if (selectedIndex >= filteredCommands.length) {
      setSelectedIndex(0);
    }
  }, [filteredCommands.length, selectedIndex]);

  if (!state.commandPaletteOpen) {
    return null;
  }

  const runCommand = (command) => {
    command.action();
    closeCommandPalette();
  };

  return (
    <div
      className="command-palette"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeCommandPalette();
        }
      }}
    >
      <div className="command-palette__dialog" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="command-palette__input-row">
          <Command size={16} />
          <input
            ref={inputRef}
            className="command-palette__input"
            type="text"
            placeholder="Type a command or file name"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setSelectedIndex((current) =>
                  filteredCommands.length ? (current + 1) % filteredCommands.length : 0
                );
              }

              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setSelectedIndex((current) =>
                  filteredCommands.length
                    ? (current - 1 + filteredCommands.length) % filteredCommands.length
                    : 0
                );
              }

              if (event.key === 'Enter' && filteredCommands[selectedIndex]) {
                event.preventDefault();
                runCommand(filteredCommands[selectedIndex]);
              }

              if (event.key === 'Escape') {
                event.preventDefault();
                closeCommandPalette();
              }
            }}
          />
        </div>

        <div className="command-palette__results">
          {filteredCommands.length ? (
            filteredCommands.map((command, index) => {
              const Icon = command.icon;

              return (
                <button
                  key={command.id}
                  className={
                    index === selectedIndex
                      ? 'command-palette__item command-palette__item--selected'
                      : 'command-palette__item'
                  }
                  type="button"
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => runCommand(command)}
                >
                  <Icon size={16} />
                  <span>{command.label}</span>
                </button>
              );
            })
          ) : (
            <div className="command-palette__empty">No matching commands</div>
          )}
        </div>
      </div>
    </div>
  );
}
