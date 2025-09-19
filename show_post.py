from pathlib import Path
text = Path('src/app/api/tailor/route.ts').read_text()
idx = text.find('export const POST')
print(text[idx:idx+1000])
