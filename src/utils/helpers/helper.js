export function generateRandomInvoiceId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 8;
    let invoiceId = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      invoiceId += characters.charAt(randomIndex);
    }
  
    return invoiceId;
  }
  
  export function sortAmount(numbers, sortOrder = 'asc') {

    console.log("numbers", numbers, sortOrder);
    const sortedArray = [...numbers];
  
    sortedArray.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a?.invoice?.amount - b?.invoice?.amount ; // Ascending order
      } else if (sortOrder === 'desc') {
        return b?.invoice?.amount  - a?.invoice?.amount ; // Descending order
      } else {
        throw new Error('Invalid sortOrder. Use "asc" or "desc".');
      }
    });
  
    return sortedArray;
  }

  function sortString(strings, sortOrder = 'asc') {
    const sortedArray = [...strings];
  
    sortedArray.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.localeCompare(b); // Ascending order
      } else if (sortOrder === 'desc') {
        return b.localeCompare(a); // Descending order
      } else {
        throw new Error('Invalid sortOrder. Use "asc" or "desc".');
      }
    });
  
    return sortedArray;
  }