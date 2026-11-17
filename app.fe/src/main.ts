import '@trunkjs/responsive';
import { configureProlitDialogs, createSimpleDialogRenderer } from '@trunkjs/prolit';
import { Router, setDefaultRouter } from '@trunkjs/router';
import './app.scss';
import { FormExamplePage } from './pages/FormExamplePage';
import { HomePage } from './pages/HomePage';

configureProlitDialogs({ renderer: createSimpleDialogRenderer() });

const router = new Router([HomePage, FormExamplePage]);
setDefaultRouter(router);
router.start();
