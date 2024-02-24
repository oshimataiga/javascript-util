/**
 * ソートテーブルクラス
 * テーブルに絞り込み機能を付与します
 */
class FilterTable {
    /**
     * FilterTable - コンストラクタ
     * 
     * @param {*} table 
     */
    constructor(table) {
      this.table = table;
      this.init();
      this.filterBtns = [];
    }
  
    /**
     * 初期化メソッド
     * 
     */
    init() {
      this.thead = this.table.tHead;
      this.tbody = this.table.tBodies;
      this.rows = this.tbody[0].rows;
      this.createVisibleRows();
    }

    /**
     * 表示されているテーブルの行を作成するメソッド
     */
    createVisibleRows(){
        this.visibleRows = Array.prototype.filter.call(this.rows,row=>{
            return row.style.visibility !== 'hidden';
        });
        console.log(this.visibleRows)
    }
  
    setFilterBtn() {
        Array.prototype.forEach.call(this.thead.rows[0].cells, (th,index) => {
            const filter = new FilterButton(th,index,this);
            filter.createList();
            this.filterBtns.push(filter);
        });
    }


  }
  
  /**
   * フィルターボタンクラス
   */
  class FilterButton {

    /**
     * SortButton - オブジェクト
     * 
     * @param {object} th テーブルヘッダーオブジェクト 
     * @param {int} columnIndex 列番号 
     */
    constructor(th,columnIndex,table) {
        this.th = th;
        this.columnIndex = columnIndex;
        this.table = table
        this.sortBtn = document.createElement("div");
        this.th.appendChild(this.sortBtn);
        this.sortBtn.className = "sort-btn";
        this.sortBtn.addEventListener("click", e => {
            this.visibleFilterModal(e)
        });
        this.sortBtn.innerHTML = "▼";
        this.filterModal = document.createElement("div");
        this.filterModal.className = "filter-modal";
        this.sortBtn.appendChild(this.filterModal);
        this.valueList = document.createElement("div");
        this.valueList.className = "value-list";
        this.filterModal.appendChild(this.valueList);
        this.exeBtn = document.createElement('button');
        this.exeBtn.innerHTML = 'フィルター';
        this.sorting = this.sorting.bind(this)
        this.exeBtn.addEventListener('click',this.sorting);
        this.filterModal.appendChild(this.exeBtn);
        this.closeBtn = document.createElement('button');
        this.closeBtn.innerHTML = '閉じる';
        this.closeBtn.addEventListener('click',() => this.filterModal.style.visibility = 'hidden');
        this.filterModal.appendChild(this.closeBtn);
        this.values = [];
    }
  
    /**
     * フィルターボタン押下時、モーダルを表示するメソッド
     * 
     * @param {object} e クリックイベントオブジェクト
     */
    visibleFilterModal(e) {
        if(e.target.getElementsByClassName('filter-modal')[0] === undefined){

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
     * リストを生成するメソッド
     * 
     */
    createList() {
        // this.valueListを初期化
        while(this.valueList.firstChild){
            this.valueList.removeChild(this.valueList.firstChild);
        }

        // 全てを作る⇒this.value-listに格納
        const allSelectWrapper = document.createElement('div');
        this.valueList.appendChild(allSelectWrapper);
        const allSelect = document.createElement('input');
        allSelectWrapper.appendChild(allSelect);

        allSelect.setAttribute('name',`select-value-${this.columnIndex}`);
        allSelect.setAttribute('type','checkbox');
        allSelect.checked = true;
        allSelect.addEventListener('change',()=>{
            const checkboxs = this.valueList.children
            if(allSelect.checked){
                Array.prototype.forEach.call(checkboxs,checkWrap => {
                    checkWrap.children[0].checked = true;
                }) ;
            }else{

                Array.prototype.forEach.call(checkboxs,checkWrap => {
                    checkWrap.children[0].checked = false;
                }) ;
            }
        })
        allSelect.id = `select-all-${this.columnIndex}`;

        const allSelectLabel = document.createElement('label');
        allSelectLabel.setAttribute('name',`select-value-${this.columnIndex}`);
        allSelectLabel.setAttribute('for',`select-all-${this.columnIndex}`);
        allSelectLabel.innerHTML = 'すべて';
        allSelectWrapper.appendChild(allSelectLabel);

        // 空白を作る↓と同じname
        const blankSelectWrapper = document.createElement('div');
        this.valueList.appendChild(blankSelectWrapper);

        const blankSelect = document.createElement('input');
        blankSelect.setAttribute('type','checkbox');
        blankSelect.id = `select-blank-${this.columnIndex}`;
        blankSelect.value = '';
        blankSelect.checked = true;
        blankSelectWrapper.appendChild(blankSelect);

        const blankLabel = document.createElement('label');
        blankLabel.setAttribute('for',`select-blank-${this.columnIndex}`);
        blankLabel.innerHTML = '空白';
        blankSelectWrapper.appendChild(blankLabel);


        // 値の重複削除
        const count = {};
        console.log(this.table)
        this.table.visibleRows.forEach(row =>{
            count[row.children[this.columnIndex].innerHTML] = (count[row.children[this.columnIndex].innerHTML] || 0) + 1
        });

        // ループして全部の値のチェックボックスを作る
        Object.keys(count).forEach((key,i) => {
            if(key !==''){

                const div = document.createElement('div');
                this.valueList.appendChild(div);
                
                const checkbox = document.createElement('input');
                checkbox.setAttribute('type','checkbox');
                const value = key;
                checkbox.id = `${i}-${this.columnIndex}`;
                checkbox.value = value;
                checkbox.checked = true;
                checkbox.setAttribute('name',`select-value-${this.columnIndex}`);
                div.appendChild(checkbox)
                
                const label = document.createElement('label');
                label.setAttribute('for',`${i}-${this.columnIndex}`);
                label.innerHTML = value;
                div.appendChild(label);
            }
        });
    }

    /**
     * ソートを実行する関数
     * 
     */
    sorting(){

        // this.valuesで対象の値を取得する
        let keywords = Array.prototype.filter.call(this.valueList.children,checkWrap => {
            return checkWrap.children[0].checked == true;
        });

        keywords = keywords.map(arg =>{
            return arg.children[1].innerHTML;
        })

        console.log(keywords);
        
        const newRows = [];
        Array.prototype.forEach.call(this.table.rows,row => {
            if(keywords.includes(row.children[this.columnIndex].innerHTML)){

                row.style.display = 'table-row';
                newRows.push(row);
                
            }else{
                row.style.display = 'none';
            }
        })
        this.table.visibleRows = newRows;

        this.table.filterBtns.forEach(filterBtn => {
            if(this.columnIndex == filterBtn.columnIndex){
                
            }else{
                filterBtn.createList();
            }
        })
        
    }

    /**
     * 全選択メソッド
     */
    selectAll(rows){
        // 全てのvalue-listをcheckにする

        // valuesにすべての値を入れる

        // sortingを実行する
    }

  }
