import { describe, expect, it } from 'vitest';
import {
  getDistrict,
  getDistricts,
  getDistrictsByProvince,
  getDivision,
  getDivisions,
  getLocalities,
  getMeta,
  getProvince,
  getProvinces,
  getTehsil,
  getTehsils,
} from '../src/index';

describe('hierarchy', () => {
  it('has the expected totals', () => {
    const provinces = getProvinces();
    const divisions = provinces.flatMap((p) => getDivisions(p.id));
    const districts = provinces.flatMap((p) => getDistrictsByProvince(p.id));
    const tehsils = districts.flatMap((d) => getTehsils(d.id));
    expect([provinces.length, divisions.length, districts.length, tehsils.length]).toEqual([7, 36, 160, 620]);
  });

  it('cascades Punjab -> Multan -> Vehari -> Mailsi', () => {
    const pb = getProvinces().find((p) => p.name === 'Punjab')!;
    const multan = getDivisions(pb.id).find((d) => d.name === 'Multan')!;
    const vehari = getDistricts(multan.id).find((d) => d.name === 'Vehari')!;
    expect(vehari.id).toBe('pb-vehari');
    expect(getTehsils(vehari.id).map((t) => t.name)).toContain('Mailsi');
  });

  it('keeps AJK divisions out of Gilgit-Baltistan', () => {
    expect(getDivisions('ajk').map((d) => d.name)).toEqual(['Mirpur', 'Muzaffarabad', 'Poonch']);
    expect(getDivisions('gb').map((d) => d.name)).toEqual(['Baltistan', 'Diamer', 'Gilgit']);
  });

  it('handles Islamabad, which has no divisions', () => {
    expect(getDivisions('ict')).toEqual([]);
    const [isb] = getDistrictsByProvince('ict');
    expect(isb.divisionId).toBeNull();
    expect(getTehsils(isb.id).map((t) => t.name)).toEqual(['Islamabad']);
  });

  it('covers Gilgit-Baltistan and AJK tehsils', () => {
    expect(getTehsils('gb-gilgit').map((t) => t.name)).toContain('Gilgit');
    expect(getTehsils('ajk-bagh').map((t) => t.name)).toEqual(['Bagh', 'Dhir Kot', 'Harighel']);
  });

  it('has the districts created since 2017 that the COD-AB data lists', () => {
    const names = (provinceId: string) => getDistrictsByProvince(provinceId).map((d) => d.name);
    expect(names('kp')).toEqual(expect.arrayContaining(['Lower Chitral', 'Upper Chitral', 'Lower Kohistan', 'Upper Kohistan', 'Kolai-Palas']));
    expect(names('kp')).not.toContain('Chitral');
    expect(names('bl')).toEqual(expect.arrayContaining(['Chaman', 'Duki', 'Shaheed Sikandarabad']));
    expect(getDistrict('kp-lower-chitral')?.divisionId).toBe('kp-malakand-div');
  });

  it('keeps alternate names for search and drops duplicate tehsils', () => {
    expect(getDistrict('sd-shaheed-benazir-abad')?.altNames).toContain('Nawabshah');
    expect(getDistrict('pb-dera-ghazi-khan')?.altNames).toContain('DG Khan');
    expect(getDistrict('bl-sherani')?.name).toBe('Sherani');
    expect(getDistrict('ajk-sudhnoti')?.name).toBe('Sudhnoti');
    const jhang = getTehsils('pb-jhang').map((t) => t.name);
    expect(jhang).toContain('Athara Hazari');
    expect(jhang).not.toContain('18 Hazari');
    expect(getDistricts('kp-hazara-div').map((d) => d.name).join()).not.toMatch(/[()]/);
  });

  it('carries OCHA p-codes', () => {
    expect(getProvince('pb')?.pcode).toBe('PK6');
    expect(getDistrict('pb-vehari')?.pcode).toMatch(/^PK6\d+$/);
  });

  it('returns [] for unknown ids', () => {
    expect(getDivisions('nope')).toEqual([]);
    expect(getDistricts('nope')).toEqual([]);
    expect(getTehsils('nope')).toEqual([]);
    expect(getLocalities('nope')).toEqual([]);
  });

  it('looks records up by id', () => {
    expect(getProvince('pb')?.name).toBe('Punjab');
    expect(getDivision('pb-multan-div')?.provinceId).toBe('pb');
    expect(getDistrict('pb-vehari')?.divisionId).toBe('pb-multan-div');
    expect(getTehsil(getTehsils('pb-vehari')[0].id)?.districtId).toBe('pb-vehari');
    expect(getProvince('nope')).toBeUndefined();
  });

  it('returns copies that are safe to mutate', () => {
    getProvinces().length = 0;
    getTehsils('pb-vehari').pop();
    expect(getProvinces()).toHaveLength(7);
    expect(getTehsils('pb-vehari').length).toBeGreaterThan(0);
  });

  it('exposes meta with sources', () => {
    const meta = getMeta();
    expect(meta.dataVersion).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(meta.sources.length).toBeGreaterThan(0);
  });
});
