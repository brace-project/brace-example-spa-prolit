import '@trunkjs/responsive';
import { Router, setDefaultRouter } from '@trunkjs/router';
import './app.css';
import { HomePage } from './pages/HomePage';

const router = new Router([HomePage]);
setDefaultRouter(router);
router.start();
