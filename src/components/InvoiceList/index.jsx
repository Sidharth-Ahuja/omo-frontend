// Inside the InvoiceList component

import React, { useState } from "react";
import "./InvoiceList.css";
import jsPDF from "jspdf";
import EjectIcon from "@mui/icons-material/Eject";
import moment from "moment";

const InvoiceList = ({ invoices, isLoading }) => {

  const [dateSortFlag, setDateSortFlag] = useState(false);
  const [amountSortFlag, setAmountSortFlag] = useState(false);
  const [typeSortFlag, setTypeSortFlag] = useState(false);
  // const [dateSortFlag, setDateSortFlag] = useState(false);
  const downloadInvoice = (invoice) => {
    console.log("invoice", invoice);

    const pdf = new jsPDF();

    // // From Address (Left Side)
    // pdf.text('From:', 20, 10);
    // pdf.text('EVRIPIDIES DEMETRIOU', 20, 20);
    // // pdf.text('Your Company Name', 20, 30);
    // pdf.text('123 Main Street', 20, 40);
    // pdf.text('City, State, ZIP', 20, 50);

    // FROM (Left Side)
    pdf.setTextColor(255, 0, 0); // red color
    pdf.setFontSize(12);
    pdf.text("FROM:", 20, 20);
    pdf.setFontSize(12);
    pdf.text("EVRIPIDIES DEMETRIOU", 20, 26);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(13);
    pdf.text("Archaggelou michael 1", 20, 32);
    pdf.text("Limassol, cyprus, post code - 4529 ", 20, 38);

    // INVOICE (Right Side)
    pdf.setTextColor(100, 149, 237); // Light blue color
    // pdf.setFontStyle('bold');
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.text("INVOICE", 150, 20);
    // pdf.setFontStyle('normal');
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);

    // Invoice ID
    pdf.setTextColor(0, 0, 0); // Black color
    pdf.text(`Invoice ID: ${invoice?.invoice?.invoiceId}`, 150, 30);

    // Bill To (Below FROM and INVOICE)
    pdf.setFontSize(14);
    pdf.setFillColor(100, 149, 237);
    pdf.rect(20, 43, 50, 10, "F");
    pdf.setTextColor(255, 255, 255); // White color for text in the header
    pdf.text("BILL TO:", 23, 50);
    pdf.setFontSize(13);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${invoice?.user?.name}`, 20, 60);
    pdf.text(`${invoice?.user?.residentialAddress}`, 20, 66);
    pdf.text(
      `${invoice?.user?.city}, ${invoice?.user?.country}, ${invoice?.user?.postalCode}`,
      20,
      72
    );

    // Table Header for Description and Amount (Below Bill To)
    pdf.setFillColor(100, 149, 237); // Blue color for the header
    pdf.rect(20, 80, 170, 10, "F");
    pdf.setTextColor(255, 255, 255); // White color for text in the header
    pdf.text("DESCRIPTION", 30, 87);
    pdf.text("AMOUNT", 120, 87);


    pdf.setFillColor(89, 89, 89); // black color for the header
    pdf.rect(20, 90, 0.3, 50, "F");
    pdf.rect(105, 90, 0.3, 50, "F");
    pdf.rect(189.35, 90, 0.3, 50, "F");
    pdf.rect(20, 140, 170, 0.3, "F");

    pdf.setFillColor(0, 0, 0); 
    // Table Content for Description and Amount
    const tableContentStartY = 100; // Adjust the Y-coordinate as needed
    pdf.setTextColor(0, 0, 0);
    pdf.text("Participation Fee", 30, tableContentStartY);
    pdf.text(`${invoice?.invoice?.amount}`, 120, tableContentStartY);

    // Table Content for Description and Amount
    // Iterate through your data and add rows using pdf.text and pdf.rect with appropriate coordinates

    // Other Comments Table
    pdf.text("OTHER COMMENTS", 20, 150); // Adjust the Y-coordinate as needed
    pdf.text("Please include the invoice number in your check", 20, 160); // Adjust the Y-coordinate as needed

    // Payables Table
    pdf.text("PAYABLES", 150, 150); // Adjust the Y-coordinate as needed
    pdf.text("Payable to: ", 150, 160); // Adjust the Y-coordinate as needed
    pdf.setTextColor(255, 0, 0); // red color
    pdf.text("EVRIPIDIES DEMETRIOU", 150, 170);

    // Footer Text
    pdf.setTextColor(0, 0, 0); // Black color
    pdf.text(
      "If you have any doubt regarding the invoice, please contact ",
      95,
      pdf.internal.pageSize.height - 60,
      "center"
    );
    pdf.text(
      "EVRIPIDIES DEMETRIOU , contact no - +357 96 616805",
      95,
      pdf.internal.pageSize.height - 50,
      "center"
    );
    pdf.text(
      "Thank you for your business!",
      95,
      pdf.internal.pageSize.height - 40,
      "center"
    );

    // Save the PDF
    pdf.save(`invoice-${invoice?.invoice?.invoiceId}.pdf`);
  };

  console.log("isLoading invoices", isLoading, invoices);

  const dateFormatter = (timestampData) => {
    const docDate = moment(timestampData.toDate());
    return docDate.toISOString();
  };

  const handleSortDate = ()=>{

  }

  const handleSortAmount = () =>{
    sortAmount(invoices);
  }

  const handleSortType = ()=>{

  }

  return (
    <table className="w-full border border-[#ddd]">
      <thead className="bg-[#f5f5f5] border-b border-gray-200">
        <tr className="bg-[#f9f9f9]">
          <th className="p-[10px] text-center border-r border-gray-200">
            Date <EjectIcon onClick={handleSortDate} />
          </th>
          <th className="p-[10px] flex justify-center items-center gap-1 text-center border-r border-gray-200">
            Invoice ID
          </th>
          <th className="p-[10px] text-center border-r border-gray-200">
            Amount <EjectIcon onClick={handleSortAmount}/>
          </th>
          <th className="p-[10px]  text-center border-r border-gray-200">
            Type <EjectIcon onClick={handleSortType}/>
          </th>
          <th className="p-[10px] text-center border-r border-gray-200">
            Invoices
          </th>
        </tr>
      </thead>
      <tbody className="border-b border-gray-200">
        {
        // !isLoading
        //   ? 
          invoices?.map((ele) => (
              <tr
                key={ele.id}
                className="bg-[#f9f9f9] border-b border-gray-200"
              >
                <td className="p-[10px] text-center border-r border-gray-200">
                  {dateFormatter(ele?.invoice?.time)}
                </td>
                <td className="p-[10px] text-center border-r border-gray-200">
                  {ele?.invoice?.invoiceId}
                </td>
                {/* <td className='flex-item'>{ele?.invoice?.proofOfDelivery}</td> */}
                <td className="p-[10px] text-center border-r border-gray-200">
                  {ele?.invoice?.amount}
                </td>
                <td className="p-[10px] text-center border-r border-gray-200">
                  {ele?.invoice?.type}
                </td>
                <td
                  className="p-[10px] text-center border-r border-gray-200"
                  onClick={() => downloadInvoice(ele)}
                  color="primary"
                >
                  DOWNLOAD INVOICE
                </td>
              </tr>
            ))
          // : "Loading..."
          }
      </tbody>
    </table>
  );
};

export default InvoiceList;
