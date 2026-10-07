// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AddressFields, type ResolvedAddress } from '../src/index';
import { ProvinceDivisionDistrict } from './ReactSelectExample';

afterEach(cleanup);

const combo = (name: string) => screen.getByRole('combobox', { name }) as HTMLSelectElement;
const optionLabels = (select: HTMLElement) => within(select).getAllByRole('option').map((o) => o.textContent);

async function violations(container: HTMLElement) {
  const results = await axe.run(container, { rules: { region: { enabled: false } } });
  return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`);
}

describe('<AddressFields /> interaction', () => {
  it('reveals each level as the user picks the one above', async () => {
    const user = userEvent.setup();
    render(<AddressFields />);
    expect(screen.queryByRole('combobox', { name: 'Division' })).toBeNull();

    await user.selectOptions(combo('Province'), 'Punjab');
    await user.selectOptions(combo('Division'), 'Multan');
    expect(optionLabels(combo('District'))).toContain('Vehari');
    expect(optionLabels(combo('District'))).not.toContain('Lahore');

    await user.selectOptions(combo('District'), 'Vehari');
    expect(optionLabels(combo('Tehsil'))).toContain('Mailsi');
  });

  it('clears the levels below when a higher level changes', async () => {
    const user = userEvent.setup();
    render(<AddressFields />);
    await user.selectOptions(combo('Province'), 'Punjab');
    await user.selectOptions(combo('Division'), 'Multan');
    await user.selectOptions(combo('District'), 'Vehari');

    await user.selectOptions(combo('Province'), 'Sindh');
    expect(combo('Division').value).toBe('');
    expect(screen.queryByRole('combobox', { name: 'District' })).toBeNull();
  });

  it('shows a text input for "Other / not listed" and reports it in onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AddressFields onChange={onChange} />);
    await user.selectOptions(combo('Province'), 'Punjab');
    await user.selectOptions(combo('Division'), 'Multan');
    await user.selectOptions(combo('District'), 'Other / not listed');

    await user.type(screen.getByRole('textbox', { name: 'District (Other / not listed)' }), ' New District ');
    await user.type(screen.getByRole('textbox', { name: 'Tehsil' }), 'New Tehsil');
    await user.type(screen.getByRole('textbox', { name: 'Full address / landmark' }), 'House 1');

    const resolved: ResolvedAddress = onChange.mock.lastCall![1];
    expect(resolved).toMatchObject({
      province: 'Punjab',
      division: 'Multan',
      district: 'New District',
      tehsil: 'New Tehsil',
      addressLine: 'House 1',
      ids: { province: 'pb', division: 'pb-multan-div', district: null, tehsil: null },
    });
  });

  it('works as a controlled component', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<AddressFields onChange={onChange} />);
    await user.selectOptions(combo('Province'), 'Punjab');
    const next = onChange.mock.lastCall![0];

    rerender(<AddressFields value={next} onChange={onChange} />);
    expect(combo('Province').value).toBe('pb');
    expect(combo('Division')).toBeTruthy();
  });

  it('posts under the name prefix in a native form', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <AddressFields name="shipping" />
      </form>,
    );
    await user.selectOptions(combo('Province'), 'Punjab');
    await user.selectOptions(combo('Division'), 'Multan');
    await user.type(screen.getByRole('textbox', { name: 'Full address / landmark' }), 'House 1');

    const data = new FormData(container.querySelector('form')!);
    expect(data.get('shipping[provinceId]')).toBe('pb');
    expect(data.get('shipping[divisionId]')).toBe('pb-multan-div');
    expect(data.get('shipping[addressLine]')).toBe('House 1');
  });

  it('shows the Balochistan notice as a note, and only for Balochistan', async () => {
    const user = userEvent.setup();
    render(<AddressFields />);
    await user.selectOptions(combo('Province'), 'Balochistan');
    expect(screen.getByRole('note').textContent).toContain('July 2026');
    await user.selectOptions(combo('Province'), 'Punjab');
    expect(screen.queryByRole('note')).toBeNull();
  });

  it('uses custom labels', () => {
    render(<AddressFields labels={{ province: 'Suba', placeholder: 'Choose one' }} />);
    expect(combo('Suba')).toBeTruthy();
    expect(within(combo('Suba')).getByRole('option', { name: 'Choose one' })).toBeTruthy();
  });
});

describe('<AddressFields /> accessibility (axe-core)', () => {
  it('has no violations in the initial state', async () => {
    const { container } = render(<AddressFields />);
    expect(await violations(container)).toEqual([]);
  });

  it('has no violations with every level, an "Other" input and a notice showing', async () => {
    const user = userEvent.setup();
    const { container } = render(<AddressFields />);
    await user.selectOptions(combo('Province'), 'Balochistan');
    await user.selectOptions(combo('Division'), 'Other / not listed');
    await user.selectOptions(combo('District'), 'Other / not listed');
    expect(await violations(container)).toEqual([]);
  });

  it('gives each field its own id when rendered twice', async () => {
    const { container } = render(
      <>
        <AddressFields name="billing" />
        <AddressFields name="shipping" />
      </>,
    );
    expect(await violations(container)).toEqual([]);
  });
});

describe('README react-select example', () => {
  async function choose(user: ReturnType<typeof userEvent.setup>, name: string, option: string) {
    await user.click(screen.getByRole('combobox', { name }));
    await user.click(await screen.findByRole('option', { name: option }));
  }
  const resolved = () => JSON.parse(screen.getByTestId('resolved').textContent!);

  it('cascades province to division to district and supports "Other"', async () => {
    const user = userEvent.setup();
    render(<ProvinceDivisionDistrict />);
    expect(screen.queryByRole('combobox', { name: 'Division' })).toBeNull();

    await choose(user, 'Province', 'Punjab');
    expect(resolved().ids.province).toBe('pb');
    expect(screen.queryByRole('combobox', { name: 'District' })).toBeNull();

    await choose(user, 'Division', 'Multan');
    await choose(user, 'District', 'Vehari');
    expect(resolved().district).toBe('Vehari');

    await choose(user, 'District', 'Other / not listed');
    await user.type(screen.getByRole('textbox', { name: 'District (other)' }), 'New District');
    expect(resolved().district).toBe('New District');
    expect(resolved().ids.district).toBeNull();
  });
});
