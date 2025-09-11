/**
 * GameStateManager - ゲーム状態管理システム
 * プレイ進行、キャラクター状態、スコア等を管理
 */

export class GameStateManager {
    constructor() {
        this.state = this.getInitialState();
        this.listeners = new Map();
        this.lastSaveTime = 0;
        this.autoSaveInterval = 30000; // 30秒間隔
    }

    /**
     * 初期状態の取得
     */
    getInitialState() {
        return {
            // ゲーム基本情報
            version: '1.0.0',
            playerId: this.generatePlayerId(),
            createdAt: Date.now(),
            lastPlayedAt: Date.now(),
            
            // プレイ進行
            currentScene: 'title',
            currentCharacter: null,
            currentDialogue: 0,
            completedScenes: [],
            
            // キャラクター状態
            characters: {
                1: { // 美咲
                    name: '天野美咲',
                    level: 1,
                    hp: 100,
                    maxHp: 100,
                    intimacy: 0,
                    battleCount: 0,
                    victories: 0,
                    equipment: {
                        level: 1,
                        name: '基礎装備'
                    }
                },
                2: { // 玲奈
                    name: '氷室玲奈',
                    level: 1,
                    hp: 120,
                    maxHp: 120,
                    intimacy: 0,
                    battleCount: 0,
                    victories: 0,
                    equipment: {
                        level: 1,
                        name: '制服'
                    }
                },
                3: { // 妖
                    name: '紅月妖',
                    level: 1,
                    hp: 150,
                    maxHp: 150,
                    intimacy: 0,
                    battleCount: 0,
                    victories: 0,
                    equipment: {
                        level: 1,
                        name: '生徒会服'
                    }
                }
            },
            
            // プレイヤー状態
            player: {
                name: '主人公',
                level: 1,
                totalScore: 0,
                totalPlayTime: 0,
                achievements: [],
                statistics: {
                    gamesPlayed: 0,
                    gamesWon: 0,
                    totalTilesCleared: 0,
                    maxCombo: 0,
                    perfectGames: 0
                }
            },
            
            // ゲーム設定
            settings: {
                bgmVolume: 0.7,
                seVolume: 0.8,
                voiceVolume: 0.8,
                textSpeed: 1.0,
                autoMode: false,
                fullscreen: false,
                language: 'ja'
            },
            
            // アンロック状況
            unlocks: {
                characters: [1], // 最初は美咲のみ
                scenes: ['title', 'scene_1'],
                endings: [],
                gallery: [],
                achievements: []
            },
            
            // 現在のゲーム状況
            currentGame: null,
            
            // フラグシステム
            flags: {},
            
            // その他の状態
            hasUnsavedProgress: false
        };
    }

    /**
     * プレイヤーIDの生成
     */
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    /**
     * 現在の状態を取得
     */
    getCurrentState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    /**
     * 状態の読み込み
     */
    loadState(savedState) {
        try {
            // バージョンチェック
            if (savedState.version !== this.state.version) {
                console.warn('⚠️ Save data version mismatch, applying migration');
                savedState = this.migrateState(savedState);
            }

            // 状態をマージ
            this.state = { ...this.state, ...savedState };
            this.state.lastPlayedAt = Date.now();
            this.state.hasUnsavedProgress = false;

            this.emit('stateLoaded', this.state);
            console.log('💾 Game state loaded successfully');
            
        } catch (error) {
            console.error('❌ Failed to load game state:', error);
            throw error;
        }
    }

    /**
     * 状態のマイグレーション（バージョン間の互換性保持）
     */
    migrateState(oldState) {
        // 将来のバージョンアップ時に必要な変換処理を実装
        console.log('🔄 Migrating save data...');
        return { ...this.getInitialState(), ...oldState };
    }

    /**
     * シーンの変更
     */
    changeScene(sceneName, data = {}) {
        const previousScene = this.state.currentScene;
        this.state.currentScene = sceneName;
        this.state.lastPlayedAt = Date.now();
        
        // シーン完了の記録
        if (previousScene && !this.state.completedScenes.includes(previousScene)) {
            this.state.completedScenes.push(previousScene);
        }

        this.markUnsaved();
        this.emit('sceneChanged', { previous: previousScene, current: sceneName, data });
        
        console.log(`🎬 Scene changed: ${previousScene} → ${sceneName}`);
    }

    /**
     * キャラクター状態の更新
     */
    updateCharacter(charId, updates) {
        if (!this.state.characters[charId]) {
            console.warn(`⚠️ Character ${charId} not found`);
            return;
        }

        const oldState = { ...this.state.characters[charId] };
        this.state.characters[charId] = { 
            ...this.state.characters[charId], 
            ...updates 
        };

        this.markUnsaved();
        this.emit('characterUpdated', { charId, oldState, newState: this.state.characters[charId] });
    }

    /**
     * 装備レベルアップ
     */
    upgradeEquipment(charId, newLevel, equipmentName) {
        if (!this.state.characters[charId]) return;

        const char = this.state.characters[charId];
        const oldLevel = char.equipment.level;
        
        char.equipment.level = newLevel;
        char.equipment.name = equipmentName;
        
        // HPボーナスの適用など
        this.applyEquipmentBonuses(charId, newLevel);
        
        this.markUnsaved();
        this.emit('equipmentUpgraded', { charId, oldLevel, newLevel, equipmentName });
        
        console.log(`⬆️ Equipment upgraded: ${char.name} Lv${oldLevel}→${newLevel}`);
    }

    /**
     * 装備ボーナスの適用
     */
    applyEquipmentBonuses(charId, level) {
        // CSVManagerから装備データを取得して適用
        // 実装は後で追加
    }

    /**
     * スコアの更新
     */
    updateScore(points, gameType = 'shanghai') {
        this.state.player.totalScore += points;
        this.state.player.statistics.gamesPlayed++;
        
        this.markUnsaved();
        this.emit('scoreUpdated', { points, totalScore: this.state.player.totalScore });
    }

    /**
     * ゲーム勝利
     */
    recordVictory(charId, gameData) {
        if (this.state.characters[charId]) {
            this.state.characters[charId].victories++;
            this.state.characters[charId].battleCount++;
        }
        
        this.state.player.statistics.gamesWon++;
        this.state.player.statistics.totalTilesCleared += gameData.tilesCleared || 0;
        
        if (gameData.combo > this.state.player.statistics.maxCombo) {
            this.state.player.statistics.maxCombo = gameData.combo;
        }
        
        if (gameData.perfect) {
            this.state.player.statistics.perfectGames++;
        }

        this.checkAchievements();
        this.markUnsaved();
        this.emit('victoryRecorded', { charId, gameData });
    }

    /**
     * ゲーム敗北
     */
    recordDefeat(charId) {
        if (this.state.characters[charId]) {
            this.state.characters[charId].battleCount++;
        }
        
        this.markUnsaved();
        this.emit('defeatRecorded', { charId });
    }

    /**
     * 親密度の更新
     */
    updateIntimacy(charId, change) {
        if (!this.state.characters[charId]) return;
        
        const oldIntimacy = this.state.characters[charId].intimacy;
        this.state.characters[charId].intimacy = Math.max(0, Math.min(100, oldIntimacy + change));
        
        this.markUnsaved();
        this.emit('intimacyChanged', { 
            charId, 
            oldValue: oldIntimacy, 
            newValue: this.state.characters[charId].intimacy 
        });
    }

    /**
     * フラグの設定
     */
    setFlag(flagName, value) {
        const oldValue = this.state.flags[flagName];
        this.state.flags[flagName] = value;
        
        this.markUnsaved();
        this.emit('flagChanged', { flagName, oldValue, newValue: value });
    }

    /**
     * フラグの取得
     */
    getFlag(flagName, defaultValue = false) {
        return this.state.flags[flagName] !== undefined 
            ? this.state.flags[flagName] 
            : defaultValue;
    }

    /**
     * アンロック処理
     */
    unlock(category, item) {
        if (!this.state.unlocks[category]) {
            this.state.unlocks[category] = [];
        }
        
        if (!this.state.unlocks[category].includes(item)) {
            this.state.unlocks[category].push(item);
            
            this.markUnsaved();
            this.emit('unlocked', { category, item });
            
            console.log(`🔓 Unlocked: ${category}/${item}`);
        }
    }

    /**
     * アンロック状況の確認
     */
    isUnlocked(category, item) {
        return this.state.unlocks[category]?.includes(item) || false;
    }

    /**
     * 実績の確認と付与
     */
    checkAchievements() {
        const achievements = [];
        
        // 勝利数に応じた実績
        if (this.state.player.statistics.gamesWon >= 10 && !this.state.unlocks.achievements.includes('win_10')) {
            achievements.push('win_10');
        }
        
        // パーフェクトゲーム実績
        if (this.state.player.statistics.perfectGames >= 1 && !this.state.unlocks.achievements.includes('perfect_1')) {
            achievements.push('perfect_1');
        }
        
        // 全キャラクター装備レベル5
        const allMaxLevel = Object.values(this.state.characters)
            .every(char => char.equipment.level >= 5);
        if (allMaxLevel && !this.state.unlocks.achievements.includes('all_max_equipment')) {
            achievements.push('all_max_equipment');
        }

        // 新しい実績を付与
        achievements.forEach(achievement => {
            this.unlock('achievements', achievement);
        });

        return achievements;
    }

    /**
     * エンディング条件の確認
     */
    checkEndingConditions() {
        const stats = this.state.player.statistics;
        const chars = this.state.characters;
        
        // TRUE ENDING条件
        const allMaxEquipment = Object.values(chars).every(char => char.equipment.level >= 5);
        const allMaxIntimacy = Object.values(chars).every(char => char.intimacy >= 100);
        const highScore = this.state.player.totalScore >= 500000;
        
        if (allMaxEquipment && allMaxIntimacy && highScore) {
            return 'TRUE';
        }
        
        // SECRET ENDING条件
        const perfectGames = stats.perfectGames >= 3;
        const noDefeats = Object.values(chars).every(char => char.victories >= char.battleCount);
        
        if (perfectGames && noDefeats && this.isUnlocked('achievements', 'all_max_equipment')) {
            return 'SECRET';
        }
        
        // NORMAL ENDING条件
        const allCharsChallenged = Object.values(chars).every(char => char.battleCount > 0);
        const someVictories = Object.values(chars).some(char => char.victories > 0);
        
        if (allCharsChallenged && someVictories) {
            return 'NORMAL';
        }
        
        // BAD ENDING（デフォルト）
        return 'BAD';
    }

    /**
     * プレイ時間の記録
     */
    updatePlayTime(seconds) {
        this.state.player.totalPlayTime += seconds;
        this.markUnsaved();
    }

    /**
     * 設定の更新
     */
    updateSettings(settings) {
        this.state.settings = { ...this.state.settings, ...settings };
        this.markUnsaved();
        this.emit('settingsChanged', this.state.settings);
    }

    /**
     * 未保存状態のマーク
     */
    markUnsaved() {
        this.state.hasUnsavedProgress = true;
        this.state.lastPlayedAt = Date.now();
    }

    /**
     * 未保存状態の確認
     */
    hasUnsavedProgress() {
        return this.state.hasUnsavedProgress;
    }

    /**
     * 保存状態のマーク
     */
    markSaved() {
        this.state.hasUnsavedProgress = false;
        this.lastSaveTime = Date.now();
    }

    /**
     * イベントリスナーの追加
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * イベントリスナーの削除
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * イベントの発火
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * デバッグ情報の取得
     */
    getDebugInfo() {
        return {
            currentScene: this.state.currentScene,
            completedScenes: this.state.completedScenes.length,
            totalScore: this.state.player.totalScore,
            playTime: this.state.player.totalPlayTime,
            hasUnsavedProgress: this.state.hasUnsavedProgress,
            charactersStatus: Object.keys(this.state.characters).reduce((acc, id) => {
                const char = this.state.characters[id];
                acc[id] = {
                    level: char.equipment.level,
                    intimacy: char.intimacy,
                    victories: char.victories,
                    battles: char.battleCount
                };
                return acc;
            }, {})
        };
    }

    /**
     * 状態のリセット
     */
    resetGame() {
        const settings = this.state.settings; // 設定は保持
        const playerId = this.state.playerId; // プレイヤーIDは保持
        
        this.state = this.getInitialState();
        this.state.settings = settings;
        this.state.playerId = playerId;
        
        this.markUnsaved();
        this.emit('gameReset', {});
        
        console.log('🔄 Game state reset');
    }

    /**
     * 倒したキャラクターのリストを取得
     */
    getDefeatedCharacters() {
        return Object.keys(this.state.characters)
            .filter(charId => this.state.characters[charId].victories > 0)
            .map(charId => parseInt(charId));
    }

    /**
     * キャラクター統計情報の取得
     */
    getCharacterStats(characterId) {
        const char = this.state.characters[characterId];
        if (!char) {
            return { wins: 0, totalScore: 0, battles: 0, defeats: 0 };
        }
        
        return {
            wins: char.victories || 0,
            totalScore: char.totalScore || 0,
            battles: char.battleCount || 0,
            defeats: (char.battleCount || 0) - (char.victories || 0)
        };
    }

    /**
     * キャラクターの親密度取得
     */
    getIntimacy(characterId) {
        const char = this.state.characters[characterId];
        return char ? char.intimacy || 0 : 0;
    }

    /**
     * 親密度の増加
     */
    increaseIntimacy(characterId, amount) {
        if (this.state.characters[characterId]) {
            this.state.characters[characterId].intimacy = 
                Math.min(100, (this.state.characters[characterId].intimacy || 0) + amount);
            this.markUnsaved();
        }
    }

    /**
     * キャラクターレベルの取得
     */
    getCharacterLevel(characterId) {
        const char = this.state.characters[characterId];
        return char ? char.equipment?.level || 1 : 1;
    }

    /**
     * キャラクターレベルの設定
     */
    setCharacterLevel(characterId, level) {
        if (this.state.characters[characterId]) {
            if (!this.state.characters[characterId].equipment) {
                this.state.characters[characterId].equipment = {};
            }
            this.state.characters[characterId].equipment.level = level;
            this.markUnsaved();
        }
    }

    /**
     * 装備アップグレード
     */
    upgradeCharacterEquipment(characterId) {
        const char = this.state.characters[characterId];
        if (char && char.equipment) {
            const currentLevel = char.equipment.level || 1;
            if (currentLevel < 5) {
                char.equipment.level = currentLevel + 1;
                this.markUnsaved();
                return true;
            }
        }
        return false;
    }

    /**
     * バトル結果の記録
     */
    recordBattleResult(characterId, result, score) {
        const char = this.state.characters[characterId];
        if (!char) return;

        char.battleCount = (char.battleCount || 0) + 1;
        char.totalScore = (char.totalScore || 0) + score;

        if (result === 'win' || result === 'perfect_win') {
            char.victories = (char.victories || 0) + 1;
        }

        if (result === 'perfect_win') {
            this.state.player.statistics.perfectGames = 
                (this.state.player.statistics.perfectGames || 0) + 1;
        }

        this.state.player.statistics.gamesPlayed = 
            (this.state.player.statistics.gamesPlayed || 0) + 1;
        
        if (result === 'win' || result === 'perfect_win') {
            this.state.player.statistics.gamesWon = 
                (this.state.player.statistics.gamesWon || 0) + 1;
        }

        this.state.player.totalScore = (this.state.player.totalScore || 0) + score;
        this.markUnsaved();
    }

    /**
     * ゲーム統計の取得
     */
    getGameStats() {
        return {
            playTime: this.state.player.totalPlayTime || 0,
            totalScore: this.state.player.totalScore || 0,
            wins: this.state.player.statistics.gamesWon || 0,
            defeats: (this.state.player.statistics.gamesPlayed || 0) - (this.state.player.statistics.gamesWon || 0),
            perfectWins: this.state.player.statistics.perfectGames || 0,
            gameOvers: this.state.gameOvers || 0,
            maxWinStreak: this.state.maxWinStreak || 0
        };
    }

    /**
     * 全キャラクターが最大レベルかチェック
     */
    areAllCharactersMaxLevel() {
        return Object.values(this.state.characters)
            .every(char => char.equipment?.level >= 5);
    }

    /**
     * 全キャラクターが最大親密度かチェック
     */
    areAllCharactersMaxIntimacy() {
        return Object.values(this.state.characters)
            .every(char => char.intimacy >= 100);
    }

    /**
     * 秘密条件の確認
     */
    hasSecretCondition() {
        // 隠し条件: 全キャラクター3勝以上かつ親密度80以上
        return Object.values(this.state.characters)
            .every(char => char.victories >= 3 && char.intimacy >= 80);
    }

    /**
     * エンディング条件のチェック
     */
    checkEndingConditions() {
        const defeatedCount = this.getDefeatedCharacters().length;
        return defeatedCount >= 3; // 全キャラクター撃破でエンディング
    }

    /**
     * アンロック処理
     */
    unlock(content) {
        if (!this.state.unlockedContent) {
            this.state.unlockedContent = [];
        }
        if (!this.state.unlockedContent.includes(content)) {
            this.state.unlockedContent.push(content);
            this.markUnsaved();
        }
    }

    /**
     * エンディングアンロック
     */
    unlockEnding(endingType) {
        if (!this.state.unlockedEndings) {
            this.state.unlockedEndings = [];
        }
        if (!this.state.unlockedEndings.includes(endingType)) {
            this.state.unlockedEndings.push(endingType);
            this.markUnsaved();
        }
    }

    /**
     * アンロック済みアチーブメント取得
     */
    getUnlockedAchievements() {
        return this.state.player.achievements || [];
    }

    /**
     * 会話既読チェック
     */
    isDialogueRead(sceneId, dialogueIndex) {
        const key = `${sceneId}-${dialogueIndex}`;
        return this.state.readDialogues?.includes(key) || false;
    }
}