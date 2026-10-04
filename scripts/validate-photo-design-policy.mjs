import assert from 'node:assert/strict';
import { photoDesignPolicy } from '../src/lib/photoDesignPolicy.js';

const preserve = photoDesignPolicy('維持格局與主要物件', '客廳');
assert.equal(preserve.denoise, 0.72);
assert.equal(preserve.negative, '');
const redesign = photoDesignPolicy('保留格局，重新設計家具與材質', '客廳');
assert.equal(redesign.denoise, 0.85);
assert.match(redesign.prompt, /sofa, coffee table/);
assert.match(redesign.prompt, /walls, windows and doors/);
assert.match(redesign.negative, /unfurnished/);
assert.match(photoDesignPolicy('保留格局，重新設計家具與材質', '臥室').prompt, /bed with bedding/);
assert.doesNotMatch(photoDesignPolicy('保留格局，重新設計家具與材質', '臥室').prompt, /sofa/);
assert.equal(photoDesignPolicy('unknown', '客廳').denoise, 0.72);
assert.equal(photoDesignPolicy('自由創意重新設計', '客廳').denoise, 0.92);
console.log('PASS: photo redesign intent, room furniture and conservative fallback');
