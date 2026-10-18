"""Deterministic source-evidence download. Contains no private or unfiltered city rows."""
from pathlib import Path
import json
import zipfile
root=Path(__file__).resolve().parent.parent
target=root/'downloads'/'neighborhoodos-evidence-pack.zip'
target.parent.mkdir(exist_ok=True)
docs=['Principles','Grant-Kit','Budget-and-Hardware','Evaluation-and-Metrics','Safety-Doctrine','Threat-Model','Language-Access','Roles-and-Staffing','Partner-MOU','Partners','Data-Sources','Handoff-and-Licensing','Known-Gaps-and-Roadmap']
files=[root/'wiki'/f'{name}.md' for name in docs]+[root/'data'/'neighborhoods.json']+list((root/'data'/'snapshots').glob('*.json'))
files += [root/'docs'/name for name in ['Level-1-Safe-AI-User.md','Level-2-Problem-Framer.md','Level-3-Tool-Builder.md','Civic-Data-Ingest-Guide.md']]
readme='''NeighborhoodOS evidence pack — October 2026 website release

A KC Digital Drive program. Created by Simon L. Paige, site administrator and advisor.

Start with wiki/Grant-Kit.md. This pack contains planning documents and dated aggregate public-data snapshots. It does not contain partner letters, executed agreements, awards, or cohort outcomes. Budget figures are planning ranges. Dashboard figures use named official polygons and must not be mixed with the older handoff report's bounding-box figures.

The snapshots list their source date, preparation date, window, privacy rules, and methods. No raw household complaint locations, resident names, coordinates, free text, or individual animal/encampment records are included.

Current program: https://neighborhoodos.org/
Funder materials: https://neighborhoodos.org/funders/
Program contact: https://www.kcdigitaldrive.org/contact/
'''
with zipfile.ZipFile(target,'w',compression=zipfile.ZIP_DEFLATED) as archive:
    def add(name,data):
        info=zipfile.ZipInfo(name,date_time=(2026,10,17,0,0,0))
        info.compress_type=zipfile.ZIP_DEFLATED
        archive.writestr(info,data)
    add('READ-ME.txt',readme.encode())
    for file in sorted(files):add(file.relative_to(root).as_posix(),file.read_bytes())
with zipfile.ZipFile(target) as archive:
    assert archive.testzip() is None
    for file in archive.namelist():
        if '/snapshots/' in file:json.loads(archive.read(file))
print(f'Packaged and verified {len(files)+1} files: {target}')
