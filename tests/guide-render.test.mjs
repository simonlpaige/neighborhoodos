import test from 'node:test';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {renderGuide,guideSummary} from '../scripts/guide-render.mjs';
test('guide summaries keep link labels without Markdown syntax or source paths',()=>{assert.equal(guideSummary('# Title\n\nUse the [manual](../docs/Level-3-Tool-Builder.md) and **check sources**.'),'Use the manual and check sources.');});
test('manual links, local guides, and anchors resolve to published pages',()=>{const $=load(renderGuide('[manual](../docs/Level-3-Tool-Builder.md#review-the-whole-system) [rules](Safety-Doctrine.md#limits)\n\n## Review the whole system',{titles:{'Safety-Doctrine.md':'Safety'}}));assert.equal($('a').eq(0).attr('href'),'/guide/manual-tool-building/#review-the-whole-system');assert.equal($('a').eq(1).attr('href'),'/guide/safety-doctrine/#limits');assert.equal($('h2').attr('id'),'review-the-whole-system');});
test('unpublished source docs stay source links and Markdown does not inject HTML',()=>{const $=load(renderGuide('[source](../docs/PILOT-RUBRIC.md#red-light)\n\n<script>alert(1)</script>',{titles:{}}));assert.equal($('a').attr('href'),'https://github.com/simonlpaige/neighborhoodos/blob/main/docs/PILOT-RUBRIC.md#red-light');assert.equal($('script').length,0);});
