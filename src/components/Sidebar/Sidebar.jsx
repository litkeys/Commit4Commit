import FileTree from './FileTree';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar panel-surface">
      <div className="sidebar-content">
        <FileTree />
      </div>
    </aside>
  );
}
