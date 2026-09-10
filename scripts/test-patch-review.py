import importlib.util
import unittest
from copy import deepcopy
from pathlib import Path
s=importlib.util.spec_from_file_location('review',Path(__file__).with_name('patch-review.py'));r=importlib.util.module_from_spec(s);s.loader.exec_module(r)
def patch(date,text):
 return f'<div class="PatchNotes-patch"><div id="patch-{date}"></div><p>'+text+' A detailed description of this update and its effects on the game. '*3+'</p></div>'
def data():
 return {'heroes':[{'key':'ana','name':'아나'},{'key':'dva','name':'D.Va'},{'key':'lucio','name':'루시우'}], 'matchups':[{'id':'ana-dva','hero':'ana','counter':'dva','status':'verified'}], 'combos':[], 'team-synergies':[], 'team-cautions':[], 'maps':[]}
class Tests(unittest.TestCase):
 def test_aliases_and_boundaries(self):
  report=r.build_report(patch('2026-09-10','D.Va and Lúcio fixes. Banana event.'),data(),{},[])
  self.assertEqual(set(report['patches'][0]['heroes']),{'dva','lucio'})
  self.assertTrue(any(x['id']=='ana-dva' for x in report['items']))
 def test_every_visible_patch_processed(self):
  report=r.build_report(patch('2026-09-12','Ana')+patch('2026-09-11','D.Va'),data(),{},[])
  self.assertEqual(len(report['patches']),2)
 def test_generic_patch_always_requires_review(self):
  report=r.build_report(patch('2026-09-10','Global role changes'),data(),{},[])
  self.assertEqual([x['category'] for x in report['items']],['전체 규칙'])
 def test_queue_survives_archive_rollover(self):
  first=r.build_report(patch('2026-09-10','Ana'),data(),{},[])
  second=r.build_report(patch('2026-10-01','Global'),data(),first,[])
  self.assertTrue(any(x['id']=='ana' for x in second['items']))
 def test_same_date_revision_is_not_cleared(self):
  first=r.build_report(patch('2026-09-10','Ana first fix'),data(),{},[])
  second=r.build_report(patch('2026-09-10','Ana revised fix'),data(),first,[])
  self.assertEqual(len(second['patches']),2)
 def test_explicit_review_bound_to_content(self):
  html=patch('2026-09-10','Ana');first=r.build_report(html,data(),{},[])
  item=next(x for x in first['items'] if x['id']=='ana')
  decision={k:item[k] for k in ['patchDigest','category','id','contentDigest']}
  decision.update(decision='updated',summary='Checked relevant change',reviewedAt='2026-09-10')
  checked=r.build_report(html,data(),first,[decision])
  self.assertEqual(next(x for x in checked['items'] if x['id']=='ana')['status'],'reviewed')
  changed=deepcopy(data());changed['heroes'][0]['name']='changed'
  report=r.build_report(patch('2026-10-01','Global'),changed,checked,[decision])
  self.assertEqual(next(x for x in report['items'] if x['id']=='ana')['status'],'pending')
 def test_malformed_source_fails_closed(self):
  with self.assertRaises(ValueError):r.build_report('Denied',data(),{},[])
 def test_escape_html(self):
  d=data();d['heroes'][0]['name']='<script>alert(1)</script>'
  html=r.render(r.build_report(patch('2026-09-10','Ana'),d,{},[]))
  self.assertNotIn('<script>',html)
if __name__=='__main__':unittest.main()
