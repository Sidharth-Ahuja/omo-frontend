// Invoice.js
import React from 'react';
import jsPDF from 'jspdf';

const Invoice = () => {
  const generateInvoice = () => {
    const pdf = new jsPDF();

    // From Address (Left Side)
    pdf.text('From Address:', 20, 10);
    pdf.text('Your Company Name', 20, 20);
    pdf.text('123 Main Street', 20, 30);
    pdf.text('City, State, ZIP', 20, 40);

    // Billing Info (Right Side)
    pdf.text('Billing ID: 12345', 150, 20);
    pdf.text('Invoice ID: INV-001', 150, 30);

    // Table Header
    pdf.setFillColor(200, 220, 255);
    pdf.rect(20, 60, 170, 10, 'F');
    pdf.text('Participation Fee', 30, 65);
    pdf.text('Amount', 120, 65);

    // // Table Rows
    // pdf.text('Conference Registration', 30, 75);
    // pdf.text('$200', 120, 75);

    // pdf.text('Workshop Fee', 30, 85);
    // pdf.text('$100', 120, 85);

    // Save the PDF
    pdf.save('invoice.pdf');
  };

  return (
    <div>
      <h1>Invoice</h1>
      <button onClick={generateInvoice}>Generate Invoice</button>
    </div>
  );
};

export default Invoice;
