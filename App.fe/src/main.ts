import '@trunkjs/responsive';
import { Router, setDefaultRouter } from '@trunkjs/router';
import './AppShell';
import type { AppShell } from './AppShell';
import './app.css';
import { HomePage } from './pages/HomePage';

const root = document.querySelector('tj-responsive');
if (!(root instanceof HTMLElement)) {
  throw new Error('Expected <tj-responsive> as SPA root.');
}

const router = new Router([HomePage]);
setDefaultRouter(router);

const shell = document.createElement('brace-example-app') as AppShell;
root.append(shell);
await shell.updateComplete;
router.start();
