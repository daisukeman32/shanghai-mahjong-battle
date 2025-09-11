/**
 * CSVManager - BOM付きUTF-8対応のCSVデータ管理システム
 * PapaParseを使用した高性能・高信頼性のCSV処理
 */

export class CSVManager {
    constructor() {
        this.data = new Map();
        this.isLoaded = new Map();
        this.csvOptions = {
            header: true,
            skipEmptyLines: true,
            encoding: 'utf-8-sig', // BOM付きUTF-8対応
            delimiter: ',',
            quoteChar: '"',
            escapeChar: '"',
            transformHeader: (header) => header.trim(),
            transform: (value) => {
                // 値のトリム処理
                if (typeof value === 'string') {
                    return value.trim();
                }
                return value;
            }
        };
    }

    /**
     * CSVファイルの読み込み
     * @param {string} filename - 読み込むCSVファイル名
     * @returns {Promise<Array>} パースされたデータの配列
     */
    async loadCSV(filename) {
        const filePath = `./assets/data/${filename}`;
        const dataKey = filename.replace('.csv', '');

        try {
            console.log(`📄 Loading CSV: ${filename}`);
            
            // ファイルのフェッチ
            const response = await fetch(filePath);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // BOM付きUTF-8として読み込み
            const csvText = await response.text();
            
            // BOM除去（念のため）
            const cleanText = csvText.replace(/^\uFEFF/, '');
            
            // PapaParseを使用してパース
            return new Promise((resolve, reject) => {
                Papa.parse(cleanText, {
                    ...this.csvOptions,
                    complete: (results) => {
                        if (results.errors && results.errors.length > 0) {
                            console.warn(`⚠️ CSV parse warnings for ${filename}:`, results.errors);
                        }

                        // データの後処理
                        const processedData = this.postProcessData(results.data, dataKey);
                        
                        // キャッシュに保存
                        this.data.set(dataKey, processedData);
                        this.isLoaded.set(dataKey, true);
                        
                        console.log(`✅ CSV loaded: ${filename} (${processedData.length} records)`);
                        resolve(processedData);
                    },
                    error: (error) => {
                        console.error(`❌ CSV parse error for ${filename}:`, error);
                        reject(new Error(`CSV parse failed: ${error.message}`));
                    }
                });
            });

        } catch (error) {
            console.error(`❌ Failed to load CSV: ${filename}`, error);
            throw new Error(`Failed to load ${filename}: ${error.message}`);
        }
    }

    /**
     * データの後処理（型変換、バリデーション等）
     * @param {Array} rawData - 生データ
     * @param {string} dataKey - データの種類
     * @returns {Array} 処理済みデータ
     */
    postProcessData(rawData, dataKey) {
        const processedData = rawData.filter(row => {
            // 空行や不正なデータを除外
            return Object.values(row).some(value => value && value.trim() !== '');
        });

        // データ種別ごとの特別処理
        switch (dataKey) {
            case 'characters':
                return this.processCharacterData(processedData);
            
            case 'character_levels':
                return this.processCharacterLevelData(processedData);
            
            case 'dialogues':
                return this.processDialogueData(processedData);
            
            case 'game_balance':
                return this.processGameBalanceData(processedData);
            
            case 'mahjong_tiles':
                return this.processMahjongTileData(processedData);
            
            case 'sound_effects':
                return this.processSoundEffectData(processedData);
            
            default:
                return processedData;
        }
    }

    /**
     * キャラクターデータの処理
     */
    processCharacterData(data) {
        return data.map(char => ({
            ...char,
            char_id: parseInt(char.char_id),
            // 追加の処理があればここで実行
        }));
    }

    /**
     * キャラクターレベルデータの処理
     */
    processCharacterLevelData(data) {
        return data.map(level => ({
            ...level,
            char_id: parseInt(level.char_id),
            level: parseInt(level.level),
            hp_bonus: parseInt(level.hp_bonus),
            skill_bonus: parseInt(level.skill_bonus)
        }));
    }

    /**
     * 会話データの処理
     */
    processDialogueData(data) {
        return data.map(dialogue => ({
            ...dialogue,
            dialogue_id: parseInt(dialogue.dialogue_id),
            scene_id: parseInt(dialogue.scene_id),
            char_id: parseInt(dialogue.char_id)
        }));
    }

    /**
     * ゲームバランスデータの処理
     */
    processGameBalanceData(data) {
        return data.map(balance => ({
            ...balance,
            level: parseInt(balance.level),
            required_score: parseInt(balance.required_score),
            time_limit: parseInt(balance.time_limit),
            hp_amount: parseInt(balance.hp_amount),
            damage_base: parseInt(balance.damage_base),
            combo_multiplier: parseFloat(balance.combo_multiplier),
            skill_cooldown: parseInt(balance.skill_cooldown)
        }));
    }

    /**
     * 麻雀牌データの処理
     */
    processMahjongTileData(data) {
        return data.map(tile => ({
            ...tile,
            tile_id: parseInt(tile.tile_id),
            number: tile.number !== '' ? parseInt(tile.number) : null,
            special: tile.special === 'true',
            point_value: parseInt(tile.point_value)
        }));
    }

    /**
     * 音響効果データの処理
     */
    processSoundEffectData(data) {
        return data.map(sound => ({
            ...sound,
            sound_id: parseInt(sound.sound_id),
            volume: parseFloat(sound.volume),
            loop: sound.loop === 'true',
            fade_in: parseFloat(sound.fade_in),
            fade_out: parseFloat(sound.fade_out)
        }));
    }

    /**
     * データの取得
     * @param {string} dataKey - データキー
     * @returns {Array|null} データ配列
     */
    getData(dataKey) {
        return this.data.get(dataKey) || null;
    }

    /**
     * 特定の条件でデータを検索
     * @param {string} dataKey - データキー
     * @param {Function} predicate - 検索条件
     * @returns {Array} 条件に一致するデータの配列
     */
    findData(dataKey, predicate) {
        const data = this.getData(dataKey);
        return data ? data.filter(predicate) : [];
    }

    /**
     * 単一データの検索
     * @param {string} dataKey - データキー
     * @param {Function} predicate - 検索条件
     * @returns {Object|null} 条件に一致する最初のデータ
     */
    findOne(dataKey, predicate) {
        const data = this.getData(dataKey);
        return data ? data.find(predicate) || null : null;
    }

    /**
     * IDによるデータ検索
     * @param {string} dataKey - データキー
     * @param {number} id - ID
     * @param {string} idField - IDフィールド名（デフォルト: 'id'）
     * @returns {Object|null} 該当データ
     */
    getById(dataKey, id, idField = 'id') {
        return this.findOne(dataKey, item => item[idField] == id);
    }

    /**
     * キャラクターデータの取得（便利メソッド）
     * @param {number} charId - キャラクターID
     * @returns {Object|null} キャラクターデータ
     */
    getCharacter(charId) {
        return this.getById('characters', charId, 'char_id');
    }

    /**
     * キャラクターレベルデータの取得
     * @param {number} charId - キャラクターID
     * @param {number} level - レベル
     * @returns {Object|null} レベルデータ
     */
    getCharacterLevel(charId, level) {
        return this.findOne('character_levels', 
            item => item.char_id == charId && item.level == level);
    }

    /**
     * 会話データの取得（シーン・キャラクター別）
     * @param {number} sceneId - シーンID
     * @param {number} charId - キャラクターID（省略可）
     * @returns {Array} 会話データの配列
     */
    getDialogues(sceneId, charId = null) {
        const filters = [item => item.scene_id == sceneId];
        if (charId !== null) {
            filters.push(item => item.char_id == charId);
        }
        
        return this.findData('dialogues', item => 
            filters.every(filter => filter(item))
        ).sort((a, b) => a.dialogue_id - b.dialogue_id);
    }

    /**
     * 麻雀牌データの取得（種類別）
     * @param {string} tileType - 牌の種類
     * @param {string} suit - スート（省略可）
     * @returns {Array} 牌データの配列
     */
    getTiles(tileType = null, suit = null) {
        const filters = [];
        if (tileType) filters.push(item => item.tile_type === tileType);
        if (suit) filters.push(item => item.suit === suit);
        
        if (filters.length === 0) {
            return this.getData('mahjong_tiles') || [];
        }
        
        return this.findData('mahjong_tiles', item => 
            filters.every(filter => filter(item))
        );
    }

    /**
     * シーンデータの取得
     * @param {number} sceneId - シーンID
     * @returns {Object|null} シーンデータ
     */
    getScene(sceneId) {
        return this.getById('scenes', sceneId, 'scene_id');
    }

    /**
     * エンディングデータの取得
     * @param {string} endingType - エンディングタイプ
     * @returns {Object|null} エンディングデータ
     */
    getEnding(endingType) {
        return this.findOne('endings', item => item.ending_type === endingType);
    }

    /**
     * シーン別会話データの取得
     * @param {number} sceneId - シーンID
     * @returns {Array} 会話データの配列
     */
    getDialoguesByScene(sceneId) {
        return this.findData('dialogues', item => item.scene_id == sceneId)
            .sort((a, b) => a.dialogue_id - b.dialogue_id);
    }

    /**
     * すべてのデータを取得（デバッグ用）
     * @returns {Object} 全データのオブジェクト
     */
    getAllData() {
        const result = {};
        for (const [key, value] of this.data) {
            result[key] = value;
        }
        return result;
    }

    /**
     * データの読み込み状況を確認
     * @param {string} dataKey - データキー
     * @returns {boolean} 読み込み済みかどうか
     */
    isDataLoaded(dataKey) {
        return this.isLoaded.get(dataKey) || false;
    }

    /**
     * 全データの読み込み状況を確認
     * @returns {boolean} 全データが読み込み済みかどうか
     */
    isAllDataLoaded() {
        const requiredData = [
            'scenes', 'characters', 'dialogues', 'character_levels', 'endings',
            'ui_elements', 'game_balance', 'sound_effects', 'mahjong_tiles'
        ];
        
        return requiredData.every(dataKey => this.isDataLoaded(dataKey));
    }

    /**
     * データキャッシュのクリア
     * @param {string} dataKey - クリアするデータキー（省略時は全て）
     */
    clearCache(dataKey = null) {
        if (dataKey) {
            this.data.delete(dataKey);
            this.isLoaded.delete(dataKey);
        } else {
            this.data.clear();
            this.isLoaded.clear();
        }
        
        console.log(`🗑️ CSV cache cleared: ${dataKey || 'all'}`);
    }

    /**
     * CSVデータのエクスポート（デバッグ・開発用）
     * @param {string} dataKey - エクスポートするデータキー
     * @param {string} filename - 保存ファイル名
     */
    exportCSV(dataKey, filename) {
        const data = this.getData(dataKey);
        if (!data || data.length === 0) {
            console.warn(`⚠️ No data to export for: ${dataKey}`);
            return;
        }

        const csv = Papa.unparse(data, {
            header: true,
            encoding: 'utf-8-sig',
            delimiter: ','
        });

        // BOMを追加
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csv;
        
        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8-sig' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename || `${dataKey}.csv`;
        link.click();

        console.log(`💾 CSV exported: ${dataKey} as ${filename}`);
    }
}