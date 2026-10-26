import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizePhone,isValidInternationalPhone} from './whatsapp/pairing.js';
test('normalizes phone formatting',()=>assert.equal(normalizePhone('+62 812-3456-7890'),'6281234567890'));
test('accepts international digit string',()=>assert.equal(isValidInternationalPhone('6281234567890'),true));
test('rejects too-short number',()=>assert.equal(isValidInternationalPhone('1234'),false));
