import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import {
  AddressFields,
  filterOptions,
  ModalPicker,
  OTHER,
  type Option,
} from '../src/index';
import { DeliveryAddressFields, SwitchableAddressFields } from '../src/delivery';

describe('ModalPicker & filterOptions', () => {
  const options: Option[] = [
    { value: 'pb-multan-div', label: 'Multan' },
    { value: 'pb-dgkhan-div', label: 'Dera Ghazi Khan', keywords: ['DG Khan'] },
    { value: OTHER, label: 'Other / not listed', pinned: true },
  ];

  it('returns all options when search query is empty', () => {
    expect(filterOptions(options, '')).toEqual(options);
    expect(filterOptions(options, '   ')).toEqual(options);
  });

  it('filters options by label matching case-insensitively', () => {
    const filtered = filterOptions(options, 'multan');
    expect(filtered.map((o) => o.value)).toEqual(['pb-multan-div', OTHER]);
  });

  it('filters options by keywords (altNames)', () => {
    const filtered = filterOptions(options, 'dg khan');
    expect(filtered.map((o) => o.value)).toEqual(['pb-dgkhan-div', OTHER]);
  });

  it('always retains pinned options like "Other"', () => {
    const filtered = filterOptions(options, 'non-existent-search-term');
    expect(filtered.map((o) => o.value)).toEqual([OTHER]);
  });

  it('renders ModalPicker trigger button with label/placeholder', () => {
    const html = renderToStaticMarkup(
      <ModalPicker
        label="Province"
        value={null}
        options={options}
        onSelect={vi.fn()}
        placeholder="Choose Province"
      />,
    );
    expect(html).toContain('Choose Province');
    expect(html).toContain('▼');
  });

  it('renders chosen option label when value is present', () => {
    const html = renderToStaticMarkup(
      <ModalPicker
        label="Division"
        value="pb-multan-div"
        options={options}
        onSelect={vi.fn()}
      />,
    );
    expect(html).toContain('Multan');
  });
});

describe('<AddressFields />', () => {
  it('renders initial state with Province and address line', () => {
    const html = renderToStaticMarkup(<AddressFields />);
    expect(html).toContain('Province');
    expect(html).toContain('Full address / landmark');
    expect(html).not.toContain('Division');
    expect(html).not.toContain('District');
    expect(html).not.toContain('Tehsil');
  });

  it('shows province notice for Balochistan and not for Punjab', () => {
    const htmlBalochistan = renderToStaticMarkup(
      <AddressFields
        defaultValue={{
          province: { id: 'bl', text: '' },
          division: { id: null, text: '' },
          district: { id: null, text: '' },
          tehsil: { id: null, text: '' },
          addressLine: '',
        }}
      />,
    );
    expect(htmlBalochistan).toContain('Balochistan');

    const htmlPunjab = renderToStaticMarkup(
      <AddressFields
        defaultValue={{
          province: { id: 'pb', text: '' },
          division: { id: null, text: '' },
          district: { id: null, text: '' },
          tehsil: { id: null, text: '' },
          addressLine: '',
        }}
      />,
    );
    expect(htmlPunjab).not.toContain('address-fields-notice');
  });

  it('renders text input when "Other" is chosen at a level', () => {
    const html = renderToStaticMarkup(
      <AddressFields
        defaultValue={{
          province: { id: 'pb', text: '' },
          division: { id: OTHER, text: 'Custom Division' },
          district: { id: null, text: '' },
          tehsil: { id: null, text: '' },
          addressLine: '',
        }}
      />,
    );
    expect(html).toContain('value="Custom Division"');
  });

  it('respects showAddressLine=false', () => {
    const html = renderToStaticMarkup(<AddressFields showAddressLine={false} />);
    expect(html).not.toContain('address-fields-field-addressLine');
  });
});

describe('<DeliveryAddressFields />', () => {
  it('renders unofficial notice by default', () => {
    const html = renderToStaticMarkup(<DeliveryAddressFields />);
    expect(html).toContain('delivery-address-fields-notice');
    expect(html).toContain('Unofficial list of delivery areas');
  });

  it('hides notice when hideNotice is true', () => {
    const html = renderToStaticMarkup(<DeliveryAddressFields hideNotice />);
    expect(html).not.toContain('delivery-address-fields-notice');
  });

  it('renders city and area fields for area-divided cities', () => {
    const html = renderToStaticMarkup(
      <DeliveryAddressFields
        defaultValue={{
          province: { id: 'dl-pb', text: '' },
          city: { id: 'dl-pb-lahore', text: '' },
          area: { id: null, text: '' },
          zone: { id: null, text: '' },
          addressLine: '',
        }}
      />,
    );
    expect(html).toContain('City');
    expect(html).toContain('Area');
  });
});

describe('<SwitchableAddressFields />', () => {
  it('renders official view by default', () => {
    const html = renderToStaticMarkup(<SwitchableAddressFields />);
    expect(html).toContain('switchable-address-fields-official');
    expect(html).not.toContain('switchable-address-fields-delivery');
  });

  it('renders delivery view when source is delivery', () => {
    const html = renderToStaticMarkup(<SwitchableAddressFields source="delivery" />);
    expect(html).toContain('switchable-address-fields-delivery');
    expect(html).not.toContain('switchable-address-fields-official');
  });
});
