import { ProlitDialogElement, scopeDefine } from '@trunkjs/prolit';
import { customElement } from 'lit/decorators.js';
import { API, type CalculateInput, type CalculateResponse } from '../generated-api';

@customElement('example-settings-dialog')
export class SettingsDialog extends ProlitDialogElement<{ count: number }, CalculateResponse | null> {
  protected override scope = scopeDefine({
    // language=HTML
    $tpl: `
      <div class="settings-dialog-content">
        <p>Compare a typed calculation POST with an untyped array POST.</p>
        <label>Number of squares (1–1000)
          <input type="number" min="1" max="1000" step="1"
                 .value="count" @input="count = $event.currentTarget.value">
        </label>
        <label>Multiplier (1–10)
          <input type="number" min="1" max="10" step="1"
                 .value="multiplier" @input="multiplier = $event.currentTarget.value">
        </label>
        <label>Result label
          <input type="text" maxlength="80" .value="label"
                 @input="label = $event.currentTarget.value">
        </label>
        <button type="button" @click="$fn.calculate()" ?disabled="pending">
          Calculate via typed POST
        </button>
        <p *if="result" class="result">
          {{ result.label }}: {{ result.count }} squares = <strong>{{ result.sumOfSquares }}</strong>
          ({{ result.processingMs }} ms server time)
        </p>
        <label>Untyped JSON array
          <textarea rows="3" .value="anyJson" @input="anyJson = $event.currentTarget.value"></textarea>
        </label>
        <button type="button" @click="$fn.sendAny()" ?disabled="pending">
          Send array via POST
        </button>
        <pre *if="anyResult" class="result">{{ anyResult }}</pre>
        <p *if="pending" role="status">Sending request…</p>
        <p *if="error" role="alert">{{ error }}</p>
        <div class="dialog-actions">
          <button type="button" @click="$fn.close()" ?disabled="pending">Close</button>
        </div>
      </div>
    `,

    count: '5',
    multiplier: '2',
    label: 'Example',
    anyJson: '["Ada", 7, true]',
    pending: false,
    error: '',
    result: null as CalculateResponse | null,
    anyResult: '',
    $fn: {
      calculate: async (): Promise<void> => {
        const count = Number(this.scope.count);
        const multiplier = Number(this.scope.multiplier);
        if (this.scope.pending) return;
        if (!Number.isInteger(count) || count < 1 || count > 1000 ||
            !Number.isInteger(multiplier) || multiplier < 1 || multiplier > 10) {
          this.scope.error = 'Count must be 1–1000 and multiplier 1–10.';
          return;
        }

        const body: CalculateInput = { count, multiplier, label: this.scope.label };
        this.scope.pending = true;
        this.scope.error = '';

        try {
          this.scope.result = await API.Demo.Calculate.request({ body });
        } catch (error) {
          this.scope.error = error instanceof Error ? error.message : 'Calculation failed.';
        } finally {
          this.scope.pending = false;
        }
      },
      sendAny: async (): Promise<void> => {
        if (this.scope.pending) return;

        let body: unknown;
        try {
          body = JSON.parse(this.scope.anyJson);
        } catch {
          this.scope.error = 'Enter valid JSON.';
          return;
        }
        if (!Array.isArray(body)) {
          this.scope.error = 'The request body must be a JSON array.';
          return;
        }

        this.scope.pending = true;
        this.scope.error = '';
        this.scope.anyResult = '';

        try {
          const result = await API.Demo.Any.request({ body });
          this.scope.anyResult = JSON.stringify(result, null, 2);
        } catch (error) {
          this.scope.error = error instanceof Error ? error.message : 'Array request failed.';
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
    this.scope.anyResult = '';
  }
}
