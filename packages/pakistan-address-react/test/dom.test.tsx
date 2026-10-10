// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AddressFields, type ResolvedAddress } from '../src/index';
import { ProvinceDivisionDistrict } from './ReactSelectExample';
import { combo, hasCombo, listOptions, pick } from './helpers';

afterEach(cleanup);

async function violations(container: HTMLElement) {
  const results = await axe.run(container, { rules: { region: { enabled: false } } });
  return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`);
}

describe('<AddressFields /> interaction', () => {
  it('reveals each level as the user picks the one above', async () => {
    const user = userEvent.setup();
    render(<AddressFields />);
    expect(hasCombo('Division')).toBe(false);

    await pick(user, 'Province', 'Punjab');
    await pick(user, 'Division', 'Multan');
    const districts = await listOptions(user, 'District');
    expect(districts).toContain('Vehari');
    expect(districts).not.toContain('Lahore');

    await pick(user, 'District', 'Vehari');
    expect(await listOptions(user, 'Tehsil')).toContain('Mailsi');
  });

  it('shows the chosen name in the text box and offers "Other / not listed" last', async () => {
    const user = userEvent.setup();
    render(<AddressFields />);
    await pick(user, 'Province', 'Punjab');
    expect(combo('Province').value).toBe('Punjab');
    const divisions = await listOptions(user, 'Division');
    expect(divisions[divisions.length - 1]).toBe('Other / not listed');
  });

  it('clears the levels below when a higher level changes', async () => {
    const user = userEvent.setup();
    render(<AddressFields />);
    await pick(user, 'Province', 'Punjab');
    await pick(user, 'Division', 'Multan');
    await pick(user, 'District', 'Vehari');

    await pick(user, 'Province', 'Sindh');
    expect(combo('Division').value).toBe('');
    expect(hasCombo('District')).toBe(false);
  });

  it('shows a text input for "Other / not listed" and reports it in onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AddressFields onChange={onChange} />);
    await pick(user, 'Province', 'Punjab');
    await pick(user, 'Division', 'Multan');
    await pick(user, 'District', 'Other / not listed');

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
    await pick(user, 'Province', 'Punjab');
    const next = onChange.mock.lastCall![0];

    rerender(<AddressFields value={next} onChange={onChange} />);
    expect(combo('Province').value).toBe('Punjab');
    expect(hasCombo('Division')).toBe(true);
  });

  it('posts the ids under the name prefix in a native form', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <AddressFields name="shipping" />
      </form>,
    );
    await pick(user, 'Province', 'Punjab');
    await pick(user, 'Division', 'Multan');
    await user.type(screen.getByRole('textbox', { name: 'Full address / landmark' }), 'House 1');

    const data = new FormData(container.querySelector('form')!);
    expect(data.get('shipping[provinceId]')).toBe('pb');
    expect(data.get('shipping[divisionId]')).toBe('pb-multan-div');
    expect(data.get('shipping[addressLine]')).toBe('House 1');
  });

  it('shows the Balochistan notice as a note, and only for Balochistan', async () => {
    const user = userEvent.setup();
    render(<AddressFields />);
    await pick(user, 'Province', 'Balochistan');
    expect(screen.getByRole('note').textContent).toContain('July 2026');
    await pick(user, 'Province', 'Punjab');
    expect(screen.queryByRole('note')).toBeNull();
  });

  it('uses custom labels', async () => {
    const user = userEvent.setup();
    render(<AddressFields labels={{ province: 'Suba', placeholder: 'Choose one' }} />);
    expect(combo('Suba').placeholder).toBe('Choose one');
    await user.click(combo('Suba'));
    expect(within(screen.getByRole('listbox')).getAllByRole('option').length).toBeGreaterThan(0);
  });

  it('can use the browser select instead', async () => {
    const user = userEvent.setup();
    render(<AddressFields native />);
    const province = screen.getByRole('combobox', { name: 'Province' }) as HTMLSelectElement;
    expect(province.tagName).toBe('SELECT');
    await user.selectOptions(province, 'Punjab');
    expect(screen.getByRole('combobox', { name: 'Division' }).tagName).toBe('SELECT');
  });
});

describe('<AddressFields /> search', () => {
  it('filters a long list as the user types, and chooses with Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AddressFields onChange={onChange} />);
    await pick(user, 'Province', 'Punjab');
    await pick(user, 'Division', 'Other / not listed'); // all 41 districts of Punjab

    await user.click(combo('District'));
    await user.type(combo('District'), 'veh');
    const shown = within(screen.getByRole('listbox')).getAllByRole('option').map((o) => o.textContent);
    expect(shown).toContain('Vehari');
    expect(shown).not.toContain('Lahore');
    expect(shown[shown.length - 1]).toBe('Other / not listed'); // stays reachable

    await user.keyboard('{Enter}');
    expect(onChange.mock.lastCall![1]).toMatchObject({ district: 'Vehari' });
    expect(combo('District').value).toBe('Vehari');
  });

  it('finds a district by its alternate name', async () => {
    const user = userEvent.setup();
    render(<AddressFields />);
    await pick(user, 'Province', 'Sindh');
    await pick(user, 'Division', 'Other / not listed');
    await user.click(combo('District'));
    await user.type(combo('District'), 'Nawabshah');
    const shown = within(screen.getByRole('listbox')).getAllByRole('option').map((o) => o.textContent);
    expect(shown).toContain('Shaheed Benazir Abad');
  });

  it('says so when nothing matches', async () => {
    const user = userEvent.setup();
    render(<AddressFields />);
    await pick(user, 'Province', 'Punjab');
    await pick(user, 'Division', 'Other / not listed');
    await user.click(combo('District'));
    await user.type(combo('District'), 'zzzz');
    expect(screen.getByText('No matches')).toBeTruthy();
  });

  it('keeps short lists as a plain dropdown without a search box', async () => {
    const user = userEvent.setup();
    render(<AddressFields />);
    expect(combo('Province').readOnly).toBe(true);
    await pick(user, 'Province', 'Punjab');
    await pick(user, 'Division', 'Other / not listed');
    expect(combo('District').readOnly).toBe(false); // 41 districts: searchable
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
    await pick(user, 'Province', 'Balochistan');
    await pick(user, 'Division', 'Other / not listed');
    await pick(user, 'District', 'Other / not listed');
    expect(await violations(container)).toEqual([]);
  });

  it('has no violations with a dropdown open', async () => {
    const user = userEvent.setup();
    const { container } = render(<AddressFields />);
    await user.click(combo('Province'));
    expect(screen.getByRole('listbox')).toBeTruthy();
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
