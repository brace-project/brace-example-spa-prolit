import { ProlitElement, scopeDefine } from '@trunkjs/prolit';
import { customElement } from 'lit/decorators.js';

@customElement('brace-example-app')
export class AppShell extends ProlitElement {
  protected override scope = scopeDefine({
    // language=HTML
    $tpl: `
      <header
        class="app-header"
        style="padding:1rem 1.25rem"
        style-md="padding:1.5rem 2.5rem"
      >
        <a class="brand" href="/">Brace + Prolit</a>
        <span class="subtitle">Backend + typed API + routed Prolit UI</span>
      </header>
      <main class="app-shell" style="padding:1rem" style-md="padding:2rem 2.5rem">
        <router-content></router-content>
      </main>
      <footer class="app-footer" style="padding:1rem 1.25rem" style-md="padding:1rem 2.5rem">
        Example application for Brace and TrunkJS Prolit.
      </footer>
    `,
  });
}
