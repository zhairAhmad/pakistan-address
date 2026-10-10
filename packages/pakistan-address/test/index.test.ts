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
    expect([provinces.length, divisions.length, districts.length, tehsils.length]).toEqual([7, 40, 174, 682]);
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
    expect(names('bl')).toEqual(expect.arrayContaining(['Chaman', 'Duki', 'Surab']));
    expect(getDistrict('kp-lower-chitral')?.divisionId).toBe('kp-malakand-div');
  });

  it('keeps alternate names for search and drops duplicate tehsils', () => {
    expect(getDistrict('sd-shaheed-benazir-abad')?.altNames).toContain('Nawabshah');
    expect(getDistrict('pb-dera-ghazi-khan')?.altNames).toContain('DG Khan');
    expect(getDistrict('bl-sherani')?.name).toBe('Sherani');
    expect(getDistrict('ajk-sudhnoti')?.name).toBe('Sudhnoti');
    const hazari = getTehsils('pb-jhang').find((t) => t.name === '18-Hazari');
    expect(hazari?.altNames).toContain('Athara Hazari');
    expect(getTehsils('pb-jhang').filter((t) => /hazari/i.test(t.name))).toHaveLength(1);
    expect(getDistricts('kp-hazara-div').map((d) => d.name).join()).not.toMatch(/[()]/);
  });

  it('has the press-reported KP and Punjab changes', () => {
    const names = (id: string) => getTehsils(id).map((t) => t.name);
    expect(getDistrict('kp-south-waziristan')).toBeUndefined();
    expect(names('kp-lower-south-waziristan')).toEqual(['Birmal', 'Toi Khulla', 'Wana']);
    expect(names('kp-upper-swat')).toContain('Matta Kharirai');
    expect(names('kp-swat')).toEqual(['Babuzai', 'Barikot', 'Charbagh', 'Kabal']);
    expect(getDivisions('pb')).toHaveLength(10);
    expect(getDistricts('pb-gujrat-div').map((d) => d.name)).toEqual(['Gujrat', 'Hafizabad', 'Mandi Bahauddin', 'Wazirabad']);
    expect(getDistrictsByProvince('pb')).toHaveLength(41);
    expect(getDistrict('pb-murree')?.divisionId).toBe('pb-rawalpindi-div');
    expect(names('pb-kot-addu')).toEqual(['Chowk Sarwar Shaheed', 'Kot Addu']);
  });

  it('warns about Balochistan and no other province', () => {
    expect(getProvince('bl')?.notice).toMatch(/July 2026/);
    expect(getProvinces().filter((p) => p.notice).map((p) => p.id)).toEqual(['bl']);
  });

  it('applies the Balochistan Board of Revenue notifications up to April 2026', () => {
    const names = (id: string) => getTehsils(id).map((t) => t.name);
    // new divisions and districts
    expect(getDistricts('bl-koh-e-suleman-div').map((d) => d.name)).toEqual(['Barkhan', 'Kohlu', 'North Dera Bugti']);
    expect(getDivision('bl-sibi-div')?.name).toBe('Sevi');
    for (const id of ['bl-hub', 'bl-usta-muhammad', 'bl-tump', 'bl-barshore', 'bl-upper-dera-bugti']) {
      expect(getDistrict(id)).toBeDefined();
    }
    // tehsils follow the notifications
    expect(names('bl-hub')).toEqual(['Dureji', 'Gaddani', 'Hub', 'Sonmiani']);
    expect(names('bl-lasbela')).toEqual(['Bela', 'Kanraj', 'Lakhra', 'Liari', 'Uthal']);
    expect(names('bl-pishin')).toEqual(['Bostan', 'Hurramzai', 'Karbala', 'Karezat Khanozai', 'Nana Sahib', 'Pishin', 'Saranan']);
    expect(names('bl-barshore')).toEqual(['Barshore']);
    expect(names('bl-tump')).toEqual(['Mand', 'Tump']);
    expect(names('bl-nushki')).toEqual(['Ahmed Wal', 'Daak', 'Kishingi', 'Nushki']);
    expect(names('bl-dera-bugti')).toEqual(['Dera Bugti', 'Sangseelah', 'Sui']); // South Dera Bugti after July 2026
    expect(names('bl-kohlu')).toContain('Sufaid');
    // the old Phelawagh name is an alternate name of Qadirabad, which now sits in Upper (North) Dera Bugti
    expect(getTehsil('bl-upper-dera-bugti-qadirabad')?.altNames).toContain('Phelawagh');
    expect(getTehsil('bl-dera-bugti-phelawagh')).toBeUndefined();
  });

  it('applies the press-reported July 2026 restructuring of Balochistan at division and district level', () => {
    const divisions = getDivisions('bl');
    const districts = divisions.flatMap((d) => getDistricts(d.id));
    expect([divisions.length, districts.length]).toEqual([11, 41]);
    const of = (id: string) => getDistricts(id).map((d) => d.name);
    expect(of('bl-quetta-div')).toEqual(['Mastung', 'Quetta East', 'Quetta West']);
    expect(of('bl-khuzdar-div')).toEqual(['Kalat', 'Khuzdar', 'Surab', 'Wadh']);
    expect(of('bl-lasbela-div')).toEqual(['Awaran', 'Hub', 'Lasbela']);
    expect(of('bl-pishin-div')).toEqual(['Barshore', 'Chaman', 'Killa Abdullah', 'Pishin']);
    expect(of('bl-sibi-div')).toEqual(['Kachhi', 'Sevi', 'South Dera Bugti']);
    expect(of('bl-loralai-div')).toEqual(['Duki', 'Harnai', 'Loralai', 'Musakhel', 'Ziarat']);
    expect(getDivision('bl-kalat-div')).toBeUndefined();
    expect(getDivision('bl-makran-div')?.name).toBe('Makuran');
    // Quetta East continues the old district (codes kept); Quetta West is new and has no codes
    expect(getDistrict('bl-quetta')?.pbsCode).toBeDefined();
    expect(getDistrict('bl-quetta-west')?.pbsCode).toBeUndefined();
    expect(getTehsils('bl-quetta-west').map((t) => t.name)).toEqual(['Brewery', 'Kuchlak', 'Panjpai']);
    expect(getTehsils('bl-wadh').map((t) => t.name)).toEqual(['Naal', 'Ornach', 'Wadh']);
    expect(getProvince('bl')?.notice).toMatch(/press reports/);
  });

  it('follows the PBS census 2023 for Karachi, Punjab and the untouched parts of Balochistan', () => {
    const names = (id: string) => getTehsils(id).map((t) => t.name);
    expect(getDistricts('bl-zhob-div').map((d) => d.name)).toEqual(['Killa Saifullah', 'Sherani', 'Zhob']);
    expect(getDistrict('bl-lehri')).toBeUndefined();
    expect(getDistrict('bl-surab')?.altNames).toContain('Shaheed Sikandarabad');
    expect(getDistrict('sd-keamari')?.divisionId).toBe('sd-karachi-div');
    expect(names('sd-keamari')).toEqual(['Baldia', 'Keamari', 'Mauripur', 'SITE']);
    expect(names('sd-karachi-south')).toContain('Saddar');
    expect(names('pb-muzaffargarh')).toEqual(['Alipur', 'Jatoi', 'Muzaffargarh']);
    expect(names('pb-layyah')).toContain('Layyah');
  });

  it('matches the Punjab notification of 18 December 2024 (10 divisions, 41 districts, 156 tehsils)', () => {
    const divisions = getDivisions('pb');
    const districts = getDistrictsByProvince('pb');
    expect(divisions).toHaveLength(10);
    expect(districts).toHaveLength(41);
    expect(districts.flatMap((d) => getTehsils(d.id))).toHaveLength(156);
    expect(getTehsils('pb-taunsa').map((t) => t.name)).toEqual(['Koh-e-Suleman', 'Taunsa', 'Vehova']);
    expect(getDistrict('pb-taunsa')?.divisionId).toBe('pb-dera-ghazi-khan-div');
    expect(getTehsils('pb-lahore')).toHaveLength(10);
    expect(getTehsils('pb-talagang').map((t) => t.name)).toEqual(['Lawa', 'Talagang']);
    expect(getTehsils('pb-murree').map((t) => t.name)).toEqual(['Kotli Sattian', 'Murree']);
    expect(getTehsils('pb-gujrat').map((t) => t.name)).toContain('Kunjah');
  });

  it('has the six Sindh divisions of the census (no Banbhore division)', () => {
    expect(getDivisions('sd').map((d) => d.name)).toEqual(['Hyderabad', 'Karachi', 'Larkana', 'Mirpur Khas', 'Shaheed Benazirabad', 'Sukkur']);
    expect(getDistricts('sd-hyderabad-div').map((d) => d.name)).toEqual(expect.arrayContaining(['Badin', 'Sujawal', 'Thatta']));
    expect(getDivision('sd-banbhore-div')).toBeUndefined();
  });

  it('carries PBS census codes', () => {
    expect(getProvince('pb')?.pbsCode).toBe('2');
    expect(getDistrict('pb-vehari')?.pbsCode).toMatch(/^\d+$/);
    expect(getTehsils('pb-vehari').every((t) => t.pbsCode)).toBe(true);
    expect(getDistrict('pb-murree')?.pbsCode).toBeUndefined();
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
