export const fileContents = {
  'src/App.jsx': `import { useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { createClient } from './utils/api';
import { formatCurrency, groupByStatus } from './utils/helpers';
import './App.css';

const client = createClient('/api');

const filters = [
  { id: 'all', label: 'All Orders' },
  { id: 'paid', label: 'Paid' },
  { id: 'pending', label: 'Pending' },
  { id: 'refunded', label: 'Refunded' },
];

export default function App() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    client.listOrders().then((response) => {
      if (!mounted) {
        return;
      }

      setOrders(response.items);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => groupByStatus(orders), [orders]);
  const revenue = useMemo(() => formatCurrency(totals.paidTotal), [totals.paidTotal]);

  return (
    <div className="app-shell">
      <Header revenue={revenue} />
      <Sidebar filters={filters} value={filter} onChange={setFilter} />
      <Dashboard loading={loading} filter={filter} orders={orders} totals={totals} />
    </div>
  );
}
`,
  'src/App.css': `:root {
  --surface: #0b1020;
  --surface-strong: #11182d;
  --surface-soft: #18223d;
  --text: #edf2ff;
  --muted: #9db0d0;
  --accent: #66b3ff;
  --success: #31c48d;
  --warning: #f59e0b;
  --danger: #f87171;
  --border: rgba(157, 176, 208, 0.18);
  --shadow: rgba(8, 15, 34, 0.42);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(102, 179, 255, 0.14), transparent 35%),
    linear-gradient(180deg, #09101d 0%, #0b1020 100%);
  color: var(--text);
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

.app-shell {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  grid-template-rows: 72px minmax(0, 1fr);
  min-height: 100vh;
}

.card {
  border: 1px solid var(--border);
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(24, 34, 61, 0.92), rgba(17, 24, 45, 0.92));
  box-shadow: 0 24px 48px var(--shadow);
  backdrop-filter: blur(10px);
}

.muted {
  color: var(--muted);
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(102, 179, 255, 0.12);
  color: var(--accent);
}
`,
  'src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

function bootstrap() {
  const container = document.getElementById('root');

  if (!container) {
    throw new Error('Root element not found');
  }

  const root = ReactDOM.createRoot(container);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((error) => console.warn('Service worker registration failed', error));
  });
}

bootstrap();
registerServiceWorker();
`,
  'src/components/Button.jsx': `import PropTypes from 'prop-types';
import clsx from 'clsx';
import './Button.css';

const variants = {
  primary: 'button button--primary',
  secondary: 'button button--secondary',
  ghost: 'button button--ghost',
};

export function Button({
  children,
  className,
  disabled = false,
  loading = false,
  type = 'button',
  variant = 'primary',
  ...props
}) {
  return (
    <button
      className={clsx(variants[variant], className)}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading && <span className="button__spinner" aria-hidden="true" />}
      <span className="button__label">{children}</span>
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
};

export default Button;
`,
  'src/components/Modal.jsx': `import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import './Modal.css';

export function Modal({ children, onClose, open, title }) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="modal" role="presentation" onMouseDown={onClose}>
      <div
        className="modal__dialog"
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal__header">
          <h2 id="modal-title">{title}</h2>
          <button className="modal__close" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="modal__content">{children}</div>
      </div>
    </div>,
    document.body
  );
}

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
};
`,
  'src/utils/helpers.js': `export function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function groupByStatus(orders) {
  return orders.reduce(
    (summary, order) => {
      summary.total += 1;
      summary[order.status] += 1;

      if (order.status === 'paid') {
        summary.paidTotal += order.amount;
      }

      return summary;
    },
    {
      total: 0,
      paid: 0,
      pending: 0,
      refunded: 0,
      paidTotal: 0,
    }
  );
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function toTitleCase(value) {
  return value
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}
`,
  'src/utils/api.js': `const mockOrders = [
  { id: 'ord_001', customer: 'Ava Thompson', amount: 2400, status: 'paid' },
  { id: 'ord_002', customer: 'Lucas Reed', amount: 920, status: 'pending' },
  { id: 'ord_003', customer: 'Priya Sharma', amount: 1890, status: 'paid' },
  { id: 'ord_004', customer: 'Mina Park', amount: 310, status: 'refunded' },
  { id: 'ord_005', customer: 'Omar Ali', amount: 1290, status: 'paid' },
];

function wait(duration = 320) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

export function createClient(baseUrl) {
  async function request(path, options = {}) {
    await wait();

    return {
      ok: true,
      url: baseUrl + path,
      options,
    };
  }

  return {
    async listOrders() {
      await request('/orders');

      return {
        items: mockOrders,
        count: mockOrders.length,
      };
    },
    async getOrder(id) {
      await request('/orders/' + id);

      return mockOrders.find((order) => order.id === id) ?? null;
    },
  };
}
`,
  'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#09101d" />
    <meta
      name="description"
      content="Operations dashboard built with React and Vite for a fictional commerce team."
    />
    <meta property="og:title" content="Northstar Ops Dashboard" />
    <meta
      property="og:description"
      content="Inspect revenue, review refunds, and monitor team performance in one workspace."
    />
    <meta property="og:type" content="website" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <title>Northstar Ops Dashboard</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
  'package.json': `{
  "name": "northstar-ops-dashboard",
  "private": true,
  "version": "1.4.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --host",
    "lint": "eslint . --ext js,jsx --max-warnings 0",
    "test": "vitest run",
    "format": "prettier --write ."
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^0.379.0",
    "prop-types": "^15.8.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "eslint": "^9.4.0",
    "eslint-plugin-react": "^7.35.0",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "prettier": "^3.3.2",
    "vite": "^5.3.3",
    "vitest": "^2.0.2"
  }
}
`,
  'vite.config.js': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    port: 4173,
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 900,
  },
});
`,
  'README.md': `# Northstar Ops Dashboard

Northstar is a fictional internal dashboard for operations managers who need
quick visibility into order health, revenue, and support load. The project is
designed as a compact React application with a strong focus on reusable UI
components and predictable data flows.

## Features

- Revenue summary cards with trend indicators
- Filterable order lists and refund states
- Reusable modal and button components
- Lightweight mock API layer for local development
- Vite-based development workflow with fast HMR

## Getting started

~~~bash
npm install
npm run dev
~~~

## Project structure

- src/App.jsx: App shell and page composition
- src/components: Shared UI components and page sections
- src/utils: Data transforms and API wrappers
- public: Static assets such as icons and the web manifest

## Development notes

The mock API lives in src/utils/api.js and simulates latency so loading states
can be tested without a backend. Helper functions are isolated in
src/utils/helpers.js to keep render logic readable and easy to test.

## Roadmap

1. Add optimistic updates for order status changes.
2. Introduce charts for revenue trends and cohort analysis.
3. Expand the test suite around data formatting helpers.
4. Add keyboard shortcuts for modal-heavy workflows.
`,
  'User/settings.json': `{
  "editor.fontFamily": "Fira Code, Cascadia Code, monospace",
  "editor.fontLigatures": true,
  "editor.minimap.enabled": true,
  "editor.cursorBlinking": "smooth",
  "editor.cursorSmoothCaretAnimation": "on",
  "editor.renderWhitespace": "selection",
  "editor.wordWrap": "off",
  "editor.tabSize": 2,
  "editor.formatOnSave": false,
  "files.autoSave": "off",
  "terminal.integrated.fontFamily": "Fira Code",
  "workbench.colorTheme": "Default Dark Modern",
  "workbench.iconTheme": "vs-seti"
}
`,
};
