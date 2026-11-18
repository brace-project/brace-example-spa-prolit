import { ProlitElement, scopeDefine, scopeResource } from '@trunkjs/prolit';
import { customElement } from 'lit/decorators.js';
import { API, type CalculateResponse } from '../generated-api';

@customElement('example-calculate-demo')
export class CalculateDemoElement extends ProlitElement {
  protected override scope = scopeDefine({
    // language=HTML
    $tpl: `
      <section class="calculate-demo" aria-label="Backend calculation">
        <h2>Backend calculation</h2>
        <p>Brace calculates 1² + 2² + … + 1000². A deliberate 700 ms delay demonstrates loading.</p>
        <button type="button" @click="calculation.reload()" ?disabled="calculation.pending">
          Calculate again
        </button>
        <p *if="calculation.pending" role="status">Calculating on the server…</p>
        <p *if="calculation.error" role="alert">{{ calculation.error.message }}</p>
        <p *if="calculation.data" class="result">
          {{ calculation.data.count }} squares = <strong>{{ calculation.data.sumOfSquares }}</strong>
          ({{ calculation.data.processingMs }} ms server time)
        </p>
      </section>
    `,

    calculation: scopeResource<CalculateResponse, []>({
      load: ({ signal }) => API.Demo.Calculate.request({ options: { signal } }),
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
