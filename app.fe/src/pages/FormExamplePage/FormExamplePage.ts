import { ProlitElement, scopeDefine } from '@trunkjs/prolit';
import { route } from '@trunkjs/router';
import { customElement } from 'lit/decorators.js';
import type { NteDataTableElement, TableDefinition } from '@nextrap/nte-data-table';

type TableRow = { id: number; value: string };

@route({ name: 'form-example', path: '/form-example' })
@customElement('example-form-page')
export class FormExamplePage extends ProlitElement {
  protected override scope = scopeDefine({
    // language=HTML
    $tpl: `
      <main class="container p-4 d-grid gap-4">
        <nav><a href="/">← Back to start</a></nav>
        <header>
          <p class="mb-2">Prolit form + Nextstrap components</p>
          <h1>Form and components example</h1>
        </header>

        <div class="d-grid gap-3" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr))">
          <form class="p-3 d-grid gap-3" style="border:1px solid var(--nt-border,#dbe1ec)" @submit="$event.preventDefault()">
            <h2>On change</h2>
            <nte-input class="default" type="text" label="Change value" .value="changeValue"
              @change="$fn.changeValue($event.currentTarget.value)"></nte-input>
            <p>Compared text: <strong>{{ changeValue }}</strong></p>
            <small>Updates when the control emits <code>change</code>.</small>
          </form>
          <form class="p-3 d-grid gap-3" style="border:1px solid var(--nt-border,#dbe1ec)" @submit="$event.preventDefault()">
            <h2>On typed</h2>
            <nte-input class="default" type="text" label="Live value" .value="typedValue"
              @input="$fn.typeValue($event.currentTarget.value)"></nte-input>
            <p>Compared text: <strong>{{ typedValue }}</strong></p>
            <small>Updates with every <code>input</code> event.</small>
          </form>
        </div>

        <section class="d-grid gap-3" aria-labelledby="table-heading">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h2 id="table-heading">Maintained list: NTE Data Table</h2>
              <p>Edit a value in the table, add a row or remove it.</p>
            </div>
            <button class="btn btn-primary" type="button" @click="$fn.addRow()">Add row +</button>
          </div>
          <nte-data-table class="style-default" height="16rem"
            .definition="tableDefinition" .data="rows"></nte-data-table>
          <p *if="rows.length === 0" role="status">The list is empty.</p>
        </section>

        <section class="d-grid gap-3">
          <h2>Prolit modal dialog</h2>
          <p>The dialog uses <code>nte-input</code> and returns a typed result.</p>
          <div>
            <button class="btn btn-primary" type="button" @click="$fn.openDialog()">Open dialog</button>
          </div>
          <p *if="dialogResult" class="p-3" style="background:var(--nt-surface,transparent)">
            Dialog result: <strong>{{ dialogResult }}</strong>
          </p>
        </section>

        <section class="d-grid gap-3">
          <h2>NTE Stepper: live output</h2>
          <p>Click a step to inspect current application state.</p>
          <nte-stepper mode="horizontal" @nte-stepper-change="$fn.stepChanged($event.detail.index)">
            <nte-step>
              <strong slot="title">Input</strong>
              <span slot="info">Value: {{ typedValue }}</span>
            </nte-step>
            <nte-step>
              <strong slot="title">Table</strong>
              <span slot="info">{{ rows.length }} rows</span>
            </nte-step>
            <nte-step>
              <strong slot="title">Events</strong>
              <span slot="info">{{ eventCount }} events</span>
            </nte-step>
          </nte-stepper>
          <output class="p-3" style="background:var(--nt-surface,transparent)">
            Step {{ activeStep + 1 }} of 3:
            <span *if="activeStep === 0">Input: {{ typedValue }}</span>
            <span *if="activeStep === 1">Table contains {{ rows.length }} rows.</span>
            <span *if="activeStep === 2">{{ eventCount }} events triggered.</span>
          </output>
        </section>

        <section aria-labelledby="events-heading">
          <h2 id="events-heading">Triggered events</h2>
          <p><strong>{{ eventCount }}</strong> events triggered</p>
          <ol class="p-3" style="max-height:12rem;overflow:auto">
            <li *for="entry of eventLog; entry.id">{{ entry.text }}</li>
          </ol>
        </section>
      </main>
    `,

    changeValue: 'Initial change value',
    typedValue: 'Initial typed value',
    rows: [{ id: 1, value: 'First row' }] as TableRow[],
    nextRowId: 2,
    dialogResult: '',
    activeStep: 0,
    eventCount: 0,
    eventLog: [] as Array<{ id: number; text: string }>,
    tableDefinition: {
      id: 'example-rows',
      rowId: 'id',
      columns: [
        { id: 'id', header: 'ID', field: 'id', defaultWidth: 80 },
        {
          id: 'value', header: 'Value', field: 'value', defaultWidth: 300,
          render: (_: unknown, row: TableRow) => {
            const input = document.createElement('nte-input');
            input.className = 'default';
            input.type = 'text';
            input.label = 'Row ' + row.id;
            input.value = row.value;
            input.addEventListener('input', () =>
              this.scope.$fn.updateRow(row.id, String(input.value ?? '')));
            return input;
          },
        },
        {
          id: 'action', header: 'Action', defaultWidth: 120, sortable: false,
          render: (_: unknown, row: TableRow) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-outline-danger btn-sm';
            button.textContent = 'Remove';
            button.addEventListener('click', () => this.scope.$fn.removeRow(row.id));
            return button;
          },
        },
      ],
    } as TableDefinition<TableRow>,
    $fn: {
      stepChanged: (index: number): void => {
        this.scope.activeStep = index;
      },
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
        this.scope.rows = this.scope.rows.map(row => row.id === id ? { ...row, value } : row);
        this.recordEvent(`row changed: ${id}`);
      },
      removeRow: (id: number): void => {
        this.scope.rows = this.scope.rows.filter(row => row.id !== id);
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
