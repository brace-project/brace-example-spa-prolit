import { ProlitElement, scopeDefine, scopeResource } from '@trunkjs/prolit';
import { customElement } from 'lit/decorators.js';
import { API, type CalculateResponse } from '../generated-api';
import { requestFeedback } from '../requestFeedback';

@customElement('example-calculate-demo')
export class CalculateDemoElement extends ProlitElement {
  protected override scope = scopeDefine({
    // language=HTML
    $tpl: `
      <section class="p-3 mt-4" style="background:var(--nt-surface,transparent);border-radius:var(--nt-border-radius,0.75rem)" aria-label="Backend calculation">
        <h2>Backend calculation</h2>
        <p>Brace calculates 1² + 2² + … + 1000² via POST. A 700 ms delay demonstrates loading.</p>
        <button class="btn btn-primary" type="button" @click="calculation.reload()" ?disabled="calculation.pending">
          Calculate again (POST)
        </button>
        <p *if="calculation.error" role="alert">{{ calculation.error.message }}</p>
        <p *if="calculation.data" class="p-3">
          {{ calculation.data.label }}: {{ calculation.data.count }} squares = <strong>{{ calculation.data.sumOfSquares }}</strong>
          ({{ calculation.data.processingMs }} ms server time)
        </p>
      </section>
    `,

    calculation: scopeResource<CalculateResponse, []>({
      load: ({ signal }) => requestFeedback(() => API.Demo.Calculate.request({ body: { count: 1000, multiplier: 1, label: 'Demo' }, options: { signal } })),
      retainData: false,
      errorMessage: 'Calculation failed.',
    }),
    $hooks: {
      $connect: (): void => {
        void this.scope.calculation.reload();
      },
    },
  });
}
