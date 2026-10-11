from pathlib import Path
import base64,json
root=Path(__file__).resolve().parent
common=(root.parent/'titans-ui/src/components/Controls/fc-ios-controller.css').read_text()
shell=(root/'src/shell.html').read_text()
css=(root/'src/game.css').read_text()
js='\n'.join((root/'src'/name).read_text() for name in ('panel.js','belt-core.js','art.js','fx.js','music.js','game.js'))
assets={p.stem:'data:image/'+('jpeg' if p.suffix=='.jpg' else p.suffix[1:])+';base64,'+base64.b64encode(p.read_bytes()).decode() for p in (root/'assets').glob('*') if p.suffix in ('.png','.webp','.jpg')}
js=js.replace('/* ART_ASSETS */{}',json.dumps(assets,separators=(',',':')))
js=js.replace('/* ART_BAKED */{heroFrames:[],bounds:{}}',(root/'src/art-baked.json').read_text())
(root/'index.html').write_text(shell.replace('/* COMMON_CSS */',common).replace('/* GAME_CSS */',css).replace('/* GAME_JS */',js))
total=sum(p.stat().st_size for p in root.rglob('*') if p.is_file() and not any(s in p.parts for s in ('.git','_playtest','node_modules')))
print(f'index.html: {(root/"index.html").stat().st_size:,} bytes (images embedded; BGM is audio/*.m4a)')
print(f'folder total (excl .git/_playtest): {total/1048576:.2f} MB / 20.00 MB limit')
