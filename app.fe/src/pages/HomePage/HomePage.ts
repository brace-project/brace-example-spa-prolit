import { ProlitElement, scopeDefine, scopeResource } from '@trunkjs/prolit';
import { route } from '@trunkjs/router';
import { customElement } from 'lit/decorators.js';
import { API, type GreetingResponse } from '../../generated-api';
import { requestFeedback } from '../../requestFeedback';

@route({ name: 'home', path: '/' })
@customElement('example-home-page')
export class HomePage extends ProlitElement {
  protected override scope = scopeDefine({
    // language=HTML
    $tpl: `
      <main class="container p-4">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <strong>Brace + Prolit + Nextstrap</strong>
          <label class="switch">
            <input class="switch-input" type="checkbox" @change="$fn.setDarkMode($event.currentTarget.checked)">
            <span class="switch-control"></span>
            <span class="switch-label">Dark mode</span>
          </label>
        </div>

        <section class="p-4" style="border:1px solid var(--nt-border, #dbe1ec);border-radius:var(--nt-border-radius,0.75rem)">
          <div class="d-grid gap-4" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr))">
            <div>
              <p class="mb-2">Brace API + Prolit scope</p>
              <h1>SPA example application</h1>
              <p>This routed ProlitElement loads the Brace API via generated TypeScript stubs.</p>
              <p><a href="/form-example">Explore NTE Input and Data Table →</a></p>
              <div class="d-flex flex-wrap gap-2 mb-3">
                <button class="btn btn-primary" type="button" @click="$fn.openSettings()">Calculation settings</button>
                <button class="btn btn-outline-secondary" type="button" @click="greeting.reload()" ?disabled="greeting.pending">
                  Reload greeting
                </button>
              </div>
              <p *if="greeting.error" role="alert">{{ greeting.error.message }}</p>
              <p *if="greeting.data" class="p-3" style="background:var(--nt-surface,transparent)">
                {{ greeting.data.message }} · backend: {{ greeting.data.backend }}
              </p>
            </div>
            <aside class="p-3" style="background:var(--nt-surface,transparent);border-radius:var(--nt-border-radius,0.75rem)">
              <strong>What's included</strong>
              <ul class="list">
                <li>Brace SPA serving and generated API client</li>
                <li>TrunkJS Router and Prolit state</li>
                <li>Nextstrap Style Base, Buttons, Elements, Switch and Utils</li>
                <li>NTE Input, NTE Data Table and NTE Feedback</li>
              </ul>
            </aside>
          </div>
          <example-calculate-demo></example-calculate-demo>
        </section>
      </main>
    `,

    greeting: scopeResource<GreetingResponse, []>({
      load: ({ signal }) => requestFeedback(() => API.Demo.Greeting.request({ options: { signal } })),
      retainData: false,
      errorMessage: 'Greeting could not be loaded.',
    }),
    $fn: {
      setDarkMode: (enabled: boolean): void => {
        document.documentElement.setAttribute('data-nt-scheme', enabled ? 'dark' : 'light');
      },
      openSettings: async (): Promise<void> => {
        const { SettingsDialog } = await import('../../dialogs/SettingsDialog');
        await SettingsDialog.show({ count: 5 });
      },
    },
    $hooks: {
      $connect: (): void => {
        void this.scope.greeting.reload();
      },
    },
  });
}
