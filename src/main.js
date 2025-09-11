/**
 * 麻雀学園バトルストーリー - メインエントリーポイント
 * ES6 Modules を使用したゲーム制御システム
 */

// Core Modules Import
import { GameStateManager } from './utils/GameStateManager.js';
import { CSVManager } from './data/CSVManager.js';
import { AudioManager } from './utils/AudioManager.js';
import { SceneManager } from './scenes/SceneManager.js';

// Scene Imports
import { TitleScene } from './scenes/TitleScene.js';
import { DialogueScene } from './scenes/DialogueScene.js';
import { GameScene } from './scenes/GameScene.js';
import { EndingScene } from './scenes/EndingScene.js';

// Game Logic Imports
import { ShanghaiPuzzle } from './game/ShanghaiPuzzle.js';
import { EquipmentSystem } from './game/EquipmentSystem.js';

/**
 * メインアプリケーションクラス
 * ゲーム全体の初期化と制御を行う
 */
class MahjongGakuenBattleStory {
    constructor() {
        this.gameState = new GameStateManager();
        this.csvManager = new CSVManager();
        this.audioManager = new AudioManager();
        this.sceneManager = new SceneManager();
        
        this.isInitialized = false;
        // ローディング要素は動的に取得
    }

    /**
     * ゲームの初期化
     */
    async initialize() {
        try {
            this.showLoading(true);
            console.log('🎮 麻雀学園バトルストーリー - 初期化開始');

            // 1. CSV データの読み込み
            await this.loadGameData();

            // 2. オーディオシステムの初期化
            await this.audioManager.initialize();

            // 3. シーンの登録
            this.registerScenes();

            // 4. イベントリスナーの設定
            this.setupEventListeners();

            // 5. セーブデータの確認・読み込み
            this.loadSaveData();

            // 6. 初期シーンの設定
            await this.sceneManager.changeScene('title');

            this.isInitialized = true;
            this.showLoading(false);
            
            console.log('✅ ゲーム初期化完了');
            
        } catch (error) {
            console.error('❌ ゲーム初期化エラー:', error);
            this.showError('ゲームの読み込みに失敗しました。');
        }
    }

    /**
     * ゲームデータ（CSV）の読み込み
     */
    async loadGameData() {
        const csvFiles = [
            'scenes', 'characters', 'dialogues', 'character_levels', 'endings',
            'ui_elements', 'ui_panels', 'ui_icons', 'click_areas', 'ui_animations',
            'ui_fonts', 'ui_responsive', 'game_balance', 'sound_effects', 'mahjong_tiles'
        ];

        console.log('📄 CSV データ読み込み開始...');
        
        for (const file of csvFiles) {
            await this.csvManager.loadCSV(`${file}.csv`);
            console.log(`✅ ${file}.csv 読み込み完了`);
        }

        // データの整合性チェック
        this.validateGameData();
        
        console.log('📄 全CSV データ読み込み完了');
    }

    /**
     * ゲームデータの整合性チェック
     */
    validateGameData() {
        const requiredData = ['characters', 'scenes', 'dialogues', 'mahjong_tiles'];
        
        for (const dataKey of requiredData) {
            const data = this.csvManager.getData(dataKey);
            if (!data || data.length === 0) {
                throw new Error(`必須データ ${dataKey} が見つかりません`);
            }
        }

        console.log('✅ データ整合性チェック完了');
    }

    /**
     * シーンの登録
     */
    registerScenes() {
        // 上海パズルインスタンスの作成
        const shanghaiPuzzle = new ShanghaiPuzzle();
        
        // 装備システムの作成
        const equipmentSystem = new EquipmentSystem(this.csvManager);
        
        const titleScene = new TitleScene(this.csvManager, this.audioManager);
        const dialogueScene = new DialogueScene(this.csvManager, this.audioManager);
        const gameScene = new GameScene(this.csvManager, this.audioManager, shanghaiPuzzle);
        const endingScene = new EndingScene(this.csvManager, this.audioManager);

        this.sceneManager.registerScene('title', titleScene);
        this.sceneManager.registerScene('dialogue', dialogueScene);
        this.sceneManager.registerScene('game', gameScene);
        this.sceneManager.registerScene('ending', endingScene);
        
        // ゲームインスタンスへの参照を保存
        this.shanghaiPuzzle = shanghaiPuzzle;
        this.equipmentSystem = equipmentSystem;

        console.log('🎬 シーン登録完了');
        
        // デバッグ用: グローバルアクセスを提供
        window.debugPuzzle = shanghaiPuzzle;
    }

    /**
     * グローバルイベントリスナーの設定
     */
    setupEventListeners() {
        // ウィンドウリサイズ
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // キーボードショートカット
        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });

        // ページを離れる前の確認
        window.addEventListener('beforeunload', (event) => {
            if (this.gameState.hasUnsavedProgress()) {
                event.preventDefault();
                event.returnValue = 'セーブされていない進行状況があります。本当に終了しますか？';
            }
        });

        console.log('🎮 イベントリスナー設定完了');
    }

    /**
     * セーブデータの読み込み
     */
    loadSaveData() {
        const saveData = localStorage.getItem('mahjong_gakuen_save');
        
        if (saveData) {
            try {
                const parsedData = JSON.parse(saveData);
                this.gameState.loadState(parsedData);
                console.log('💾 セーブデータ読み込み完了');
            } catch (error) {
                console.warn('⚠️ セーブデータの読み込みに失敗:', error);
                localStorage.removeItem('mahjong_gakuen_save');
            }
        }
    }

    /**
     * ウィンドウリサイズの処理
     */
    handleResize() {
        // レスポンシブ設定の適用
        const screenSize = `${window.innerWidth}x${window.innerHeight}`;
        const responsiveData = this.csvManager.getData('ui_responsive');
        
        // 最適な設定を見つけて適用
        const bestFit = responsiveData.find(config => 
            config.screen_size === screenSize
        ) || responsiveData.find(config => config.screen_size === '1920x1080');

        if (bestFit) {
            document.documentElement.style.setProperty('--element-scale', bestFit.element_scale);
            document.documentElement.style.setProperty('--font-scale', bestFit.font_scale);
        }
    }

    /**
     * キーボード入力の処理
     */
    handleKeyDown(event) {
        // ESC: メニュー表示/非表示
        if (event.key === 'Escape') {
            this.toggleMenu();
        }
        
        // F11: フルスクリーン切り替え
        if (event.key === 'F11') {
            event.preventDefault();
            this.toggleFullscreen();
        }
        
        // スペース: 現在のシーンでのデフォルトアクション
        if (event.key === ' ') {
            event.preventDefault();
            this.sceneManager.getCurrentScene()?.handleSpaceKey();
        }

        // 現在のシーンにキー入力を転送
        this.sceneManager.getCurrentScene()?.handleKeyDown?.(event);
    }

    /**
     * メニューの表示/非表示切り替え
     */
    toggleMenu() {
        // TODO: メニューシステムの実装
        console.log('📋 メニュー切り替え (実装予定)');
    }

    /**
     * フルスクリーンの切り替え
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(console.error);
        } else {
            document.exitFullscreen().catch(console.error);
        }
    }

    /**
     * ローディング表示の制御
     */
    showLoading(show) {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            if (show) {
                loadingElement.classList.add('active');
                loadingElement.style.display = 'flex';
            } else {
                loadingElement.classList.remove('active');
                loadingElement.style.display = 'none';
            }
            console.log(`🔄 Loading ${show ? 'shown' : 'hidden'}`);
        } else {
            console.warn('⚠️ Loading element not found');
        }
    }

    /**
     * エラー表示
     */
    showError(message) {
        this.showLoading(false);
        alert(`エラー: ${message}`);
    }

    /**
     * ゲーム状態の保存
     */
    saveGame() {
        try {
            const saveData = this.gameState.getCurrentState();
            localStorage.setItem('mahjong_gakuen_save', JSON.stringify(saveData));
            console.log('💾 ゲーム保存完了');
        } catch (error) {
            console.error('❌ ゲーム保存エラー:', error);
        }
    }

    /**
     * ゲーム終了
     */
    shutdown() {
        this.audioManager.stopAll();
        this.saveGame();
        console.log('🔚 ゲーム終了');
    }
}

/**
 * グローバル変数としてゲームインスタンスを公開
 */
window.MahjongGame = null;

/**
 * DOM読み込み完了後の初期化
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌸 麻雀学園バトルストーリー - 起動中...');
    
    try {
        window.MahjongGame = new MahjongGakuenBattleStory();
        await window.MahjongGame.initialize();
        console.log('✅ ゲーム初期化成功');
    } catch (error) {
        console.error('💥 ゲーム起動失敗:', error);
        // エラーをページに表示
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: #ff4757; color: white; padding: 20px; border-radius: 8px;
            font-family: monospace; max-width: 80%; z-index: 9999;
        `;
        errorDiv.innerHTML = `
            <h3>🚨 ゲーム初期化エラー</h3>
            <p>${error.message}</p>
            <pre>${error.stack}</pre>
        `;
        document.body.appendChild(errorDiv);
    }
});

/**
 * ページ終了時のクリーンアップ
 */
window.addEventListener('beforeunload', () => {
    if (window.MahjongGame) {
        window.MahjongGame.shutdown();
    }
});

// デバッグ用のグローバル関数
if (typeof process === 'undefined' || process.env?.NODE_ENV === 'development') {
    window.debugGame = () => {
        console.log('🐛 デバッグ情報:', {
            gameState: window.MahjongGame?.gameState?.getCurrentState(),
            csvData: window.MahjongGame?.csvManager?.getAllData(),
            currentScene: window.MahjongGame?.sceneManager?.getCurrentSceneName()
        });
    };
}