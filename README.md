# auth-system / canvas-hub

> JWT自前実装の認証モジュールと、ノードベースのキャンバス型エディタ「canvas-hub」を含む作業リポジトリ。

[![Stack](https://img.shields.io/badge/React-Vite-646cff)](https://vitejs.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

---

## 概要

このリポジトリは2つの要素で構成されます。

### 1. canvas-hub（メインアプリ）
React Flow（`@xyflow/react`）+ Tiptap によるノードベースのキャンバス／ドキュメント編集アプリ。MCPサーバー（`mcp-server/`）を同梱し、エージェントからの操作にも対応する設計。

- **技術**: React 18 / Vite / TypeScript / `@xyflow/react` / `@tiptap/react`

### 2. 認証実装ノート
`org-ai-platform` の api-gateway に組み込む JWT自前認証の設計・実装記録（register / login / logout / me エンドポイント）。詳細は [`02-auth.md`](./02-auth.md)。

---

## セットアップ（canvas-hub）

```bash
cd canvas-hub
pnpm install
pnpm dev       # 開発サーバー
pnpm build     # tsc -b && vite build
```

---

## このプロジェクトで見せられること

- **ノードエディタUI**（React Flow）とリッチテキスト（Tiptap）の統合
- **MCPサーバー**連携を見据えた設計
- JWT認証の自前実装

---

*※ ポートフォリオ目的の公開リポジトリです。鍵・トークンは含まれません。*
