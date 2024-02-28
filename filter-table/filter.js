/**
 * フィルターテーブルクラス
 */
class FilterTable {
    /**
     * FilterTable - コンストラクタ
     * @param {HTMLTableElement} table テーブルのDOM
     */
    constructor(table){
        this.table = table;
        this.columns = table.tHead.rows[0].children;
        this.rows = table.tBodies[0].rows;
        this.filterIcons = [];
    }

    /**
     * 行の表示を切り替える
     * 
     * @param {Array} values リストの中でチェックが入っているチェックボックスの値の配列→
     * @param {number} columnIndex 列番号
     * @returns {void}
     */
    switchingDisplay(checkingStatus,columnIndex){

        // テーブルのすべての行に対するループ処理
        Array.prototype.forEach.call(this.rows,row => {
            const value = row.children[columnIndex].innerHTML;
                
            // 既に表示されている場合
            if(!row.classList.contains('hide')){
                
                // チェックが入っていない場合
                if(!checkingStatus[value]){
                    // 行を隠す
                    row.classList.add('hide');
                }

            }else{
                // 表示されていない行且つ、チェックが入っていれば
                if(checkingStatus[value]){

                    // 行を表示する
                    row.classList.remove('hide');
                }
            }
        });
    }

    /**
     * 現在表示されている行を抽出するメソッド
     * 
     * @returns {Array} 現在表示されている行の配列
     */
    getVisibleRows(){
        return Array.prototype.filter.call(this.rows,row=>{
            return !row.className.includes('hide');
        });
    }
}

/**
 * テーブルとフィルターアイコンの間で制御を担うクラス
 */
class FilterController {
    /**
     * FilterController - コンストラクタ
     * @param {FilterTable} table フィルターテーブルインスタンス 
     */
    constructor(table){
        this.filterTable = table;
        this.filterOrders = [];
    }

    /**
     * フィルター実行ボタン押下時に起動する
     * 
     * @param {object} e イベントオフジェクト
     * @returns {void}
     */
    execute(e){
        //ボタンが押された列番号を取得
        const index = this.getColumnIndex(e);

        //該当モーダルを特定
        const icon = this.filterTable.filterIcons[index];
        const modal = icon.modal;
        
        //モーダルを閉じる
        modal.close();

        // チェック状態が前回のチェック状態と同じなら終了
        if(modal.filterList.isSame()){
            return;
        }
            
        // モーダルが一つでもフィルターされている場合（いずれかのチェックが外れている場合）
        if(modal.isFilter()){
                
            // フィルター順序記録配列に含まれていない場合
            if(!this.filterOrders.includes(index)){
                
                // 文字黒、背景薄いグレーにする
            this.filterOrders.forEach(columnIndex => {
                this.filterTable.filterIcons[columnIndex].color('black','dimgray')
            });
            
            // フィルター順序記録配列に列番号を追加
            this.filterOrders.push(index);
            
            // 文字、白、背景濃いグレー
            icon.color('white','dimgray');
            }
            
        }else{
            // モーダルが一つもフィルターされていない場合、最後の要素を削除
            this.filterOrders.pop();
            
            // 文字、白、背景濃いグレー
            icon.color('black','gainsboro');
            
            // 最後にフィルターされた値を文字、白、背景濃いグレー
            if(this.filterOrders.length > 0){
                this.filterTable.filterIcons[this.filterOrders[this.filterOrders.length - 1]].color('white','dimgray');
            }
            
        }
        
        console.log(this.filterOrders);
        
        // 当該モーダルの全チェックリストのチェック状態を保持した連想配列を取得
        const checkingStatus = modal.filterList.getCheckingStatus();
        
        //行の表示を切り替える
        this.filterTable.switchingDisplay(checkingStatus,index);
        
        //表示中の行を取得
        const visibleRows = this.filterTable.getVisibleRows();
        
        // 最後にフィルターの列番号を取得
        const lastFilterIndex = this.getLastFilterIndex();

        // フィルターモーダルをループ
        for(let icon of this.filterTable.filterIcons){

            // モーダル列番号と今回ボタンを押されたモーダル列番号が違う場合
            if(icon.columnIndex !== index){

                // リストの切り替え処理
                icon.modal.filterList.switchingDisplay(
                    visibleRows,icon.columnIndex,index
                );

                if(icon.columnIndex == lastFilterIndex){

                    // 復元処理
                    icon.modal.filterList.redisplay(index); 
                }
            }else{

            }
        }
    }

    /**
     * 最後にフィルターされた列番号を取得する
     * 
     * @returns {number} 最後にフィルターされた列番号
     */
    getLastFilterIndex(){
        return this.filterOrders[this.filterOrders.length - 1];
    }


    /**
     * クリックイベント発生時、実行対象の列番号を取得する
     * 
     * @param {object} e イベントオブジェクト 
     * @returns {number} フィルター実行対象列番号
     */
    getColumnIndex(e){
        const pushedIcon = this.filterTable.filterIcons.filter(icon => {
            return e.target == icon.modal.exeBtn;
        });

        return pushedIcon[0].columnIndex;
    }

    /**
     * テーブルにフィルターボタンを追加するメソッド
     * 
     * @returns {void}
     */
    insertFilerBtns(){
        
        Array.prototype.forEach.call(this.filterTable.columns,(column,index) => {   // テーブルの全列をループ

            const filterIcon = new FilterIcon(index);   // アイコンを生成

            column.appendChild(filterIcon.icon);    // 列にカラムを追加

            filterIcon.modal.filterList.init(this.filterTable.rows,index);     // フィルターリストを初期化

            filterIcon.icon.addEventListener('click', e => {    // アイコンにモーダルを開く処理を追加
                
                if(filterIcon.isClick(e)){  // アイコンのクリック可否を判定
                    
                    for(let icon of this.filterTable.filterIcons){  // 全アイコンをループ
                        
                        if(icon.columnIndex === index){     // モーダル列番号と今回ボタンを押されたモーダル列番号が同じ場合

                            icon.modal.open();  // モーダルを開く

                        }else{  // それ以外の場合

                            icon.modal.close();     // モーダルを閉じる
                        }
                    }

                    filterIcon.modal.filterList.saveCurrentCheckValues();   // 開いた時点のチェックされた値を保存

                }else{  // それ以外の場合
                    
                }
            });

            // 実行ボタンにフィルター実行処理を登録
            filterIcon.modal.exeBtn.addEventListener('click',e =>{
                this.execute(e)
            });

            // キャンセルボタンイベントをに閉じる処理を登録
            filterIcon.modal.cancelBtn.addEventListener('click',() => {
                filterIcon.modal.close();
            });

            filterIcon.modal.searchTextBox.textBox.addEventListener('keydown',() => {
                filterIcon.modal.searchTextBox.seaching(filterIcon.modal.filterList.listContainer.children);
            });

            filterIcon.modal.filterList.allSelector.checkbox.checkbox.addEventListener('change',() => {
                filterIcon.modal.filterList.checkAll();
            })

            this.filterTable.filterIcons.push(filterIcon);
        })
    }
}

/**
 * フィルターアイコンオブジェクトクラス
 */
class FilterIcon {

    /**
     * FilterIcon - コンストラクタ
     * 
     * @param {number} index 追加するテーブルヘッダーの列番号[0,1,2...]
     */
    constructor(index){
        this.columnIndex = index;
        this.icon = document.createElement('div');
        this.icon.className = 'filter-icon';
        this.icon.innerHTML = '▼';
        this.modal = new FilterModal();
        this.icon.appendChild(this.modal.modal);
    }

    /**
     * 要素の色を変える
     * 
     * @param {string} fontColor 文字の色
     * @param {string} backgroundColor 背景の色
     * @returns {void}
     */
    color(fontColor,backgroundColor){
        this.icon.style.color = fontColor;
        this.icon.style.background = backgroundColor;
    }

    /**
     * アイコンをクリックしているか判定
     */
    isClick(e){
        if(e.target === this.icon){
            return true;
        }else{
            return false;
        }
    }

}

/**
 * フィルターモーダルクラス
 */
class FilterModal {

    /**
     * FilterModal - コンストラクタ
     */
    constructor(){
        this.modal = document.createElement("div");
        this.modal.className = "filter-modal";
        this.filterList = new filterList()
        this.modal.appendChild(this.filterList.listContainer);
        this.searchTextBox = new SearchTextBox();
        this.modal.appendChild(this.searchTextBox.textBox);
        this.exeBtn = document.createElement('button');
        this.exeBtn.innerHTML = '実行';
        this.exeBtn.className = 'btn';
        this.modal.appendChild(this.exeBtn);
        this.cancelBtn = document.createElement('button');
        this.cancelBtn.innerHTML = '閉じる';
        this.cancelBtn.className = 'btn';
        this.modal.appendChild(this.cancelBtn)
    }

    /**
     * フィルターボタン押下時、モーダルを表示する
     * 
     * @returns {void}
     */
    open() {
        this.modal.style.visibility = 'visible';
    }

    /**
     * モーダルを閉じる
     * 
     * @returns {void}
     */
    close(){
        this.modal.style.visibility = 'hidden';
    }

    /**
     * モーダルがフィルターされているか（いずれかの値のチェックが外れているか）
     * 
     * @returns {bool} フィルターされている場合はtrue,それ以外はfalse
     */
    isFilter(){
        const visibleList = Array.prototype.filter.call(this.filterList.listContainer.children,checkWrap => {
            return !checkWrap.classList.contains('hide');
        });

        return Array.prototype.some.call(visibleList,checkWrap => {
            return checkWrap.children[0].checked == false && checkWrap.children[0].value != 'all';
        });
    }
}

/**
 * フィルターリストオブジェクト
 */
class filterList {

    /**
     * FilterList - コンストラクタ
     */
    constructor(){
        this.listContainer = document.createElement("div");
        this.listContainer.className = "filter-list";
        this.allSelector = '';
        this.hideList = {};
        this.checkedValues = [];
    }

    /**
     * 現在チェックされている値を保存する
     */
    saveCurrentCheckValues(){
        this.checkedValues = this.getCheckedValues();
    }

    /**
     * 現在のリストでチェックされている値を表示する
     */
    getCheckedValues(){
        return Array.prototype.filter.call(this.listContainer.children,checkWrap => {
            return checkWrap.children[0].checked == true;
        });
    }

    /**
     * 前回の値と同じかどうか判定する
     */
    isSame(){
        const beforeValues = this.checkedValues;
        const currentValues = this.getCheckedValues();
        console.log(beforeValues,currentValues)

        // 今の値と同じ場合
        if(beforeValues.length !== currentValues.length){

            // falseを返却
            return false;
        }

        // 開いた時の値をループ
        for(let i = 0; i < beforeValues.length; i++){
            // 値が違う場合
            if(beforeValues[i] !== currentValues[i]){

                // falseを返却
                return false;
            }
        }
        return true;
    }

    /**
     * 全リストのチェック状態を取得する
     * 
     * @returns {Array} チェックボックスのvalue値をプロパティに持ち、チェック状態をtrue,falseで保持する連想配列
     */
    getCheckingStatus(){
        return Array.prototype.reduce.call(this.listContainer.children,(acc,checkWrap) => {
            const checkbox = checkWrap.children[0];
            if(checkbox.checked == true){
                acc[checkbox.value] = true;
            }else{
                acc[checkbox.value] = false;
            }
            return acc;
        },{});
    }

    /**
     * チェックボックスラッパーを追加する
     * 
     * @returns {HTMLDivElement} checkboxとlabelを配下に持つdiv要素
     */
    add(checkboxName,checkboxValue,labelText,id){
        const checkboxAndLabel = new CheckboxAndLabel(checkboxName,checkboxValue,labelText,id);
        this.listContainer.appendChild(checkboxAndLabel.wrapper);
        return checkboxAndLabel;
    }

    /**
     * リストを初期化するメソッド
     * 
     * @param {Array} visibleRows HTMLテーブルの行データ配列
     * @param {number} index 列番号
     * @returns {void}
     */
    init(visibleRows,index){
        // 'すべて'選択肢を追加する
        const all = this.add(`select-${index}-all`,'all','すべて',`select-${index}-all`);
        all.checkbox.checkbox.checked = true; 
        this.allSelector = all;

        // 重複削除
        const keywords = this.deletedDuplicate(visibleRows,index);

        // 値配列分追加する
        for(let keyword of keywords){
            const checkboxName = `select-${index}`;
            const id = `${index}-${keyword}`;
            const value = this.add(checkboxName,keyword,keyword,id);
            value.checkbox.checkbox.checked = true;
        }
    }

    /**
     * 特定の列の値且つ重複を省いた配列を返す
     * 
     * @param {Array} visibleRows HTMLテーブルの行データ配列
     * @param {number} columnIndex 列番号
     * @returns {Array} HTMLテーブルの特定列の重複を除いた文字列の配列
     */
    deletedDuplicate(visibleRows,columnIndex){
        return Array.prototype.reduce.call(visibleRows,(acc,row) => {
            const keyword = row.children[columnIndex].innerHTML;
            if(!acc.includes(keyword)){
                acc.push(keyword);
            }
            return acc;
        },[]);
    }

    /**
     * モーダルリストの表示を見えているものだけに切り替える
     * 
     * @param {Array} visibleRows HTML<tr>要素の配列
     * @param {number} columnIndex このモーダルの列番号
     * @param {number} modalIndex 実行中モーダルの列番号
     * @returns {void}
     */
    switchingDisplay(visibleRows,columnIndex,modalIndex){
        const keywords = this.deletedDuplicate(visibleRows,columnIndex);
        console.log(keywords)

        // リストをループ
        Array.prototype.forEach.call(this.listContainer.children,checkWrap => {
            const checkbox = checkWrap.children[0];
            const listValue = checkbox.value;

            // チェックボックスの値が重複削除値に含まれる場合
            if(keywords.includes(listValue)){

                // 表示する
                checkWrap.classList.remove('hide');
                
                // チェックをつける
                checkbox.checked = true;
            }else{

                // チェックボックスの値が重複削除値に含まれない場合
                if(listValue != 'all'){

                    // 隠す
                    checkWrap.classList.add('hide');
                    this.hideList[modalIndex] = [];
                    this.hideList[modalIndex].push(checkWrap);

                    // チェックを外す
                    checkbox.checked = false;
                }else{

                }
            }
        });
    }

    /**
     * 隠れたリストを再表示
     * 
     * @param {number} modalIndex 実行中モーダルの列番号
     * @returns {void}
     */
    redisplay(modalIndex){
        // 全リストをループ
        this.hideList[modalIndex].forEach(checkWrap => {
            checkWrap.classList.remove('hide');
        });
    }

    /**
     * 全ての値にチェックを入れる、または外す処理
     */
    checkAll(){
        const checkboxes = Array.prototype.filter.call(this.listContainer.children,checkWrap => {
            return !checkWrap.classList.contains('hide');
        });

        if(this.allSelector.checkbox.checkbox.checked){
            Array.prototype.forEach.call(checkboxes,checkWrap => {
                checkWrap.children[0].checked = true;
            });
        }else{      
            Array.prototype.forEach.call(checkboxes,checkWrap => {
                checkWrap.children[0].checked = false;
            });
        }
    }

}

/**
 * チェックボックスとラベルのインスタンスを生成するクラス
 */
class CheckboxAndLabel {

    /**
     * CheckboxForLabel - コンストラクタ
     * 
     * @param {string} name name属性値
     * @param {string} value value属性値
     * @param {string} id id属性値
     */
    constructor(checkboxName,checkboxValue,labelText,id){
        this.wrapper = document.createElement('div');
        this.checkbox = new Checkbox(checkboxName,checkboxValue,id);
        this.wrapper.appendChild(this.checkbox.checkbox);
        this.label = new Label(id,labelText);
        this.wrapper.appendChild(this.label.label);
    }

}

/**
 * チェックボックスインスタンスを生成するクラス
 */
class Checkbox {
    /**
     * Checkbox - コンストラクタ
     * 
     * @param {string} checkboxName name属性値
     * @param {string} checkboxValue value属性値
     * @param {string} id id属性値
     */
    constructor(checkboxName,checkboxValue,id){
        this.checkbox = document.createElement('input');
        this.checkbox.setAttribute('type','checkbox');
        this.setName(checkboxName);
        this.setValue(checkboxValue);
        this.setId(id);
    }

    /**
     * チェックボックスに名前を設定する
     * 
     * @param {string} checkboxName name属性値
     * @returns {void}
     */
    setName(checkboxName){
        this.checkbox.setAttribute('name',checkboxName);
    }

    /**
     * value値を設定する
     * 
     * @param {string} checkboxValue value属性値
     * @returns {void}
     */
    setValue(checkboxValue){
        this.checkbox.value = checkboxValue;
    }

    /**
     * idを設定する
     * 
     * @param {string} id id属性値
     * @returns {void}
     */
    setId(id){
        this.checkbox.id = id
    }

    /**
     * changeイベントリスナーに追加するメソッド
     * 
     * @param {Function}
     * @returns {void}
     */
    addChangeEvent(func){
        this.checkbox.addEventListener('click',func);
    }
}

/**
 * ラベルインスタンスを生成するクラス
 */
class Label {

    /**
     * Label - コンストラクタ
     * 
     * @param {number} id 
     * @param {string} labelText 
     */
    constructor(id,labelText){
        this.label = document.createElement('label');
        this.setFor(id);
        this.setText(labelText);
    }

    /**
     * インナーHTMLを設定する
     * 
     * @param {string} labelText
     * @returns {void} 
     */
    setText(labelText){
        this.label.innerHTML = labelText;
    }

    /**
     * for属性に値を設定させる
     * 
     * @param {string} id 
     * @returns {void}
     */
    setFor(id){
        this.label.setAttribute('for',id);
    }
}

/**
 * 検索用インプットボックスを生成するインスタンス
 */
class SearchTextBox {

    /**
     * SearchTextBox - コンストラクタ
     */
    constructor(){
        this.textBox = document.createElement('input');
        this.textBox.className = 'search-box';
        this.textBox.setAttribute('placeholder','検索(Enterで確定)')
    }

    /**
     * 検索を実行するメソッド
     * 
     * @param {Array} filterList フィルターの配列
     * @returns {void}
     */
    seaching(filterList){
        const searchValue = this.textBox.value;
        for (let checkWrap of filterList) {
            const checkbox = checkWrap.children[0];
            const value = checkbox.value;
            if (value.indexOf(searchValue) > -1) {
                checkWrap.style.display = '';
            } else {
                checkWrap.style.display = 'none';
            }
        }
    }
}
