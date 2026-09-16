import assert from 'node:assert/strict';
import {BudgetEngine} from '../src/lib/budgetEngine.js';
for(const [area,budget,expected] of [[0.5,'1000-2500',{low:1000,high:2500}],[30,'200-500萬',{low:2000000,high:5000000}],[30,'200.25-500.75萬',{low:2002500,high:5007500}]]){
 const result=BudgetEngine.analyze({square_footage:area,budget_range:budget});
 assert.equal(result.assumptions.area_ping,area);
 assert.deepEqual(result.estimated_range,expected);
 assert.equal(result.formatted_range,`NT$ ${expected.low.toLocaleString('en-US')}–${expected.high.toLocaleString('en-US')}`);
}
assert.equal(BudgetEngine.analyze({square_footage:0.5}).assumptions.area_ping,0.5);
assert.deepEqual(BudgetEngine.analyze({square_footage:0.01}).estimated_range,{low:697,high:1003});
assert.match(BudgetEngine.analyze({square_footage:30}).engine_version,/-budget-2026\.09\.16$/);
assert.equal(BudgetEngine.analyze({}).assumptions.area_ping,25);
assert.ok(BudgetEngine.analyze({}).risk_flags.some(flag=>flag.code==='AREA_MISSING'));
console.log('PASS: explicit budget bounds and sub-one-ping area; missing-area fallback remains disclosed.');
