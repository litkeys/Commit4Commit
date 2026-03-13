import { useEditorStore } from '../../state/useEditorStore';
import './Breadcrumb.css';

export default function Breadcrumb() {
  const { activeTab } = useEditorStore();

  if (!activeTab) {
    return (
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <span className="breadcrumb__empty">No file selected</span>
      </nav>
    );
  }

  const parts = activeTab.path.split('/');

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {parts.map((part, index) => (
        <button key={`${part}-${index}`} className="breadcrumb__segment" type="button">
          {part}
        </button>
      )).reduce((accumulator, current, index) => {
        if (index === 0) {
          return [current];
        }

        return [...accumulator, <span key={`sep-${index}`} className="breadcrumb__separator">{'>'}</span>, current];
      }, [])}
    </nav>
  );
}
