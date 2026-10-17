import { describe, expect, it } from 'vitest';
import { maskPhone, normalizeUaPhone } from './phone';

describe('normalizeUaPhone', () => {
  it.each([
    ['380991234567', '380991234567'],
    ['+380 (99) 123-45-67', '380991234567'],
    ['0991234567', '380991234567'],
    ['099 123 45 67', '380991234567'],
    ['80991234567', '380991234567'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeUaPhone(input)).toBe(expected);
  });

  it.each([
    [''],
    ['abc'],
    ['38099123456'], // 11 цифр з 380
    ['3809912345678'], // 13 цифр
    ['380441234567'], // стаціонарний (Київ) — не мобільний
    ['380121234567'], // неіснуючий код оператора
    ['491701234567'], // не український
  ])('rejects %s', (input) => {
    expect(normalizeUaPhone(input)).toBeNull();
  });
});

describe('maskPhone', () => {
  it('keeps the operator code and last four digits', () => {
    expect(maskPhone('380991234567')).toBe('+38099•••4567');
  });
});
