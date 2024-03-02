window.addEventListener("load", () => {
    const table = document.getElementsByClassName('bulk-table')[0];
    const bulkTable = new BulkTable(table);
    const bulkCtrl = new BulkController(bulkTable);
    const addRowBtn = new BulkBtn('追加');
    const addRowFunc = () => {
        const modal = new Modal();
        modal.create();
        const rowNum = modal.execute();
        bulkTable.addRow(rowNum);
        bulkTable.hideBtns();   
    }

    // const btnParams = [
    //     [
    //         '追加',
    //         function(checkedValues,ctrl){
    //             ctrl.table.addRow();
    //         }
    //     ],
    //     [
    //         '削除',
    //         function(checkedValues){
                
    //         }
    //     ],
    //     [
    //         'メールを送信',
    //         function(checkedValues,ctrl){
    //             checkedValues.forEach(value => {
    //                 console.log(`${value[4]}にメールを送信しました`);
    //             });
    //             console.log(ctrl)
    //         }
    //     ],
    //     [
    //         '合格にする',
    //         function(checkedValues){
    //             checkedValues.forEach(value => {
    //                 console.log(`${value[3]}は合格です`);
    //             });
    //         }
    //     ]
    // ]

    // const tables = document.getElementsByClassName("bulk-table");
    // Array.prototype.forEach.call(tables, (table,index) => {
    //   const bulkTable = new BulkTable(table);
    //   const bulkCtrl = new BulkController(bulkTable);
    //   bulkCtrl.insertCheckBox(index);
    //   bulkCtrl.insertBulkBtns(bulkCtrl.createBulkBtns(btnParams));
    //   console.log(bulkCtrl);
    // });
});
    