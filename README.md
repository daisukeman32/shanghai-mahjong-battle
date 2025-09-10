# 🀄 麻雀学園バトルストーリー

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-supported-red.svg)](https://html.spec.whatwg.org/)

**Shanghai Mahjong Academy Battle Story** - 上海（麻雀牌取りゲーム）をベースにした対戦型ビジュアルノベルゲーム

## 🎮 ゲーム概要

「麻雀学園バトルストーリー」は、名門・桜華麻雀学園を舞台にした対戦型パズル×ビジュアルノベルゲームです。プレイヤーは転校生として3人の美少女雀士と対戦し、独特な「装備進化システム」により相手の装備を豪華にしていく育成要素が特徴的です。

### ✨ 主な特徴

- 🎯 **上海パズル** - クラシックな麻雀牌取りゲーム
- 👘 **装備進化システム** - 5段階の装備レベル（基礎→完全装備）
- 💕 **3人の美少女雀士** - 天野美咲、氷室玲奈、紅月妖
- 🎭 **4種類のエンディング** - TRUE/NORMAL/BAD/SECRET
- 💾 **完全CSV管理** - BOM付きUTF-8で15個のデータファイル
- ⏱️ **体験版15-20分** - 手軽にプレイ可能

## 🚀 技術仕様

### アーキテクチャ
- **Frontend**: Vanilla JavaScript (ES6 Modules)
- **UI/UX**: HTML5 + CSS3 (Grid/Flexbox)
- **データ管理**: CSV (BOM付きUTF-8) + PapaParse
- **状態管理**: カスタムGameStateManager
- **セーブシステム**: LocalStorage

### 必要環境
- モダンブラウザ（Chrome 80+, Firefox 75+, Safari 13+）
- ローカルサーバー環境（開発時）

## 📁 プロジェクト構成

```
shanghai-mahjong-battle/
├── 📄 index.html              # メインHTMLファイル
├── 📁 src/                    # ソースコード
│   ├── 📄 main.js             # エントリーポイント
│   ├── 📁 data/               # データ管理
│   │   └── 📄 CSVManager.js   # CSV読み込みシステム
│   ├── 📁 utils/              # ユーティリティ
│   │   └── 📄 GameStateManager.js # 状態管理
│   ├── 📁 scenes/             # シーン管理（実装予定）
│   ├── 📁 game/               # ゲームロジック（実装予定）
│   └── 📁 css/                # スタイルシート
│       └── 📄 main.css        # メインスタイル
├── 📁 assets/                 # リソース
│   ├── 📁 data/               # CSVデータ（15ファイル）
│   │   ├── 📄 characters.csv  # キャラクター情報
│   │   ├── 📄 character_levels.csv # 装備レベルデータ
│   │   ├── 📄 dialogues.csv   # 会話データ
│   │   ├── 📄 endings.csv     # エンディング情報
│   │   └── 📄 ...            # その他11ファイル
│   ├── 📁 images/             # 画像リソース（予定）
│   └── 📁 audio/              # 音声リソース（予定）
├── 📄 CLAUDE.md               # Claude Code用ガイドライン
├── 📄 GEMINI.md               # Gemini CLI連携ガイド
└── 📄 README.md               # このファイル
```

## 🎯 実装状況

### ✅ 完了
- [x] 基本プロジェクト構造
- [x] HTML5 4画面UI設計
- [x] CSS3 レスポンシブデザイン
- [x] 15個のBOM付きUTF-8 CSVファイル
- [x] CSVManager（PapaParse連携）
- [x] GameStateManager（状態管理）
- [x] ES6 Modules アーキテクチャ

### 🚧 開発中
- [ ] SceneManager（画面遷移）
- [ ] 上海パズルゲームロジック
- [ ] 装備進化システム
- [ ] 4種類のエンディングシステム

### 📅 実装予定
- [ ] AudioManager（BGM/効果音）
- [ ] キャラクターアニメーション
- [ ] セーブ/ロードUI
- [ ] 設定画面
- [ ] ギャラリー機能

## 💾 データ仕様

### CSV管理システム
全ゲームデータを15個のCSVファイルで外部管理：

| ファイル | 内容 | レコード数 |
|---------|------|-----------|
| `scenes.csv` | シーン背景・BGM | 8 |
| `characters.csv` | キャラクター基本情報 | 5 |
| `dialogues.csv` | 会話テキスト・感情 | 15 |
| `character_levels.csv` | 5段階装備進化 | 15 |
| `endings.csv` | 4種エンディング | 4 |
| `mahjong_tiles.csv` | 麻雀牌データ | 38 |
| その他9ファイル | UI・バランス調整等 | - |

**特徴**:
- 🌐 **BOM付きUTF-8**: Excel直接編集可能
- 🔄 **ホットリロード**: 開発時リアルタイム更新
- ⚡ **高性能パース**: PapaParseライブラリ使用

## 🎮 ゲームシステム

### 装備進化システム
```
Lv1 基礎装備 → Lv2 軽装備 → Lv3 中装備 → Lv4 重装備 → Lv5 完全装備
```

**キャラクター別テーマ**:
- 👸 美咲: 和風メイド → 守護天使
- ❄️ 玲奈: 軍服風 → 氷雪女王  
- 🌙 妖: 和装ドレス → 夜叉姫

### エンディング分岐
| 種類 | 条件 | 解放要素 |
|-----|------|---------|
| **TRUE** | 全員Lv5装備+親密度100%+高スコア | 隠しキャラ |
| **NORMAL** | 3人クリア+Lv3以上装備 | フリーバトル |
| **BAD** | ゲームオーバー3回以上 | イージーモード |
| **SECRET** | ノーダメージクリア+隠し条件 | 真・最終章 |

## 🚀 開発・実行方法

### 1. リポジトリクローン
```bash
git clone https://github.com/daisukeman32/shanghai-mahjong-battle.git
cd shanghai-mahjong-battle
```

### 2. ローカルサーバー起動
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server -p 8000

# VS Code Live Server拡張機能でも可
```

### 3. ブラウザでアクセス
```
http://localhost:8000
```

## 🛠️ 開発ガイド

### CSV編集
1. `assets/data/*.csv` をExcelまたはテキストエディタで編集
2. **BOM付きUTF-8で保存** (重要！)
3. ブラウザリロードで即座に反映

### コード構成
- **ES6 Modules**: モジュラー設計
- **Event-Driven**: 状態変更イベント
- **CSV-First**: データ駆動開発

## 📚 AI協業システム

このプロジェクトは Claude Code と Gemini CLI の協業により開発されています。

- 📋 **Claude Code**: 統合判断・実装担当
- 🤖 **Gemini CLI**: 複数案提示・技術検討
- 📖 **協業ガイド**: `CLAUDE.md`, `GEMINI.md` 参照

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🤝 コントリビューション

1. Fork このリポジトリ
2. Feature ブランチ作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. Pull Request を作成

## 📞 サポート

- 🐛 **Issues**: [GitHub Issues](https://github.com/daisukeman32/shanghai-mahjong-battle/issues)
- 💬 **Discussion**: [GitHub Discussions](https://github.com/daisukeman32/shanghai-mahjong-battle/discussions)

---

**🌸 Made with Claude Code & Gemini CLI 🌸**

> 麻雀学園の新たな伝説が始まる...