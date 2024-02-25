window.addEventListener("load", () => {
  const tables = document.getElementsByClassName("filter-table");
  Array.prototype.forEach.call(tables, (table) => {
    const filterTable = new FilterTable(table);
    const filterCtrl = new FilterController(filterTable);
    filterCtrl.insertFilerBtns();
    console.log(filterCtrl)
  });
});
  
  