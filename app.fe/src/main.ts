import '@trunkjs/responsive';
import { configureProlitDialogs, createSimpleDialogRenderer } from '@trunkjs/prolit';
import { Router, setDefaultRouter } from '@trunkjs/router';
import '@nextrap/nte-input';
import '@nextrap/nte-data-table';
import '@nextrap/nte-stepper';
import './app.scss';
import { FormExamplePage } from './pages/FormExamplePage/FormExamplePage';
import { HomePage } from './pages/HomePage/HomePage';
import './elements/CalculateDemoElement';

configureProlitDialogs({ renderer: createSimpleDialogRenderer() });

const router = new Router([HomePage, FormExamplePage]);
setDefaultRouter(router);
router.start();
