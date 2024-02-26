/**
 * フィルターテーブルクラス
 */
class FilterTable {
    /**
     * FilterTable - コンストラクタ
     * @param {object} table テーブルのDOM
     */
    constructor(table){
        this.table = table;
        this.columns = table.tHead.rows[0].children;
        this.rows = table.tBodies[0].rows;
        this.filterIcons = [];
        this.deleteRows = [];
        this.regenerateRows = [];
    }

    /**
     * 行の表示を切り替える
     * 
     * @param {array} values リストの中でチェックが入っているチェックボックスの値の配列→
     * @param {int} columnIndex 列番号
     */
    switchingDisplayOfRows(checkingStatus,columnIndex){
        // プロパティの初期化
        this.deleteRows = [];
        this.regenerateRows = [];
        // テーブルのすべての行に対するループ処理
        Array.prototype.forEach.call(this.rows,row => {

            // 既に表示されている場合
            if(!row.classList.contains('hide')){
                const value = row[columnIndex];

                // チェックがtrueの場合
                if(checkingStatus[value]){

                    // 行を隠す
                    row.classList.add('hide');
                    this.deleteRows.push(row);
                }

                // 表示されていない場合
            }else{
                // さっき消した行の中にこの行が入っている且つ、チェックが入っていれば
                if(!checkingStatus[value]){

                    // 行を表示する
                    row.classList.remove('hide');
                    this.regenerateRows.push(row);
                }
            }
        });
    }

    /**
     * 現在表示されている行を抽出するメソッド
     * 
     * @return {array} 現在表示されている行の配列
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
     * @param {object} table フィルターテーブルインスタンス 
     */
    constructor(table){
        this.filterTable = table;
        this.visibleRows = [];
        this.filterOrders = [];
    }

    /**
     * フィルター実行ボタン押下時に起動する
     */
    execute(e){
        //ボタンが押された列番号を取得
        const index = this.getColumnIndex(e);
        console.log(index)

        //該当モーダルを特定
        const modal = this.filterTable.filterIcons[index].modal;
        
        //モーダルを閉じる
        modal.close();

        //チェックされている値の配列を取得
        const values = modal.filterList.getCheckedValues();

        // モーダルがフィルターされている場合
        if(modal.isFilter()){

            // this.filterOrdersに追加
            this.filterOrders.push(index);   
        
        }else{

            // それ以外はthis.filterOrdersから削除
            this.filterOrdersRemove(index);
        }

        // 当該モーダルの全チェックリストのチェック状態を保持した連想配列を取得
        const checkingStatus = modal.filterList.getChekingStatus();

        //行の表示を切り替える
        this.filterTable.switchingDisplayOfRows(checkingStatus,index);

        //表示中の行を取得
        const visibleRows = this.filterTable.getVisibleRows();

        // 当該モーダル以外のリストを更新する
        const lastFilterIndex = this.getLastFilterIndex();
        for(let icon of this.filterTable.filterIcons){
            if(icon.columnIndex !== index){
                icon.modal.filterList.switchingDisplay(
                    this.filterTable.deleteRows,
                    this.filterTable.regenerateRows,
                    icon.columnIndex,
                    lastFilterIndex
                );
            }
        }
    }

    /**
     * filterOrdersから値を削除する
     */
    filterOrdersRemove(columnIndex){
        const targetIndex = this.filterOrders.findIndex(filterIndex => filterIndex == columnIndex);
        this.filterOrders.splice(targetIndex,1);
    }

    /**
     * 最後にフィルターされた列番号
     * 
     * @return {int} 最後にフィルターされた列番号
     */
    getLastFilterIndex(){
        return this.filterOrders.pop();
    }


    /**
     * クリックイベント発生時、実行対象の列番号を取得する
     * 
     * @param {object} e イベントオブジェクト 
     * @returns {int} フィルター実行対象列番号
     */
    getColumnIndex(e){
        console.log(e.target)
        const pushedIcon = this.filterTable.filterIcons.filter(icon => {
            return e.target == icon.modal.exeBtn;
        });

        return pushedIcon[0].columnIndex;
    }

    /**
     * テーブルにフィルターボタンを追加するメソッド
     */
    insertFilerBtns(){
        Array.prototype.forEach.call(this.filterTable.columns,(column,index) => {
            const filterIcon = new FilterIcon(index);
            column.appendChild(filterIcon.icon);
            filterIcon.modal.filterList.init(this.filterTable.rows,index);

            filterIcon.icon.addEventListener('click', e => {
                filterIcon.modal.open(e)
            });

            filterIcon.modal.exeBtn.addEventListener('click',e =>{
                this.execute(e)
            });

            filterIcon.modal.cancelBtn.addEventListener('click',() => {
                filterIcon.modal.close();
            });

            filterIcon.modal.searchTextBox.textBox.addEventListener('keydown',() => {
                filterIcon.modal.searchTextBox.seaching(filterIcon.modal.filterList.listContainer.children);
            });

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
     */
    constructor(index){
        this.columnIndex = index;
        this.icon = document.createElement('div');
        this.icon.className = 'filter-icon';
        this.icon.innerHTML = '▼';
        this.modal = new FilterModal();
        this.icon.appendChild(this.modal.modal);
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
        this.modal.appendChild(this.exeBtn);
        this.cancelBtn = document.createElement('button');
        this.cancelBtn.innerHTML = '閉じる';
        this.modal.appendChild(this.cancelBtn)
    }

    /**
     * フィルターボタン押下時、モーダルを表示する
     * 
     * @param {object} e クリックイベントオブジェクト
     */
    open(e) {
        if(e.target.getElementsByClassName('filter-modal')[0] === undefined){
            return;
        }else{

            for(let modal of document.getElementsByClassName('filter-modal')){
                if(e.target.getElementsByClassName('filter-modal')[0] == modal){
                    modal.style.visibility = 'visible';
                }else{
                    modal.style.visibility = 'hidden';
                }  
            }
        }
    }

    /**
     * モーダルを閉じる
     */
    close(){
        this.modal.style.visibility = 'hidden';
    }

    /**
     * モーダルがフィルターされているか（いずれかの値のチェックが外れているか）
     */
    isFilter(){
        Array.prototype.some.call(this.filterList.listContainer.children,checkWrap => {
            return checkWrap.children[0].checked == false && checkWrap.children[0].value != 'all';
        });
    }
}

/**
 * フィルターリストオブジェクト
 */
class filterList {
    constructor(){
        this.listContainer = document.createElement("div");
        this.listContainer.className = "filter-list";
    }

    /**
     * リストの値を取得する
     * 
     * @return {array} チェックされているチェックボックスのvalue値の配列
     */
    getCheckedValues(){
        return Array.prototype.reduce.call(this.listContainer.children,(acc,checkWrap) => {
            console.log(checkWrap)
            const checkbox = checkWrap.children[0];
            if(checkbox.checked == true){
                acc.push(checkWrap.children[0].value);
            }
            return acc;
        },[]);
    }

    /**
     * 全リストのチェック状態を取得する
     */
    getChekingStatus(){
        return Array.prototype.reduce.call(this.listContainer.children,(acc,checkWrap) => {
            console.log(checkWrap)
            const checkbox = checkWrap.children[0];
            if(checkbox.checked == true){
                acc[checkbox.value] = true;
            }else{
                acc[checkbox.value] = false;
            }
            console.log(acc)
            return acc;
        },{});
    }

    /**
     * チェックボックスラッパーを追加する
     * 
     * @return {object} checkboxとlabelを配下に持つdiv要素
     */
    add(checkboxName,checkboxValue,labelText,id){
        const checkboxAndLabel = new CheckboxAndLabel(checkboxName,checkboxValue,labelText,id);
        this.listContainer.appendChild(checkboxAndLabel.wrapper);
        return checkboxAndLabel;
    }

    /**
     * リストを初期化するメソッド
     */
    init(visibleRows,index){
        console.log(visibleRows)
        // 'すべて'選択肢を追加する
        const all = this.add(`select-${index}-all`,'all','すべて',`select-${index}-all`);
        const allChekedFunc = () =>{
            const checkboxes = this.listContainer.children
            if(all.checkbox.checkbox.checked){
                Array.prototype.forEach.call(checkboxes,checkWrap => {
                    checkWrap.children[0].checked = true;
                }) ;
            }else{      
                Array.prototype.forEach.call(checkboxes,checkWrap => {
                    checkWrap.children[0].checked = false;
                }) ;
            }
        }
        all.checkbox.addChangeEvent(allChekedFunc);
        all.checkbox.checkbox.checked = true; 
            
        // '空白'選択肢を追加する
        const blank = this.add(`select-${index}`,'','空白',`select-${index}-blank`);
        blank.checkbox.checkbox.checked = true;

        // visibleRowsの重複削除して値だけ配列に変換
        this.update(visibleRows,index);
    }

    /**
     * リストの中身を更新
     */
    update(visibleRows,index){
        console.log(visibleRows)
        // 重複削除
        const deletedDuplicateKeywords = Array.prototype.reduce.call(visibleRows,(acc,row) => {
            const keyword = row.children[index].innerHTML;
            if(!acc.includes(keyword)){
                acc.push(keyword);
            }
            return acc;
        },[]);

        console.log(deletedDuplicateKeywords);

        // 現在の値を抽出する
        console.log(this)
        const currentValues = this.getCheckedValues();
        console.log(currentValues);

        // 値配列分追加する
        for(let keyword of deletedDuplicateKeywords){
            if(!currentValues.includes(keyword)){
                const checkboxName = `select-${index}`;
                const id = `${index}-${keyword}`;
                const value = this.add(checkboxName,keyword,keyword,id);
                value.checkbox.checkbox.checked = true;
            }else{

            }
        }
    }

    /**
     * モーダルリストの表示を切り替える
     */
    switchingDisplay(deleteRows,regenerateRows,columnIndex,lastFilterIndex){
        
        const deleteValues = deleteRows.map(deleteRow => {
            return deleteRow.children[columnIndex].innerHTML;
        });
        const regenerateValues = regenerateRows.map(regenerateRow => {
            return regenerateRow.children[columnIndex].innerHTML;
        });

        Array.prototype.forEach.call(this.listContainer.children,checkWrap => {
            const checkbox = checkWrap.children[0];
            const listValue = checkbox.value;
            if(deleteValues.includes(listValue)){
                if(columnIndex == lastFilterIndex){
                    checkWrap.style.display = '';
                    checkbox.checked = false;
                }else{
                    checkWrap.style.display = 'none';
                }
            }
        });

        regenerateValues.forEach(regenerateValue => {
            
            const checkboxName = `select-${columnIndex}`;
            const id = `${columnIndex}-${regenerateValue}`;
            const value = this.add(checkboxName,regenerateValue,regenerateValue,id);
            value.checkbox.checkbox.checked = true;
        });
        // // 重複削除
        // const deletedDuplicateKeywords = Array.prototype.reduce.call(visibleRows,(acc,row) => {
        //     const keyword = row.children[index].innerHTML;
        //     if(!acc.includes(keyword)){
        //         acc.push(keyword);
        //     }
        //     return acc;
        // },[]);
        // console.log(deletedDuplicateKeywords)
        // // 現在チェックが入っている値の配列
        // const currentWraps = Array.prototype.reduce.call(this.listContainer.children,(acc,checkWrap) => {
        //     console.log(checkWrap)
        //     const checkbox = checkWrap.children[0];
        //     if(checkbox.checked == true){
        //         acc.push(checkWrap);
        //     }
        //     return acc;
        // },[]);

        // // チェック済み配列のループ
        // for (let i = 2; i < currentWraps.length; i++){
        //     const value = currentWraps[i].children[0].value;

        //     // チェックボックスのvalueが行配列に含まれていなければ
        //     if(!deletedDuplicateKeywords.includes(value)){
        //         console.log('この値は含まれません',value);
        //         if(value != 'all' && value != '' ){
        //             currentWraps[i].style.display = 'none';
        //         }  

        //     }else{
        //         currentWraps[i].style.display = '';
        //     }
        // }
    }

    /**
     * チェックされているかを判定する
     * 
     * @param {object} checkWrap チェックボックスラッパーオブジェクト
     * @return {bool} チェックされている場合、true、それ以外false
     */
    isChecked(checkWrap){
        return checkWrap.children[0].checked;
    }
}

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
     */
    setName(checkboxName){
        this.checkbox.setAttribute('name',checkboxName);
    }

    /**
     * value値を設定する
     * 
     * @param {string} checkboxValue value属性値
     */
    setValue(checkboxValue){
        this.checkbox.value = checkboxValue;
    }

    /**
     * idを設定する
     * 
     * @param {string} id id属性値
     */
    setId(id){
        this.checkbox.id = id
    }

    /**
     * changeイベントリスナーに追加するメソッド
     */
    addChangeEvent(func){
        this.checkbox.addEventListener('click',func);
    }

    /**
     * チェックをつける
     */
    checking(){
        this.checkbox.checked = true;
    }

    /**
     * チェックを外す
     */
    removing(){
        this.checkbox.checked = false;
    }

    /**
     * チェックがついているか判定する
     * 
     * @return {bool} チェックがついていればtrue,チェックがついていなければfalse
     */
    isCheck(){
        return this.checkbox.checked;
    }
}

/**
 * ラベルインスタンスを生成するクラス
 */
class Label {
    constructor(id,labelText){
        this.label = document.createElement('label');
        this.setFor(id);
        this.setText(labelText);
    }

    setText(labelText){
        this.label.innerHTML = labelText;
    }

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
    }

    /**
     * 検索を実行するメソッド
     */
    seaching(filterList){
        console.log(filterList)
        const searchValue = this.textBox.value.toLowerCase();
        for (let checkWrap of filterList) {
            const checkbox = checkWrap.children[0];
            console.log(checkbox)
            const value = checkbox.value.toLowerCase();
            if (value !== 'all' && value !== ''){return};
            if (value.indexOf(searchValue) > -1) {
                checkWrap.style.display = '';
            } else {
                checkWrap.style.display = 'none';
            }
        }
    }
}