# ビジュアル制作記録 — 2026-10-11

制作方法：組み込み image_gen。CLI/APIへの切り替えなし。ユーザーの参考画像の方向性から、主人公を黒い胴着の重量級に統一。

採用素材は assets/hero.webp（30ポーズ）、assets/enemies.webp（4種×2ポーズ）、assets/scenes.webp（4エリア）。全素材をindex.htmlへ埋め込み。主人公・敵は透過PNGからロスレスWebPへ、背景は画質90のWebPへ形式変換。生成元PNGはCodexのgenerated_imagesに保持。

主人公の並びは完全な等間隔ではなかったため、画像自体は改変せず、描画時の切り出し範囲・足元基準を補正。隣のポーズの断片が混ざらないことを30ポーズの実描画で確認。

## 最終プロンプト

### hero.webp

```text
Game-ready transparent sprite sheet: EXACT 6 columns x 5 rows, 30 full-body poses of the SAME muscular adult male martial artist, always facing RIGHT. Character: rugged bearded dark-haired stone mason, very muscular realistic anatomy, sleeveless torn charcoal-black open-front gi, burgundy belt/sash, ivory wrist/knuckle wraps, loose dark trousers, bare feet. Premium highly detailed painted fantasy game art: believable skin, muscles, tendons, cloth folds and warm amber edge lighting. NO geometric cartoon/chibi style. NO text, no drawn grid, no scenery, no ground shadows, no effects. Transparent background. All equal-size cells, full bodies confined to their cell. Standing ground baseline at 90% of each cell, head around 15%; consistent size, consistent identity. Reserve right side of each cell for extended fists and feet.
30 poses, reading left-to-right each row:
ROW 1: relaxed fighting guard; breathing guard; walk left-foot-forward; walk passing pose; walk right-foot-forward; second walking passing pose.
ROW 2: left jab windup; left jab fully extended right; left jab retraction; right cross windup; right cross fully extended with hips rotated; right cross recovery.
ROW 3: two-hand punch windup fists at ribs; TWO fists extended right together in a deep forward stance; two-hand punch recovery; right front kick knee raised; right front kick fully extended horizontal to right; right front kick retracted knee.
ROW 4: left roundhouse kick knee raised with twist; left roundhouse kick fully extended right, supporting leg pivot; left kick recovery; dropkick crouch takeoff; dropkick airborne knees tucked; dropkick almost horizontal airborne both feet extended right.
ROW 5: dropkick horizontal double-heel impact airborne right; dropkick low crouching landing one hand to ground; rising after landing; forward evasive low running dash; hit reaction guarding chest; two-fist ground slam crouch.
STRICT layout: exactly six separate figures per row, five rows; never overlap cells. Every pose has exactly two anatomically coherent arms and two legs. A usable sprite atlas, not a poster.
```

### enemies.webp

```text
A production TRANSPARENT sprite atlas for a premium hand-painted realistic 2D dark fantasy beat-em-up. EXACTLY FOUR columns and TWO rows, 8 equally sized cells. Landscape canvas 2:1. No grid lines, text, letters, interface, ground, ground shadows, background or scenery. Each cell contains ONE entire full-body character, feet at 92% of cell height, top of head at 12%, coherent scale across both rows, limbs and staff inside its own cell. All characters face SCREEN RIGHT in near-profile three-quarter view, readable silhouette. Realistic detailed painterly fabric, embroidered seams, worn leather, metal edges, natural folds, shadowed faces. Refined game assets, not flat geometric art, not chibi.
Column 1 in both rows: sinister fire wizard wearing deep burgundy hooded robes, tarnished gold piping, thin skeletal gloved fingers, wooden staff topped with a small amber crystal.
Column 2: frost sorcerer in deep indigo and dusty pale-blue hooded robes, silver details, ivory staff with a small icy turquoise crystal.
Column 3: large ward knight mage in blackened steel armor over dark olive robes, broad heavy rectangular kite shield with an engraved turquoise sigil in left arm, short ceremonial mace right hand, enclosed steel hooded helmet.
Column 4: terrifying regal demon sorcerer king, dark flowing black-purple robes, ornate sharp aged gold shoulder armor, long horned golden crown, pallid weathered face in shadow, red garnet details, black staff; strong elaborate silhouette. Human proportions, not oversized head.
Row 1: each of the four characters in a calm threatening combat standing pose, staff/weapon held ready.
Row 2: the SAME corresponding character performing an aggressive casting or attacking pose: fire/frost staffs pointed to the right and free hand stretched right; ward knight thrusting shield right; demon king raising staff and spreading free hand toward right. NO large magical effect to obscure anatomy, tiny crystal light is fine.
Keep costumes, faces and proportions exactly consistent between rows. Lighting: warm amber keylight from upper left and subtle cold edge light. Transparent pixels everywhere except characters. Detailed enough for close-up and large display.
```

### scenes.webp

```text
Production environment atlas for a premium hand-painted 2D belt-scrolling fantasy fighting game. Create a single image split into an EXACT 2 by 2 grid of FOUR full rectangular game environments, no gap, no frame, no letters or UI. Each quadrant is a completely distinct environment seen from the SAME fixed side-on slightly elevated arcade beat-em-up camera, horizon at 57% of quadrant height, unobstructed WALKABLE horizontal floor filling bottom 43%. Highly detailed realistic painted stone, layered atmospheric lighting and convincing tactile textures, refined dark-fantasy concept art; coherent warm amber lights and cool deep shadows, jewel-toned muted palette. NO characters, NO people, NO enemies, NO creatures, NO logos. The playfield floor must be clear and readable, no large foreground blocking objects.
Top left: ancient enchanted forest castle approach, colossal gnarled trees at edges, distant ruined stone arch bridge and crumbling gothic wall, moss, fern edges, teal woodland mist; sun rays warm at upper left, weathered broad flat stone path in foreground.
Top right: medieval castle hall of embers, great ribbed arches, detailed slate block walls, heavy burgundy cloth banners, niches with torches, broad worn stone tiled floor. Golden firelight makes warm pools; moody teal in recesses.
Bottom left: huge forbidden arcane stone gate beneath gothic pointed arches, intricate carved metal door with very subtle turquoise runes, broken pillars along sides, pale cold shafts of light, broad worn cracked slate paving floor.
Bottom right: demon king's throne chamber at the heart of a volcanic citadel, black basalt throne centered at rear with a tall ruby velvet backrest, brass trim and skull ornaments, obsidian pillars, lava glowing far behind the edges, deep crimson banners, dark broad basalt fighting platform floor, ornate worn crimson carpet down center. Restrained orange volcanic reflected lighting, detailed cracks, no explosions.
Every quadrant must be a complete attractive scene edge to edge with continuous level floor, no cropped interface. Detail suitable for a released game, not a flat schematic.
```

## dawn.webp（エンディング背景・2026-10-11）
組み込み image_gen。1280×720 → WebP 品質84（約200KB）。人物なし。道の位置はコード側 `END_PATH` に正規化座標で持つ（絵を差し替えるなら道の座標を取り直す）。

```text
Cinematic ending backdrop ... SUNRISE after the demon king's defeat: broken dark castle far left, huge golden sun breaking over the horizon with god rays, warm village rooftops and a stone bridge in the middle distance, cherry petals, a clear empty weathered stone road filling the bottom 40%. NO characters, NO text, NO UI.
```
