#!/usr/bin/env python3
"""Auditoría de identidad y evidencias para el cierre de PC2.
Excluye deliberadamente los PDF originales del enunciado y LEC06/07.
"""
from pathlib import Path
from docx import Document
from zipfile import ZipFile
from datetime import date
import csv
import subprocess

root=Path(__file__).resolve().parents[1]
old='202'+'36743A'
new='20215508C'
members=[
    ('Santa Cruz Basilio, Jesus Diego','20235005G'),
    ('López Arteaga, César Omar',new),
    ('Pumayauli Evangelista, Bryan José','20212209E')
]
text_ext={'.md','.csv','.py','.cjs','.js','.mjs','.html','.yml','.yaml','.json','.css','.svg','.txt','.webmanifest','.dot'}
errors=[];checked=[]

for p in root.rglob('*'):
    if not p.is_file() or p.suffix.lower() not in text_ext:continue
    if '.git' in p.parts or 'node_modules' in p.parts:continue
    txt=p.read_text(encoding='utf-8')
    checked.append(p)
    if old in txt:errors.append(f'Código antiguo en archivo de texto: {p.relative_to(root)}')

def doc_text(d):
    p=[x.text for x in d.paragraphs]
    for t in d.tables:
        for row in t.rows:
            for cell in row.cells:p.extend(x.text for x in cell.paragraphs)
    for s in d.sections:
        p.extend(x.text for x in s.footer.paragraphs)
        p.extend(x.text for x in s.header.paragraphs)
    return '\n'.join(p)

words=sorted(root.rglob('*.docx'))
for p in words:
    checked.append(p)
    try:
        value=doc_text(Document(p))
        if old in value:errors.append(f'Código antiguo en Word: {p.relative_to(root)}')
    except Exception as e:errors.append(f'Word no accesible: {p.relative_to(root)}: {e}')

source_pdfs={'LEC06-fuente.pdf','LEC07-fuente.pdf','PC02-enunciado.pdf'}
pdfs=[p for p in root.rglob('*.pdf') if p.name not in source_pdfs]
for p in pdfs:
    checked.append(p)
    done=subprocess.run(['pdftotext',str(p),'-'],capture_output=True,text=True)
    if done.returncode:errors.append(f'PDF ilegible: {p.relative_to(root)}');continue
    if old in done.stdout:errors.append(f'Código antiguo en PDF: {p.relative_to(root)}')

ppt=root/'presentacion/PC2-TriageVoz-Rural-Grupo10.pptx'
with ZipFile(ppt) as z:
    slide_xml=' '.join(z.read(f).decode('utf-8') for f in z.namelist()
                       if f.startswith('ppt/slides/slide') and f.endswith('.xml'))
if old in slide_xml or new not in slide_xml:
    errors.append('Presentación sin código definitivo o con código antiguo')

mydoc=Document(root/'mi-aporte-cesar-lopez-arteaga.docx')
mytext=doc_text(mydoc)
for name,code in members:
    if name not in mytext or code not in mytext:
        errors.append(f'Integrante ausente en aporte César: {name} {code}')
if len(mydoc.inline_shapes)!=4:errors.append('El Word de César debe incluir exactamente 4 capturas')
if 'Consolidé' not in mytext or 'Verifiqué' not in mytext:
    errors.append('No consta redacción personal del aporte')

with (root/'docs/05-trazabilidad.csv').open(encoding='utf-8',newline='') as f:
    matrix=list(csv.DictReader(f))
if len(matrix)!=35:errors.append('Matriz no contiene 35 requerimientos')
if len(matrix[0])!=8 or 'ID HU' not in matrix[0]:
    errors.append('Matriz no sigue los ocho campos de la rúbrica')
for row in matrix:
    if not row.get('ID HU') or not row.get('Evidencia/Criterio de aceptación'):
        errors.append('Fila incompleta en matriz: '+row.get('ID Req','?'))

assets=[
  '01-caso-enviado.png','02-bandeja-casos.png',
  '03-confirmacion-historial.png','04-respuesta-paciente.png'
]
for name in assets:
    f=root/'assets/evidencias-integracion'/name
    if not f.is_file() or f.stat().st_size<10000:
        errors.append('Captura faltante o vacía: '+name)

roster=(root/'docs/12-integrantes-grupo-10.md').read_text(encoding='utf-8')
for name,code in members:
    if name not in roster or code not in roster:errors.append('Registro oficial incorrecto: '+name)

if errors:raise SystemExit('\n'.join(errors))
report=root/'docs/16-auditoria-cierre-PC2.md'
report.write_text(
  '# Auditoría final de identidad y evidencias — PC2 CC451\n\n'
  '## Integrantes oficiales\n\n'+
  ''.join(f'- **{name}** — {code}\n' for name,code in members)+
  '\n## Resultados comprobados\n\n'
  '| Control | Resultado |\n|---|---|\n'
  f'| Archivos de texto revisados | {len([p for p in checked if p.suffix.lower() in text_ext])} |\n'
  f'| Documentos Word revisados | {len(words)} |\n'
  f'| PDF del proyecto examinados | {len(pdfs)} |\n'
  '| PPTX de sustentación | Código definitivo validado |\n'
  '| Aporte de César | Primera persona y cuatro imágenes de ejecución E2E |\n'
  '| Matriz de trazabilidad | 35 filas y ocho columnas, incluye ID HU |\n'
  '| Capturas verificadas | Cuatro imágenes enlazadas e integradas en Word |\n'
  '| Códigos anteriores en fuentes y entregables | Ninguno detectado |\n\n'
  'Los PDF de LEC06, LEC07 y el enunciado PC2 se han **excluido de edición**, por tratarse de documentos fuente anteriores.\n\n'
  'Las capturas dentro del Word se obtuvieron en Chromium mediante pruebas E2E sobre casos ficticios; son independientes de la sesión manual de César. '
  'No hay ensayos con pacientes ni validación clínica.\n',encoding='utf-8'
)
print('Auditoría aprobada:',len(checked),'archivos y cuatro evidencias')
