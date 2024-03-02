window.addEventListener("load", () => {
    const tables = document.getElementsByClassName("bulk-table");
    const btnParams = [
        [
            'メールを送信',
            function(checkedValues){
                checkedValues.forEach(value => {
                    console.log(`${value[4]}にメールを送信しました`);
                });
            }
        ],
        [
            '合格にする',
            function(checkedValues){
                checkedValues.forEach(value => {
                    console.log(`${value[3]}は合格です`);
                });
            }
        ]
    ]
    Array.prototype.forEach.call(tables, (table,index) => {
      const bulkTable = new BulkTable(table);
      const bulkCtrl = new BulkController(bulkTable);
      bulkCtrl.insertCheckBox(index);
      bulkCtrl.insertBulkBtns(btnParams);
      console.log(bulkCtrl);
    });
});
    
    

/**
 * 一括操作テーブルクラス
 */
class BulkTable {
    constructor(table){
        this.table = table;
        this.thead = table.tHead.rows[0];
        this.rows = table.tBodies[0].rows;
        this.checkboxes = [];
        this.bulkBtns = [];
        this.createTfoot();
    }

    /**
     * フッターを生成する
     */
    createTfoot(){
        if(!this.table.querySelector('tfoot')){

            const tfoot = document.createElement('tfoot');
            this.table.appendChild(tfoot);
            const column = this.table.getElementsByTagName('tr')[0].getElementsByTagName('th').length + 1;
            const td = document.createElement('td');
            tfoot.appendChild(td)
            td.colSpan = column;
            
            const div = document.createElement('div');
            td.appendChild(div);
            this.tfoot = div;
        }
    }
            
    /**
     * チェックされている行の値を二次元配列で返却する
     */
    getCheckedValues(){
        return Array.prototype.reduce.call(this.rows,(rows,row) => {    // 全行をループ
            const checkbox = row.children[0].children[0];   //  チェックボックスを取得
            if(checkbox.checked){   // チェックがされている場合
                const values = Array.prototype.reduce.call(row.children,(cells,cell,index) => {     // セルをループ
                    if(index !== 0){    // 1列目じゃない場合
                        cells.push(cell.innerHTML);     // 保存用配列にテキストを保存
                    }
                    return cells;   // 保存用配列を返却
                },[]);
                rows.push(values);      //　保存用配列に文字列配列を保存
            }
            return rows;     // 保存用配列を返却
        },[])
    }

    /**
     * 全ての表示されている行を取得する
     */
    getVisibleRows(){
        return Array.prototype.filter.call(this.rows,row=>{
            return !row.className.includes('hide');
        });
    }

}

/**
 * 一括操作テーブルと一括操作ボタンの間で制御を担うクラス
 */
class BulkController {

    /**
     * BulkController - コンストラクタ
     * 
     * @param {BulkTable} bulkTable 
     */
    constructor(bulkTable){
        this.bulkTable = bulkTable;
        console.log(bulkTable)
    }

    /**
     * チェックボックスを挿入する
     */
        insertCheckBox(index){
            const header = this.bulkTable.thead;

            const allCheckCell = header.insertCell(0);

            const allCheck = document.createElement('input');
            allCheck.setAttribute('type','checkbox');
            const id = `${index}-select-all`
            allCheck.id = id;

            const allChekedFunc = () =>{
                Array.prototype.forEach.call(this.bulkTable.rows,row => {   // 全ての行をループ
                    const checkbox = row.children[0].children[0];
                    if(row.classList.contains('hide')){     // 非表示の場合
                        checkbox.checked = false;
                    }else{      // 表示されている場合
                        if(allCheck.checked){   // 'すべて'の選択肢がチェックされている場合
                            checkbox.checked = true;    // チェックをつける
                        }else{  // 'すべて'の選択肢がチェックされていない場合
                            checkbox.checked = false;   // チェックを外す
                        }
                    }
                })
            }

            allCheck.addEventListener('click',allChekedFunc);

            const allLabel = document.createElement('label');
            allLabel.innerHTML = 'すべて';
            allLabel.setAttribute('for',id);

            allCheckCell.appendChild(allCheck)
            allCheckCell.appendChild(allLabel)
    
            Array.prototype.forEach.call(this.bulkTable.rows,row => {
                const cell = row.insertCell(0);
                const checkbox = document.createElement('input');
                checkbox.setAttribute('type','checkbox');
                cell.appendChild(checkbox);
            });
        }

    /**
     * 一括操作ボタンを挿入する
     */
    insertBulkBtns(btnParams){
        btnParams.forEach(btnParam => {
            const btn = new BulkBtn(btnParam[0]);
            console.log(btnParam)
            btn.btn.addEventListener('click',() => {
                this.execute(btnParam[1])
            });
            console.log(this.bulkTable.tfoot);
            this.bulkTable.tfoot.appendChild(btn.btn)
        });
    }

    /**
     * ボタン押下時に実行される処理
     */
    execute(callback){
        // チェックされている値を取得
        const checkedValues = this.bulkTable.getCheckedValues();

        if(checkedValues.length > 0){
            callback(checkedValues);

        }
    }

}

/**
 * 一括操作ボタンクラス
 */
class BulkBtn {
    constructor(btnText){
        this.btn = document.createElement('button');
        this.btn.innerHTML = btnText;
    }
}

/**
 * 行を追加するボタンクラス
 */


