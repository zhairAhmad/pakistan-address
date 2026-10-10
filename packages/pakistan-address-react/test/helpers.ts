import { screen, within } from '@testing-library/react';
import type userEvent from '@testing-library/user-event';

type User = ReturnType<typeof userEvent.setup>;

/** The text box of a dropdown, found by its label. */
export const combo = (name: string) => screen.getByRole('combobox', { name }) as HTMLInputElement;
export const hasCombo = (name: string) => screen.queryByRole('combobox', { name }) !== null;

/** Open a dropdown, click the option with this exact label. */
export async function pick(user: User, name: string, optionLabel: string) {
  await user.click(combo(name));
  const listbox = screen.getByRole('listbox');
  await user.click(within(listbox).getByRole('option', { name: optionLabel }));
}

/** Open a dropdown, read its options, close it again. */
export async function listOptions(user: User, name: string) {
  await user.click(combo(name));
  const labels = within(screen.getByRole('listbox'))
    .getAllByRole('option')
    .map((o) => o.textContent ?? '');
  await user.keyboard('{Escape}');
  return labels;
}
