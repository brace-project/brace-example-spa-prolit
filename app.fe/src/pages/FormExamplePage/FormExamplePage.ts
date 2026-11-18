import { ProlitElement, scopeDefine } from '@trunkjs/prolit';
import { route } from '@trunkjs/router';
import { customElement } from 'lit/decorators.js';

type TableRow = { id: number; value: string };

@route({ name: 'form-example', path: '/form-example' })
@customElement('example-form-page')
export class FormExamplePage extends ProlitElement {
  protected override scope = scopeDefine({
    // language=HTML
    $tpl: `
      <section class="card form-example" style="padding:1.25rem" style-md="padding:2rem">
        <nav><a href="/">← Back to start</a></nav>
        <p class="eyebrow">Prolit form and event bindings</p>
        <h1>Form example</h1>

        <div class="form-grid">
          <form @submit="$event.preventDefault()">
            <h2>On change</h2>
            <label>
              Value
              <input .value="changeValue" @change="$fn.changeValue($event.currentTarget.value)">
            </label>
            <p class="result">Compared text: <strong>{{ changeValue }}</strong></p>
            <small>The text changes after the field emits <code>change</code>.</small>
          </form>

          <form @submit="$event.preventDefault()">
            <h2>On typed</h2>
            <label>
              Value
              <input .value="typedValue" @input="$fn.typeValue($event.currentTarget.value)">
            </label>
            <p class="result">Compared text: <strong>{{ typedValue }}</strong></p>
            <small>The text changes immediately for every <code>input</code> event.</small>
          </form>
        </div>

        <section aria-labelledby="table-heading">
          <div class="section-heading">
            <div>
              <h2 id="table-heading">Maintained list</h2>
              <p>Add rows with + and remove individual rows with −.</p>
            </div>
            <button type="button" aria-label="Add row" @click="$fn.addRow()">+</button>
          </div>
          <table>
            <thead><tr><th>Value</th><th>Action</th></tr></thead>
            <tbody>
              <tr *for="row of rows; row.id">
                <td>
                  <input .value="row.value" aria-label="Row value" @input="$fn.updateRow(row.id, $event.currentTarget.value)">
                </td>
                <td><button type="button" aria-label="Remove row" @click="$fn.removeRow(row.id)">−</button></td>
              </tr>
            </tbody>
          </table>
          <p *if="rows.length === 0" role="status">The list is empty.</p>
        </section>

        <section>
          <h2>Prolit modal dialog</h2>
          <p>The dialog is a separate <code>ProlitDialogElement</code> with typed input and result.</p>
          <button type="button" @click="$fn.openDialog()">Open Prolit dialog</button>
          <p *if="dialogResult" class="result">Dialog result: <strong>{{ dialogResult }}</strong></p>
        </section>

        <section aria-labelledby="events-heading">
          <h2 id="events-heading">Triggered events</h2>
          <p><strong>{{ eventCount }}</strong> events triggered</p>
          <ol class="event-log">
            <li *for="entry of eventLog; entry.id">{{ entry.text }}</li>
          </ol>
        </section>
      </section>
    `,

    changeValue: 'Initial change value',
    typedValue: 'Initial typed value',
    rows: [{ id: 1, value: 'First row' }] as TableRow[],
    nextRowId: 2,
    dialogResult: '',
    eventCount: 0,
    eventLog: [] as Array<{ id: number; text: string }>,
    $fn: {
      changeValue: (value: string): void => {
        this.scope.changeValue = value;
        this.recordEvent(`change: ${value}`);
      },
      typeValue: (value: string): void => {
        this.scope.typedValue = value;
        this.recordEvent(`typed: ${value}`);
      },
      addRow: (): void => {
        const row = { id: this.scope.nextRowId, value: `Row ${this.scope.nextRowId}` };
        this.scope.nextRowId += 1;
        this.scope.rows = [...this.scope.rows, row];
        this.recordEvent(`row added: ${row.id}`);
      },
      updateRow: (id: number, value: string): void => {
        this.scope.rows = this.scope.rows.map((row) => row.id === id ? { ...row, value } : row);
        this.recordEvent(`row changed: ${id}`);
      },
      removeRow: (id: number): void => {
        this.scope.rows = this.scope.rows.filter((row) => row.id !== id);
        this.recordEvent(`row removed: ${id}`);
      },
      openDialog: async (): Promise<void> => {
        this.recordEvent('Prolit dialog opened');
        const { FormExampleDialog } = await import('./dialogs/FormExampleDialog');
        const result = await FormExampleDialog.show({ value: this.scope.typedValue });
        if (!result.submitted) {
          this.recordEvent('Prolit dialog cancelled');
          return;
        }
        this.scope.dialogResult = result.data;
        this.recordEvent(`Prolit dialog submitted: ${result.data}`);
      },
    },
  });

  private recordEvent(text: string): void {
    const id = this.scope.eventCount + 1;
    this.scope.eventCount = id;
    this.scope.eventLog = [{ id, text }, ...this.scope.eventLog].slice(0, 8);
    this.dispatchEvent(new CustomEvent('form-example-event', {
      detail: { id, text },
      bubbles: true,
      composed: true,
    }));
  }
}
