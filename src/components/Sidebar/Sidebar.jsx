import { Search as SearchIcon, Sparkles, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import FileTree from './FileTree';
import { useEditorStore } from '../../state/useEditorStore';
import {
  explorerStats,
  extensionMarketplace,
  searchResults,
  sourceControlData,
  workspaceSummary,
} from '../../data/demoData';
import './Sidebar.css';

const sidebarTitles = {
  explorer: 'Explorer',
  extensions: 'Extensions',
  git: 'Source Control',
  search: 'Search',
};

export default function Sidebar() {
  const { openFileByPath, state } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [extensionQuery, setExtensionQuery] = useState('');

  const filteredSearchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return searchResults;
    }

    return searchResults.filter((result) =>
      [result.file, result.preview, result.category].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [searchQuery]);

  const filteredExtensions = useMemo(() => {
    const query = extensionQuery.trim().toLowerCase();

    if (!query) {
      return extensionMarketplace;
    }

    return extensionMarketplace.filter((extension) =>
      [extension.name, extension.author, extension.description, extension.tag].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [extensionQuery]);

  return (
    <aside className="sidebar panel-surface">
      <header className="sidebar__header">
        <div className="sidebar__header-copy">
          <span className="sidebar__eyebrow">{sidebarTitles[state.sidebarView]}</span>
          <strong className="sidebar__workspace-name">{workspaceSummary.projectName}</strong>
        </div>
        <span className="sidebar__meta">{workspaceSummary.environment}</span>
      </header>

      <div className="sidebar__body">
        {state.sidebarView === 'explorer' && (
          <section className="sidebar__placeholder">
            <div className="sidebar__hero">
              <div>
                <span className="sidebar__hero-label">Workspace</span>
                <strong>{workspaceSummary.projectName}</strong>
                <p>Monaco, resizable panes, and static data stitched into a coherent demo shell.</p>
              </div>
              <div className="sidebar__hero-chip">Branch {workspaceSummary.branch}</div>
            </div>

            <div className="sidebar__stats">
              {explorerStats.map((stat) => (
                <article key={stat.id} className="sidebar__stat-card">
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </article>
              ))}
            </div>

            <FileTree />
          </section>
        )}

        {state.sidebarView === 'search' && (
          <section className="sidebar__placeholder">
            <label className="sidebar__search">
              <span className="sidebar__search-label">Search</span>
              <input
                className="sidebar__search-input"
                type="text"
                placeholder="Search workspace"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>
            <div className="sidebar__result-summary">
              <SearchIcon size={14} />
              <span>{filteredSearchResults.length} indexed results</span>
            </div>
            <div className="sidebar__results">
              {filteredSearchResults.length ? (
                filteredSearchResults.map((result) => (
                  <button
                    key={result.id}
                    className="sidebar__result-card"
                    type="button"
                    onClick={() => openFileByPath(result.path)}
                  >
                    <div className="sidebar__result-header">
                      <strong>{result.file}</strong>
                      <span>
                        {result.category} · Ln {result.line}
                      </span>
                    </div>
                    <p>{result.preview}</p>
                  </button>
                ))
              ) : (
                <div className="sidebar__empty-card">
                  <strong>No matching results</strong>
                  <p>Try searching for layout, terminal, theme, or docs.</p>
                </div>
              )}
            </div>
        </section>
        )}

        {state.sidebarView === 'git' && (
          <section className="sidebar__placeholder">
            <div className="sidebar__hero">
              <div>
                <span className="sidebar__hero-label">Source control</span>
                <strong>{sourceControlData.changes.length + sourceControlData.staged.length} changes</strong>
                <p>
                  {sourceControlData.incoming} incoming, {sourceControlData.outgoing} outgoing. Ready to publish.
                </p>
              </div>
              <div className="sidebar__hero-chip">main</div>
            </div>

            <div className="sidebar__section-block">
              <div className="sidebar__block-title">
                <span>Staged Changes</span>
                <span>{sourceControlData.staged.length}</span>
              </div>
              <ul className="sidebar__list">
                {sourceControlData.staged.map((item) => (
                  <li key={item.id} className="sidebar__list-item sidebar__list-item--git">
                    <span className={`sidebar__git-badge sidebar__git-badge--${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                    <div>
                      <strong>{item.path}</strong>
                      <span>{item.summary}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sidebar__section-block">
              <div className="sidebar__block-title">
                <span>Changes</span>
                <span>{sourceControlData.changes.length}</span>
              </div>
              <ul className="sidebar__list">
                {sourceControlData.changes.map((item) => (
                  <li key={item.id} className="sidebar__list-item sidebar__list-item--git">
                    <span className={`sidebar__git-badge sidebar__git-badge--${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                    <div>
                      <strong>{item.path}</strong>
                      <span>{item.summary}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {state.sidebarView === 'extensions' && (
          <section className="sidebar__placeholder">
            <label className="sidebar__search">
              <span className="sidebar__search-label">Extensions</span>
              <input
                className="sidebar__search-input"
                type="text"
                placeholder="Search Extensions in Marketplace"
                value={extensionQuery}
                onChange={(event) => setExtensionQuery(event.target.value)}
              />
            </label>
            <div className="sidebar__extensions">
              {filteredExtensions.map((extension) => (
                <article key={extension.id} className="sidebar__extension-card">
                  <div className="sidebar__extension-badge">{extension.name.slice(0, 2).toUpperCase()}</div>
                  <div className="sidebar__extension-copy">
                    <div className="sidebar__extension-title">
                      <strong>{extension.name}</strong>
                      <span className="sidebar__extension-tag">{extension.tag}</span>
                    </div>
                    <span>{extension.author}</span>
                    <p>{extension.description}</p>
                    <div className="sidebar__extension-meta">
                      <span>
                        <Star size={12} fill="currentColor" />
                        {extension.rating}
                      </span>
                      <span>{extension.installs} installs</span>
                    </div>
                  </div>
                  <button className="sidebar__install-button" type="button">
                    <Sparkles size={13} />
                    Install
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}
