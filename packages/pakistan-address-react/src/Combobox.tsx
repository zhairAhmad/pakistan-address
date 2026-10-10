import { type CSSProperties, type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { Option } from './cascade';

export interface ComboboxClassNames {
  root?: string;
  /** Wraps the input and its buttons. */
  control?: string;
  input?: string;
  clear?: string;
  toggle?: string;
  listbox?: string;
  option?: string;
  /** The row shown when a search matches nothing. */
  empty?: string;
}

export interface ComboboxProps {
  /** Id of the text input, so a `<label htmlFor>` can point at it. */
  id: string;
  /** Posts the chosen value (the option's `value`) with a native form, through a hidden input. */
  name?: string;
  options: Option[];
  /** The chosen option's `value`, or `null`. */
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  /** Placeholder used instead when the list is searchable. */
  searchPlaceholder?: string;
  /** Text of the row shown when a search matches nothing. */
  noResultsText?: string;
  /** Accessible name of the clear button. */
  clearLabel?: string;
  /** Show a search box. Defaults to `true` when there are more than `searchThreshold` options. */
  searchable?: boolean;
  /** Lists longer than this are searchable unless `searchable` says otherwise. Default 10. */
  searchThreshold?: number;
  /** Show a clear button while something is chosen. Default `true`. */
  clearable?: boolean;
  disabled?: boolean;
  classNames?: ComboboxClassNames;
  /** Drop the built-in inline styles (position, colours) so your own CSS decides how it looks. */
  unstyled?: boolean;
}

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Options matching the query: every word must appear in the label or a keyword. Better matches come first. */
export function filterOptions(options: Option[], query: string): Option[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  // Pinned options are never part of the filtered list; the component adds them back at the bottom.
  if (!words.length) return options.filter((o) => !o.pinned);
  const scored: { option: Option; rank: number; index: number }[] = [];
  options.forEach((option, index) => {
    if (option.pinned) return;
    const label = normalize(option.label);
    const haystack = [label, ...(option.keywords ?? []).map(normalize)].join(' ');
    if (!words.every((w) => haystack.includes(w))) return;
    const rank = label.startsWith(words[0]) ? 0 : label.includes(' ' + words[0]) ? 1 : 2;
    scored.push({ option, rank, index });
  });
  scored.sort((a, b) => a.rank - b.rank || a.index - b.index);
  return scored.map((s) => s.option);
}

/**
 * An accessible select with an optional search box (WAI-ARIA combobox with a listbox popup).
 * Type to filter, arrow keys to move, Enter to choose, Escape to close. Options with `pinned: true` stay at the
 * bottom whatever the search ("Other / not listed"); `keywords` let a search match alternate names.
 */
export function Combobox({
  id,
  name,
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  noResultsText = 'No matches',
  clearLabel = 'Clear',
  searchable,
  searchThreshold = 10,
  clearable = true,
  disabled,
  classNames = {},
  unstyled,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<HTMLLIElement>(null);

  const canSearch = searchable ?? options.filter((o) => !o.pinned).length > searchThreshold;
  const selected = options.find((o) => o.value === value) ?? null;
  const pinned = options.filter((o) => o.pinned);
  const shown = useMemo(
    () => [...filterOptions(options, canSearch && query ? query : ''), ...pinned],
    [options, canSearch, query],
  );
  const matches = shown.filter((o) => !o.pinned).length;

  const listboxId = `${id}-listbox`;
  const optionId = (i: number) => `${id}-option-${i}`;

  useEffect(() => {
    activeRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [active, open]);

  const close = () => {
    setOpen(false);
    setQuery(null);
  };
  const openList = () => {
    if (disabled || open) return;
    const at = shown.findIndex((o) => o.value === value);
    setActive(at >= 0 ? at : 0);
    setOpen(true);
  };
  const choose = (option: Option) => {
    onChange(option.value);
    close();
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) openList();
        else setActive((a) => Math.min(a + 1, shown.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) openList();
        else setActive((a) => Math.max(a - 1, 0));
        break;
      case 'Home':
      case 'End':
        if (open && !canSearch) {
          e.preventDefault();
          setActive(e.key === 'Home' ? 0 : shown.length - 1);
        }
        break;
      case 'Enter':
        if (open && shown[active]) {
          e.preventDefault();
          choose(shown[active]);
        }
        break;
      case ' ':
        if (!canSearch) {
          e.preventDefault();
          if (open && shown[active]) choose(shown[active]);
          else openList();
        }
        break;
      case 'Escape':
        if (open) {
          e.preventDefault();
          e.stopPropagation();
          close();
        }
        break;
      case 'Tab':
        close();
        break;
    }
  };

  const inputValue = canSearch && open && query !== null ? query : (selected?.label ?? '');
  const style = (s: CSSProperties): CSSProperties | undefined => (unstyled ? undefined : s);

  return (
    <div
      className={classNames.root}
      data-open={open || undefined}
      data-searchable={canSearch || undefined}
      style={style({ position: 'relative' })}
    >
      <div className={classNames.control} style={style({ display: 'flex', alignItems: 'center', gap: 4 })}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          className={classNames.input}
          style={style({ flex: 1, minWidth: 0 })}
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete={canSearch ? 'list' : 'none'}
          aria-activedescendant={open && shown[active] ? optionId(active) : undefined}
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          readOnly={!canSearch}
          placeholder={canSearch ? (searchPlaceholder ?? placeholder) : placeholder}
          value={inputValue}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onClick={() => (open ? close() : openList())}
          onKeyDown={onKeyDown}
          onBlur={close}
        />
        {clearable && selected && !disabled && (
          <button
            type="button"
            tabIndex={-1}
            className={classNames.clear}
            aria-label={clearLabel}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange(null);
              close();
              inputRef.current?.focus();
            }}
          >
            ×
          </button>
        )}
        <span
          aria-hidden="true"
          className={classNames.toggle}
          style={style({ pointerEvents: 'none', marginInlineStart: -22, marginInlineEnd: 6, fontSize: '0.7em' })}
        >
          ▾
        </span>
      </div>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className={classNames.listbox}
          // Keep focus in the input while the pointer is on the list.
          onMouseDown={(e) => e.preventDefault()}
          style={style({
            position: 'absolute',
            zIndex: 20,
            insetInline: 0,
            top: '100%',
            marginTop: 2,
            maxHeight: 260,
            overflowY: 'auto',
            padding: 0,
            listStyle: 'none',
            background: 'Canvas',
            color: 'CanvasText',
            border: '1px solid GrayText',
            borderRadius: 6,
          })}
        >
          {matches === 0 && (
            <li role="option" aria-disabled="true" aria-selected="false" className={classNames.empty} style={style({ padding: '6px 10px', opacity: 0.7 })}>
              {noResultsText}
            </li>
          )}
          {shown.map((o, i) => {
            const isActive = i === active;
            const isSelected = o.value === value;
            return (
              <li
                key={o.value}
                id={optionId(i)}
                ref={isActive ? activeRef : undefined}
                role="option"
                aria-selected={isSelected}
                data-active={isActive || undefined}
                data-pinned={o.pinned || undefined}
                className={classNames.option}
                style={style({
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 600 : undefined,
                  background: isActive ? 'Highlight' : undefined,
                  color: isActive ? 'HighlightText' : undefined,
                  borderTop: o.pinned && i > 0 ? '1px solid GrayText' : undefined,
                })}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(o)}
              >
                {o.label}
              </li>
            );
          })}
        </ul>
      )}

      {name && <input type="hidden" name={name} value={value ?? ''} />}
    </div>
  );
}
