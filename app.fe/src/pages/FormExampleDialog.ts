import { ProlitDialogElement, scopeDefine } from '@trunkjs/prolit';
import { customElement } from 'lit/decorators.js';

@customElement('example-form-dialog')
export class FormExampleDialog extends ProlitDialogElement<{ value: string }, string> {
  protected override scope = scopeDefine({
    // language=HTML
    $tpl: `
      <div class="form-dialog-content">
        <p>This modal is rendered by <code>ProlitDialogElement</code>.</p>
        <label>
          Dialog value
          <input .value="value" @input="value = $event.currentTarget.value">
        </label>
        <div class="dialog-actions">
          <button type="button" @click="$fn.submit()" ?disabled="!value.trim()">Apply</button>
          <button type="button" @click="$fn.cancel()">Cancel</button>
        </div>
      </div>
    `,

    value: '',
    $fn: {
      submit: (): void => this.submit(this.scope.value.trim()),
      cancel: (): void => this.abort(),
    },
  });

  protected override dialogOptions = {
    title: 'Prolit form dialog',
    size: 'md' as const,
    closeOnBackdrop: true,
  };

  protected override onInput(input: { value: string }): void {
    this.scope.value = input.value;
  }
}
