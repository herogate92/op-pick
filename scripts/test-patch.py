import importlib.util
import unittest
from unittest.mock import patch
import tempfile, os, json
from pathlib import Path
s=importlib.util.spec_from_file_location('patch','scripts/check-patch.py');p=importlib.util.module_from_spec(s);s.loader.exec_module(p)
BODY='<div class="PatchNotes-patch PatchNotes-live"><div id="patch-2026-09-08"></div><p>'+('Hero update. '*20)+'</p></div>'
class Tests(unittest.TestCase):
 def test_markup_and_chrome_ignored(self):self.assertEqual(p.fingerprint(BODY),p.fingerprint('<nav>changed</nav>'+BODY+'<footer>other</footer>'))
 def test_content_revision_detected(self):self.assertNotEqual(p.fingerprint(BODY),p.fingerprint(BODY.replace('Hero update.','Hero balance.')))
 def test_old_patch_ignored(self):self.assertEqual(p.fingerprint(BODY),p.fingerprint(BODY+BODY.replace('09-08','09-01')))
 def test_invalid_fails_closed(self):
  for html in ['denied','<div class="PatchNotes-patch">incomplete',BODY.replace('patch-2026-09-08','missing')]:
   with self.assertRaises(ValueError):p.fingerprint(html)
class GateTests(unittest.TestCase):
 def run_gate(self,event,previous):
  with tempfile.TemporaryDirectory() as directory:
   old=os.getcwd(); os.chdir(directory)
   try:
    output=Path(directory)/'output'
    with patch.dict(os.environ,{'GITHUB_OUTPUT':str(output),'GITHUB_EVENT_NAME':event}), patch.object(p,'read_url',side_effect=[BODY,json.dumps(previous)]):p.main()
    return output.read_text(),Path('public/patch-state.json').exists()
   finally:os.chdir(old)
 def test_unchanged_schedule_skips(self):self.assertEqual(self.run_gate('schedule',p.fingerprint(BODY)),('changed=false\n',False))
 def test_changed_schedule_writes_candidate_marker(self):self.assertEqual(self.run_gate('schedule',{'digest':'0'*64}),('changed=true\n',True))
 def test_manual_runs_even_if_unchanged(self):self.assertEqual(self.run_gate('workflow_dispatch',p.fingerprint(BODY)),('changed=true\n',True))
if __name__=='__main__':unittest.main()
