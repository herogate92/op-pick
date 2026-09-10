"""Gate scheduled deployments on the latest official live patch content."""
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
from urllib.request import urlopen, Request
from urllib.error import HTTPError

SOURCE = 'https://overwatch.blizzard.com/en-us/news/patch-notes/live/'
class LatestPatch(HTMLParser):
    def __init__(self):
        super().__init__(); self.depth=0; self.done=False; self.text=[]; self.date=None
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if not self.done and not self.depth and tag=='div' and 'PatchNotes-patch' in attrs.get('class','').split(): self.depth=1
        elif self.depth and tag=='div': self.depth+=1
        if self.depth and re.fullmatch(r'patch-\d{4}-\d{2}-\d{2}',attrs.get('id','')): self.date=attrs['id'][6:]
    def handle_endtag(self,tag):
        if self.depth and tag=='div':
            self.depth-=1
            if not self.depth:self.done=True
    def handle_data(self,text):
        if self.depth:self.text.append(text)

def fingerprint(html):
    parser=LatestPatch(); parser.feed(html)
    text=' '.join(' '.join(parser.text).split())
    if not parser.done or not parser.date or len(text)<100: raise ValueError('Official patch content missing or incomplete; refusing deployment')
    return {'patchDate':parser.date,'digest':hashlib.sha256(text.encode()).hexdigest(),'sourceUrl':SOURCE}

def read_url(url):
    with urlopen(Request(url,headers={'User-Agent':'OP-PICK-LAB patch-check'}),timeout=30) as response: return response.read().decode()

def main():
    current=fingerprint(read_url(SOURCE))
    try:
        previous=json.loads(read_url('https://opick.ggwp.kr/patch-state.json'))
        if not re.fullmatch('[0-9a-f]{64}',previous.get('digest','')): raise ValueError('Invalid deployed patch marker')
    except HTTPError as error:
        if error.code!=404:raise
        previous={}
    changed=current['digest']!=previous.get('digest') or os.environ.get('GITHUB_EVENT_NAME')!='schedule'
    if changed:
        Path('public').mkdir(exist_ok=True)
        Path('public/patch-state.json').write_text(json.dumps(current,indent=2)+'\n')
    with open(os.environ['GITHUB_OUTPUT'],'a') as output:output.write(f'changed={str(changed).lower()}\n')
    print(f"Official patch {current['patchDate']}: {'changed; refresh required' if changed else 'unchanged; skip refresh and deploy'}")
if __name__=='__main__':main()
