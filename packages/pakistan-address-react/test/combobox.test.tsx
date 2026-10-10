// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Combobox, filterOptions, type ComboboxProps, type Option } from '../src/index';

afterEach(cleanup);

const names = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry', 'Date', 'Fig', 'Grape', 'Kiwi', 'Lemon', 'Mango', 'Orange'];
const fruit: Option[] = names.map((n) => ({ value: n.toLowerCase(), label: n }));
const withOther: Option[] = [...fruit, { value: '__other__', label: 'Other / not listed', pinned: true }];

function Harness(props: Partial<ComboboxProps> & { onValue?: (v: string | null) => void }) {
  const { onValue, ...rest } = props;
  const [value, setValue] = useState<string | null>(null);
  return (
    <>
      <label htmlFor="f">Fruit</label>
      <Combobox
        id="f"
        options={withOther}
        {...rest}
        value={value}
        onChange={(v) => {
          setValue(v);
          onValue?.(v);
        }}
      />
    </>
  );
}

const labels = () =>
  within(screen.getByRole('listbox'))
    .getAllByRole('option')
    .map((o) => o.textContent);
const noop = () => {};

describe('filterOptions', () => {
  it('returns everything for an empty query', () => {
    expect(filterOptions(fruit, '  ')).toEqual(fruit);
  });

  it('ranks names that start with the query before others', () => {
    const options: Option[] = [
      { value: 'a', label: 'Banana' },
      { value: 'b', label: 'An' },
      { value: 'c', label: 'Mango' },
    ];
    expect(filterOptions(options, 'an').map((o) => o.label)).toEqual(['An', 'Banana', 'Mango']);
  });

  it('matches every word, ignores case and accents, and uses keywords', () => {
    const options: Option[] = [
      { value: '1', label: 'Shaheed Benazir Abad', keywords: ['Nawabshah'] },
      { value: '2', label: 'Café Town' },
    ];
    expect(filterOptions(options, 'benazir abad')).toHaveLength(1);
    expect(filterOptions(options, 'NAWABSHAH')).toHaveLength(1);
    expect(filterOptions(options, 'cafe')).toHaveLength(1);
    expect(filterOptions(options, 'benazir cafe')).toHaveLength(0);
  });

  it('never matches pinned options (the component adds them back)', () => {
    expect(filterOptions(withOther, 'other')).toEqual([]);
  });
});

describe('<Combobox />', () => {
  it('opens on click, chooses an option and closes', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    expect(screen.queryByRole('listbox')).toBeNull();
    await user.click(screen.getByRole('combobox', { name: 'Fruit' }));
    await user.click(screen.getByRole('option', { name: 'Kiwi' }));
    expect(onValue).toHaveBeenCalledWith('kiwi');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('Kiwi');
  });

  it('filters while typing, keeps the pinned option, and closes on Escape', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await user.click(input);
    await user.type(input, 'ap');
    expect(labels()).toEqual(['Apple', 'Apricot', 'Grape', 'Other / not listed']);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('moves with the arrow keys and chooses with Enter', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    input.focus();
    await user.keyboard('{ArrowDown}'); // opens with the first option active
    expect(input.getAttribute('aria-expanded')).toBe('true');
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onValue).toHaveBeenCalledWith('banana');
  });

  it('points aria-activedescendant at the active option', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await user.click(input);
    const active = input.getAttribute('aria-activedescendant')!;
    expect(document.getElementById(active)?.getAttribute('role')).toBe('option');
  });

  it('clears with the clear button', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Fig' }));
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onValue).toHaveBeenLastCalledWith(null);
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('');
  });

  it('is read-only for short lists unless told to search', () => {
    const short = fruit.slice(0, 4);
    const { rerender } = render(<Combobox id="x" options={short} value={null} onChange={noop} />);
    expect((screen.getByRole('combobox') as HTMLInputElement).readOnly).toBe(true);
    rerender(<Combobox id="x" options={short} value={null} onChange={noop} searchable />);
    expect((screen.getByRole('combobox') as HTMLInputElement).readOnly).toBe(false);
    rerender(<Combobox id="x" options={fruit} value={null} onChange={noop} searchThreshold={50} />);
    expect((screen.getByRole('combobox') as HTMLInputElement).readOnly).toBe(true);
  });

  it('opens a read-only list with Space', async () => {
    const user = userEvent.setup();
    render(<Combobox id="x" options={fruit.slice(0, 3)} value={null} onChange={noop} />);
    screen.getByRole('combobox').focus();
    await user.keyboard(' ');
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('says so when nothing matches', async () => {
    const user = userEvent.setup();
    render(<Harness noResultsText="Nothing found" />);
    await user.click(screen.getByRole('combobox'));
    await user.type(screen.getByRole('combobox'), 'zzz');
    expect(screen.getByText('Nothing found')).toBeTruthy();
  });

  it('posts the value through a hidden input', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <Harness name="fruit" />
      </form>,
    );
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Mango' }));
    expect(new FormData(container.querySelector('form')!).get('fruit')).toBe('mango');
  });

  it('applies class names to its parts and can drop the inline styles', async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        id="x"
        options={fruit}
        value="fig"
        onChange={noop}
        unstyled
        classNames={{ root: 'r', input: 'i', listbox: 'l', option: 'o', clear: 'c' }}
      />,
    );
    expect(screen.getByRole('combobox').className).toBe('i');
    expect(screen.getByRole('button', { name: 'Clear' }).className).toBe('c');
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox').className).toBe('l');
    expect(screen.getAllByRole('option')[0].className).toBe('o');
    expect(screen.getByRole('listbox').getAttribute('style')).toBeNull();
  });

  it('has no accessibility violations, closed or open', async () => {
    const user = userEvent.setup();
    const { container } = render(<Harness />);
    const run = async () =>
      (await axe.run(container, { rules: { region: { enabled: false } } })).violations.map((v) => v.id);
    expect(await run()).toEqual([]);
    await user.click(screen.getByRole('combobox'));
    expect(await run()).toEqual([]);
  });
});
