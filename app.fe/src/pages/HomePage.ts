import { ProlitElement, scopeDefine, scopeResource } from '@trunkjs/prolit';
import { route } from '@trunkjs/router';
import { customElement } from 'lit/decorators.js';
import { API, type GreetingResponse } from '../generated-api';

@route({ name: 'home', path: '/' })
@customElement('example-home-page')
export class HomePage extends ProlitElement {
  protected override scope = scopeDefine({
    // language=HTML
    $tpl: `
      <section class="card" style="padding:1.25rem" style-md="padding:2rem">
        <div style="display:block" style-md="display:grid;grid-template-columns:2fr 1fr;gap:2rem">
          <div>
            <p class="eyebrow">Brace API + Prolit scope</p>
            <h1>SPA example application</h1>
            <p>
              This page is a routed ProlitElement. Its backend response is loaded through
              the TypeScript client generated from the Brace controller.
            </p>
            <button @click="greeting.reload()" ?disabled="greeting.pending">Reload backend greeting</button>
            <p *if="greeting.pending" role="status">Loading from Brace…</p>
            <p *if="greeting.error" role="alert">{{ greeting.error.message }}</p>
            <p *if="greeting.data" class="result">
              {{ greeting.data.message }} · backend: {{ greeting.data.backend }}
            </p>
          </div>
          <aside class="facts" style="margin-top:1.5rem" style-md="margin-top:0">
            <strong>Included in this base</strong>
            <ul>
              <li>Brace SPA serving</li>
              <li>automatic API stub generation</li>
              <li>TrunkJS Router decorators</li>
              <li>ProlitElement light DOM</li>
              <li>TrunkJS Responsive attributes</li>
            </ul>
          </aside>
        </div>
      </section>
    `,

    greeting: scopeResource<GreetingResponse, []>({
      load: ({ signal }) => API.Demo.Greeting.request({ options: { signal } }),
      retainData: false,
      errorMessage: 'Greeting could not be loaded.',
    }),
    $hooks: {
      $connect: (): void => {
        void this.scope.greeting.reload();
      },
    },
  });
}
