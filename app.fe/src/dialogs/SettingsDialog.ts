import { ProlitDialogElement, scopeDefine } from '@trunkjs/prolit';
import { customElement } from 'lit/decorators.js';
import { API, type CalculateInput, type CalculatePostResponse } from '../generated-api';

@customElement('example-settings-dialog')
export class SettingsDialog extends ProlitDialogElement<{ count: number }, CalculatePostResponse | null> {
  protected override scope = scopeDefine({
    // language=HTML
    $tpl: `
      <div class="settings-dialog-content">
        <p>Configure a server-side calculation using a typed JSON POST request.</p>
        <label>
          Number of squares (1–1000)
          <input type="number" min="1" max="1000" step="1"
                 .value="count" @input="count = $event.currentTarget.value">
        </label>
        <button type="button" @click="$fn.calculate()"
                ?disabled="pending || !count || Number(count) < 1 || Number(count) > 1000 || !Number.isInteger(Number(count))">
          Calculate via POST
        </button>
        <p *if="pending" role="status">Sending POST request…</p>
        <p *if="error" role="alert">{{ error }}</p>
        <p *if="result" class="result">
          {{ result.count }} squares = <strong>{{ result.sumOfSquares }}</strong>
          ({{ result.processingMs }} ms server time)
        </p>
        <div class="dialog-actions">
          <button type="button" @click="$fn.close()" ?disabled="pending">Close</button>
        </div>
      </div>
    `,

    count: '5',
    pending: false,
    error: '',
    result: null as CalculatePostResponse | null,
    $fn: {
      calculate: async (): Promise<void> => {
        const count = Number(this.scope.count);
        if (!Number.isInteger(count) || count < 1 || count > 1000 || this.scope.pending) return;

        const body: CalculateInput = { count };
        this.scope.pending = true;
        this.scope.error = '';
        this.scope.result = null;

        try {
          this.scope.result = await API.Demo.CalculatePost.request({ body });
        } catch (error) {
          this.scope.error = error instanceof Error ? error.message : 'Calculation failed.';
        } finally {
          this.scope.pending = false;
        }
      },
      close: (): void => this.submit(this.scope.result),
    },
  });

  protected override dialogOptions = {
    title: 'Calculation settings',
    size: 'md' as const,
    closeOnBackdrop: false,
  };

  protected override onInput(input: { count: number }): void {
    this.scope.count = String(input.count);
    this.scope.error = '';
    this.scope.result = null;
  }
}
