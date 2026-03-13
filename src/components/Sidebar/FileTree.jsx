import { useEffect, useState } from 'react';
import {
  ChevronRight,
  File,
  FileCode2,
  FileJson2,
  Folder,
  FolderOpen,
} from 'lucide-react';
import { useEditorStore } from '../../state/useEditorStore';

function getFileIcon(node) {
  if (node.type === 'folder') {
    return node.isOpen ? FolderOpen : Folder;
  }

  if (node.name.endsWith('.json')) {
    return FileJson2;
  }

  if (/\.(jsx?|tsx?)$/.test(node.name)) {
    return FileCode2;
  }

  return File;
}

function TreeNode({ node, depth, activePath, onContextMenu }) {
  const { openFile, toggleFolder } = useEditorStore();
  const Icon = getFileIcon(node);
  const isActive = activePath === node.path;

  const handleClick = () => {
    if (node.type === 'folder') {
      toggleFolder(node.id);
      return;
    }

    openFile(node);
  };

  return (
    <li className="file-tree__item">
      <button
        className={
          isActive ? 'file-tree__row file-tree__row--active' : 'file-tree__row'
        }
        type="button"
        onClick={handleClick}
        onContextMenu={(event) => {
          if (node.type !== 'file') {
            return;
          }

          event.preventDefault();
          onContextMenu(event, node);
        }}
      >
        <span className={`file-tree__indent file-tree__indent--${Math.min(depth, 6)}`} />
        {node.type === 'folder' ? (
          <ChevronRight
            className={node.isOpen ? 'file-tree__chevron file-tree__chevron--open' : 'file-tree__chevron'}
            size={14}
          />
        ) : (
          <span className="file-tree__chevron-spacer" />
        )}
        <Icon className="file-tree__icon" size={15} strokeWidth={1.8} />
        <span className="file-tree__label">{node.name}</span>
      </button>

      {node.type === 'folder' && node.isOpen && (
        <ul className="file-tree__list">
          {node.children?.map((child) => (
            <TreeNode
              key={child.id}
              activePath={activePath}
              depth={depth + 1}
              node={child}
              onContextMenu={onContextMenu}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function FileTree() {
  const { state, activeTab, closeTab, setActiveTab } = useEditorStore();
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    if (!contextMenu) {
      return undefined;
    }

    document.documentElement.style.setProperty('--context-menu-x', `${contextMenu.x}px`);
    document.documentElement.style.setProperty('--context-menu-y', `${contextMenu.y}px`);

    const dismiss = () => setContextMenu(null);

    window.addEventListener('click', dismiss);
    window.addEventListener('contextmenu', dismiss);
    window.addEventListener('keydown', dismiss);

    return () => {
      document.documentElement.style.removeProperty('--context-menu-x');
      document.documentElement.style.removeProperty('--context-menu-y');
      window.removeEventListener('click', dismiss);
      window.removeEventListener('contextmenu', dismiss);
      window.removeEventListener('keydown', dismiss);
    };
  }, [contextMenu]);

  return (
    <div className="file-tree">
      <div className="file-tree__section-title">Open Editors</div>
      {state.openTabs.length ? (
        <ul className="file-tree__open-editors">
          {state.openTabs.map((tab) => (
            <li key={tab.id}>
              <div
                className={activeTab?.id === tab.id ? 'file-tree__open-editor file-tree__open-editor--active' : 'file-tree__open-editor'}
              >
                <button className="file-tree__open-editor-main" type="button" onClick={() => setActiveTab(tab.id)}>
                  <span>{tab.name}</span>
                </button>
                <span className="file-tree__open-editor-actions">
                  {tab.isDirty ? <span className="file-tree__dirty-indicator">●</span> : null}
                  <button
                    className="file-tree__close-open-editor"
                    type="button"
                    aria-label={`Close ${tab.name}`}
                    onClick={() => closeTab(tab.id)}
                  >
                    ×
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="file-tree__active-file">No file selected</div>
      )}

      <div className="file-tree__section-title">Project</div>
      <ul className="file-tree__list">
        {state.fileTree.map((node) => (
          <TreeNode
            key={node.id}
            activePath={activeTab?.path}
            depth={0}
            node={node}
            onContextMenu={(event, fileNode) =>
              setContextMenu({ x: event.clientX, y: event.clientY, fileNode })
            }
          />
        ))}
      </ul>

      {contextMenu && (
        <div className="file-tree__context-menu" role="menu">
          <button className="file-tree__context-item" type="button" onClick={() => setContextMenu(null)}>
            New File
          </button>
          <button className="file-tree__context-item" type="button" onClick={() => setContextMenu(null)}>
            Rename
          </button>
          <button className="file-tree__context-item" type="button" onClick={() => setContextMenu(null)}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
