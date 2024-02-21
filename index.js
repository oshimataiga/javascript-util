window.addEventListener("load", () => {
    const tables = document.getElementsByClassName("sortable");
    console.log(tables);
    Array.prototype.forEach.call(tables, (table) => {
      const filterTable = new FilterTable(table);
      filterTable.setFilterBtn();
      console.log(filterTable);
    });
  });
  
  