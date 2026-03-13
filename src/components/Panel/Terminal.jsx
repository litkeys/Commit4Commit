import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../state/useEditorStore';

const HOME_PATH = '/home/user/project';

const staticResponses = {
  'git log --oneline': [
    'b82a1d8 polish command palette keyboard nav',
    'c1f93aa add fake terminal history renderer',
    'd4524b6 wire Monaco cursor status updates',
    'e8ac522 build explorer tree interactions',
    'fd3a1a4 initial shell layout',
  ],
  'git status': [
    'On branch main',
    'Your branch is up to date with "origin/main".',
    '',
    'Changes not staged for commit:',
    '  modified: src/App.jsx',
    '  modified: src/components/Panel/Terminal.jsx',
    '',
    'Untracked files:',
    '  docs/changelog.md',
  ],
  'node -v': ['v20.11.0'],
  'npm -v': ['10.2.4'],
};

function getPromptPath(segments) {
  return segments.length ? `~/project/${segments.join('/')}` : '~/project';
}

function joinDisplayPath(segments) {
  return segments.length ? `${HOME_PATH}/${segments.join('/')}` : HOME_PATH;
}

function normalizePath(input, currentSegments) {
  if (!input || input === '~' || input === '~/') {
    return [];
  }

  if (input === '.') {
    return currentSegments;
  }

  const nextSegments = input.startsWith('/') ? [] : [...currentSegments];
  const normalizedInput = input
    .replace(/^~\/?project\/?/, '')
    .replace(/^\/home\/user\/project\/?/, '')
    .replace(/^\/+/, '');

  for (const segment of normalizedInput.split('/')) {
    if (!segment || segment === '.') {
      continue;
    }

    if (segment === '..') {
      nextSegments.pop();
      continue;
    }

    nextSegments.push(segment);
  }

  return nextSegments;
}

function getNodeAtPath(nodes, segments) {
  if (!segments.length) {
    return {
      name: 'project',
      path: '',
      type: 'folder',
      children: nodes,
    };
  }

  let currentNodes = nodes;
  let currentNode = null;

  for (const segment of segments) {
    currentNode = currentNodes.find((node) => node.name === segment) ?? null;

    if (!currentNode) {
      return null;
    }

    currentNodes = currentNode.children ?? [];
  }

  return currentNode;
}

function listNode(node) {
  if (!node) {
    return [];
  }

  if (node.type === 'file') {
    return [node.name];
  }

  const children = [...(node.children ?? [])].sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === 'folder' ? -1 : 1;
    }

    return left.name.localeCompare(right.name);
  });

  return [
    children
      .map((child) => (child.type === 'folder' ? `${child.name}/` : child.name))
      .join('  ') || '(empty)',
  ];
}

function renderTree(node, prefix = '') {
  if (node.type !== 'folder') {
    return [node.name];
  }

  const children = [...(node.children ?? [])].sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === 'folder' ? -1 : 1;
    }

    return left.name.localeCompare(right.name);
  });

  return children.flatMap((child, index) => {
    const isLast = index === children.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childLine = `${prefix}${connector}${child.type === 'folder' ? `${child.name}/` : child.name}`;

    if (child.type !== 'folder') {
      return [childLine];
    }

    const branchPrefix = `${prefix}${isLast ? '    ' : '│   '}`;
    return [childLine, ...renderTree(child, branchPrefix)];
  });
}

function buildHelpLines() {
  return [
    'Available commands:',
    'help, ls [path], pwd, cd <path>, tree [path], cat <file>, open <file>, echo <text>, whoami, date, node -v, npm -v, git status, git log --oneline, clear',
    '',
    'Tips:',
    '- Use ArrowUp / ArrowDown for command history',
    '- Use paths like src/App.jsx, ./src, ../, or /home/user/project/src',
  ];
}

export default function Terminal() {
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const { openFileByPath, state } = useEditorStore();
  const [history, setHistory] = useState([
    {
      id: 'boot-1',
      type: 'output',
      lines: [
        'VS Code Clone terminal ready. Type "help" to list commands.',
        'This terminal can browse the mock workspace and open files in the editor.',
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [cwdSegments, setCwdSegments] = useState([]);
  const [submittedCommands, setSubmittedCommands] = useState([]);
  const [historyCursor, setHistoryCursor] = useState(-1);

  useEffect(() => {
    if (!outputRef.current) {
      return;
    }

    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [history]);

  const promptPath = getPromptPath(cwdSegments);

  const appendHistory = (command, lines) => {
    setHistory((current) => [
      ...current,
      { id: `cmd-${current.length}`, type: 'command', prompt: promptPath, lines: [command] },
      { id: `out-${current.length}`, type: 'output', lines: lines.length ? lines : ['\u00A0'] },
    ]);
  };

  const executeCommand = (rawCommand) => {
    const command = rawCommand.trim();

    if (!command) {
      return;
    }

    if (command === 'clear') {
      setHistory([]);
      return;
    }

    if (staticResponses[command]) {
      appendHistory(command, staticResponses[command]);
      return;
    }

    const [name, ...args] = command.split(/\s+/);
    const value = args.join(' ');

    switch (name) {
      case 'help':
        appendHistory(command, buildHelpLines());
        return;

      case 'pwd':
        appendHistory(command, [joinDisplayPath(cwdSegments)]);
        return;

      case 'whoami':
        appendHistory(command, ['user']);
        return;

      case 'date':
        appendHistory(command, [new Date().toString()]);
        return;

      case 'echo':
        appendHistory(command, [value]);
        return;

      case 'ls': {
        const targetSegments = normalizePath(args[0], cwdSegments);
        const targetNode = getNodeAtPath(state.fileTree, targetSegments);

        if (!targetNode) {
          appendHistory(command, [`ls: cannot access '${args[0]}': No such file or directory`]);
          return;
        }

        appendHistory(command, listNode(targetNode));
        return;
      }

      case 'cd': {
        const targetSegments = args[0] ? normalizePath(args[0], cwdSegments) : [];
        const targetNode = getNodeAtPath(state.fileTree, targetSegments);

        if (!targetNode) {
          appendHistory(command, [`cd: no such file or directory: ${args[0] ?? ''}`]);
          return;
        }

        if (targetNode.type !== 'folder') {
          appendHistory(command, [`cd: not a directory: ${args[0]}`]);
          return;
        }

        setCwdSegments(targetSegments);
        appendHistory(command, []);
        return;
      }

      case 'tree': {
        const targetSegments = normalizePath(args[0], cwdSegments);
        const targetNode = getNodeAtPath(state.fileTree, targetSegments);

        if (!targetNode) {
          appendHistory(command, [`tree: ${args[0]}: No such file or directory`]);
          return;
        }

        const heading = targetNode.type === 'folder' ? `${targetNode.name}/` : targetNode.name;
        appendHistory(command, [heading, ...renderTree(targetNode)]);
        return;
      }

      case 'cat': {
        const targetSegments = normalizePath(args[0], cwdSegments);
        const targetNode = getNodeAtPath(state.fileTree, targetSegments);

        if (!targetNode) {
          appendHistory(command, [`cat: ${args[0]}: No such file or directory`]);
          return;
        }

        if (targetNode.type !== 'file') {
          appendHistory(command, [`cat: ${args[0]}: Is a directory`]);
          return;
        }

        const content = state.fileContents[targetNode.path] ?? '';
        appendHistory(command, content.split('\n'));
        return;
      }

      case 'open': {
        const targetSegments = normalizePath(args[0], cwdSegments);
        const targetNode = getNodeAtPath(state.fileTree, targetSegments);

        if (!targetNode) {
          appendHistory(command, [`open: ${args[0]}: No such file or directory`]);
          return;
        }

        if (targetNode.type !== 'file') {
          appendHistory(command, [`open: ${args[0]}: Is a directory`]);
          return;
        }

        openFileByPath(targetNode.path);
        appendHistory(command, [`Opened ${targetNode.path} in editor.`]);
        return;
      }

      default:
        appendHistory(command, [`command not found: ${command}`]);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const command = inputValue.trim();

    if (!command) {
      return;
    }

    setSubmittedCommands((current) => [...current, command]);
    setHistoryCursor(-1);
    executeCommand(command);
    setInputValue('');
  };

  return (
    <div
      className="terminal"
      onMouseDown={() => {
        window.requestAnimationFrame(() => inputRef.current?.focus());
      }}
    >
      <div ref={outputRef} className="terminal__history">
        {history.map((entry) => (
          <div
            key={entry.id}
            className={entry.type === 'command' ? 'terminal__entry terminal__entry--command' : 'terminal__entry'}
          >
            {entry.type === 'command' && (
              <span className="terminal__prompt">{`user@vscode-clone:${entry.prompt}$`}</span>
            )}
            <div className="terminal__lines">
              {entry.lines.map((line, index) => (
                <div key={`${entry.id}-${index}`} className="terminal__line">
                  {line || '\u00A0'}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <form className="terminal__form" onSubmit={handleSubmit}>
        <span className="terminal__prompt">{`user@vscode-clone:${promptPath}$`}</span>
        <input
          ref={inputRef}
          className="terminal__input"
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowUp') {
              event.preventDefault();

              if (!submittedCommands.length) {
                return;
              }

              const nextCursor =
                historyCursor === -1
                  ? submittedCommands.length - 1
                  : Math.max(0, historyCursor - 1);

              setHistoryCursor(nextCursor);
              setInputValue(submittedCommands[nextCursor] ?? '');
            }

            if (event.key === 'ArrowDown') {
              event.preventDefault();

              if (!submittedCommands.length) {
                return;
              }

              if (historyCursor <= 0) {
                setHistoryCursor(-1);
                setInputValue('');
                return;
              }

              const nextCursor = Math.min(submittedCommands.length - 1, historyCursor + 1);
              setHistoryCursor(nextCursor);
              setInputValue(submittedCommands[nextCursor] ?? '');
            }

            if (event.key === 'l' && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              setHistory([]);
            }
          }}
          placeholder="Type a command"
          spellCheck="false"
        />
      </form>
    </div>
  );
}
