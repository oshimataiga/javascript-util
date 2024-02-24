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
        this.filterBtns = [];
    }

    /**
     * 行の表示を切り替える
     * 
     * @param {array} values 表示対象文字列の配列
     * @param {int} columnIndex 行番号
     */
    switchingDisplayOfRows(values,columnIndex){
        Array.prototype.forEach.call(this.rows,row => {
            if(values.includes(row.children[columnIndex].innerHTML)){
                row.classList.remove('hide');
            }else{
                row.classList.add('hide');
            }
        })
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
 * テーブルとフィルターボタンの間で制御を担うクラス
 */
class FilterController {
    /**
     * FilterController - コンストラクタ
     * @param {object} table フィルターテーブルインスタンス 
     */
    constructor(table){
        this.filterTable = table;
        this.visibleRows = [];
    }

    /**
     * フィルター実行ボタン押下時に起動する
     */
    execute(e){
        //ボタンが押された列番号を取得
        const index = this.getBtnIndex(e);
        console.log(index)

        //該当モーダルを特定
        const modal = this.filterTable.filterBtns[index].modal;
        
        //モーダルを閉じる
        modal.close();

        //リストから値を取得
        const values = modal.filterList.getCheckedValues();
        console.log(values)

        //行の表示を切り替える
        this.filterTable.switchingDisplayOfRows(values,index);

        //表示中の行を取得
        const visibleRows = this.filterTable.getVisibleRows();

        // 当該ボタン以外のリストを再生成する
        for(let btn of this.filterTable.filterBtns){
            if(btn.columnIndex !== index){
                btn.modal.createList(visibleRows,index);
            }
        }
    }

    /**
     * クリックイベント発生時、実行対象の列番号を取得する
     * 
     * @param {object} e イベントオブジェクト 
     * @returns {int} フィルター実行対象列番号
     */
    getBtnIndex(e){
        console.log(e.target)
        const pushedBtn = this.filterTable.filterBtns.filter(btn => {
            console.log(btn.modal.exeBtn)
            return e.target == btn.modal.exeBtn;
        });

        return pushedBtn[0].columnIndex;
    }

    /**
     * テーブルにフィルターボタンを追加するメソッド
     */
    insertFilerBtns(){
        Array.prototype.forEach.call(this.filterTable.columns,(column,index) => {
            const filterBtn = new FilterButton(index);
            column.appendChild(filterBtn.elem);
            filterBtn.modal.createList(this.filterTable.rows,index);
            filterBtn.modal.exeBtn.addEventListener('click',e =>{
                this.execute(e)
            })
            this.filterTable.filterBtns.push(filterBtn);
        })
    }

    /**
     * 表示中のテーブルの行を作成するメソッド
     */
    getVisibleRows(){
        this.visibleRows = Array.prototype.filter.call(this.filterTable.rows,row=>{
            return !row.className.includes('hide');
        });
        console.log(this.visibleRows)
    }

    /**
     * フィルター実行時、他のフィルターをリセットするメソッド
     */
    filtering(e){
        this.getVisibleRows();
        for(let filterBtn of this.filterBtns){
            filterBtn.execute(this.visibleRows);
        }
    }

    /**
     * 全てのフィルターをリセットする
     */
    reset(){

    }
}

/**
 * フィルターボタンオブジェクトを生成するクラス
 */
class FilterButton {

    /**
     * FilterButton - コンストラクタ
     */
    constructor(index){
        this.columnIndex = index;
        this.elem = document.createElement('div');
        this.elem.className = 'sort-btn';
        this.elem.innerHTML = '▼';
        this.modal = new FilterModal();
        this.elem.appendChild(this.modal.elem);
        this.elem.addEventListener('click', e => {
            this.modal.open(e)
        });
        this.correctValues = [];
    }

    /**
     * フィルター確定時、リストから対象値を取得するメソッド
     */
    correct(){
        this.modal.getList()
    }

    /**
     * visibleRowsの重複削除
     */
    deleteDuplicate(visibleRows){
        const count = {};
        for(let row of visibleRows){
            count[row.children[this.columnIndex].innerHTML] = (count[row.children[this.columnIndex].innerHTML] || 0) + 1
        };

        // 空白じゃないやつだけ返す
        return Object.keys(count).filter(key => {return key !== ''});
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
        this.elem = document.createElement("div");
        this.elem.className = "filter-modal";
        this.filterList = new filterList()
        this.elem.appendChild(this.filterList.elem);
        this.searchTextBox = new SearchTextBox();
        this.exeBtn = document.createElement('button');
        this.exeBtn.innerHTML = '実行';
        this.elem.appendChild(this.exeBtn);
        this.cancelBtn = document.createElement('button');
        this.cancelBtn.innerHTML = '閉じる';
    }

    /**
     * フィルターボタン押下時、モーダルを表示するメソッド
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
     * 
     */
    close(){
        this.elem.style.visibility = 'hidden';
    }

    
    /**
     * リストを作成するメソッド
     */
    createList(visibleRows,index){
        console.log(visibleRows)
        // 全てを追加する
        this.filterList.add(`select-${index}-all`,'all',`select-${index}-all`,'すべて');


        // 空白を追加する
        this.filterList.add(`select-${index}`,'',`select-${index}-blank`,'空白');

        // visibleRowsの重複削除して値だけ配列に変換

        const deletedDuplicateKeywords = Array.prototype.reduce.call(visibleRows,(acc,row) => {
            const keyword = row.children[index].innerHTML;
            if(!acc.includes(keyword)){
                acc.push(keyword);
            }
            return acc;
        },[]);


        // 値配列分追加する
        for(let keyword of deletedDuplicateKeywords){
            const checkboxName = `select-${index}`;
            const id = `${index}-${keyword}`;
            this.filterList.add(checkboxName,keyword,id,keyword);
        }
    }
}

class CheckboxAndLabel {

    /**
     * CheckboxForLabel - コンストラクタ
     * 
     * @param {string} name name属性値
     * @param {string} value value属性値
     * @param {string} id
     */
    constructor(checkboxName,checkboxValue,labelText,id){
        this.wrapper = document.createElement('div');
        this.wrapper.appendChild(new Checkbox(checkboxName,checkboxValue,id).checkbox);
        this.wrapper.appendChild(new Label(labelText,id).label);
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
        console.log(checkboxName)
        this.checkbox.setAttribute('name',checkboxName);
    }

    /**
     * value値を設定する
     * 
     * @param {string} checkboxValue value属性値
     */
    setValue(checkboxValue){
        console.log(checkboxValue)
        this.checkbox.value = checkboxValue;
    }

    /**
     * idを設定する
     * 
     * @param {string} id id属性値
     */
    setId(id){
        console.log(id)
        this.checkbox.id = id
    }

    /**
     * changeイベントリスナーに追加するメソッド
     */
    setChangingFunc(func){
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
 * フィルターリストオブジェクト
 */
class filterList {
    constructor(){
        this.elem = document.createElement("div");
        this.elem.className = "filter-list";
    }

    /**
     * リストの値を取得するメソッド
     * 
     * @return {array} チェックされているチェックボックスのDOMの配列
     */
    getCheckedValues(){
        return Array.prototype.reduce.call(this.elem.children,(acc,checkWrap) => {
            console.log(checkWrap)
            if(checkWrap.children[0].checked == true){
                acc.push(checkWrap.children[0].value);
            }
            return acc;
        },[]);
    }

    /**
     * チェックボックスラッパーを追加する
     */
    add(checkboxName,checkboxValue,labelText,id){
        this.elem.appendChild(new CheckboxAndLabel(checkboxName,checkboxValue,labelText,id).wrapper)
    }
}

/**
 * 検索用インプットボックスを生成するインスタンス
 */
class SearchTextBox {
    constructor(){

    }

    /**
     * 検索を実行するメソッド
     */
    seaching(){

    }
}