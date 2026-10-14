#!/usr/bin/env python3
"""Convierte el anexo de revisión (Markdown) en DOCX reproducible. La conversión a PDF se realiza en CI."""
from pathlib import Path
from docx import Document
from docx.shared import Cm,Pt,RGBColor
import re
root=Path(__file__).resolve().parents[1]
source=root/'docs/14-anexo-version-actual.md'
target=root/'docs/14-anexo-version-actual.docx'
doc=Document()
section=doc.sections[0]
section.top_margin=Cm(2.3);section.bottom_margin=Cm(2.2)
section.left_margin=Cm(2.6);section.right_margin=Cm(2.4)
normal=doc.styles['Normal']
normal.font.name='Aptos';normal.font.size=Pt(10.5)
normal.paragraph_format.space_after=Pt(7)
for heading in ['Title','Heading 1','Heading 2']:
    doc.styles[heading].font.name='Aptos'
    doc.styles[heading].font.color.rgb=RGBColor(15,78,101)
for raw in source.read_text(encoding='utf-8').splitlines():
    line=raw.strip()
    if not line:continue
    if line.startswith('# '):doc.add_heading(line[2:],0)
    elif line.startswith('## '):doc.add_heading(line[3:],1)
    elif line.startswith('### '):doc.add_heading(line[4:],2)
    elif line.startswith('>'):doc.add_paragraph(line.lstrip('> ').replace('**',''))
    elif line.startswith('- '):doc.add_paragraph(line[2:].replace('**','').replace('`',''),'List Bullet')
    elif re.match(r'^\d+\. ',line):doc.add_paragraph(re.sub(r'^\d+\. ','',line).replace('**','').replace('`',''),'List Number')
    else:doc.add_paragraph(line.replace('**','').replace('`',''))
footer=section.footer.paragraphs[0]
footer.text='UNI · CC451 · Grupo 10 · Anexo de integración PC2 · 2026-II'
footer.style='Caption'
doc.core_properties.title='Anexo de integración PC2 - TriageVoz Rural'
doc.core_properties.author='Grupo 10 - Santa Cruz Basilio, López Arteaga, Pumayauli Evangelista'
target.parent.mkdir(parents=True,exist_ok=True)
doc.save(target)
print(target)
