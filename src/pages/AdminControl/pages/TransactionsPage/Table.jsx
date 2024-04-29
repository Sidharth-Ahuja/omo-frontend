import React, { useState } from 'react'
import EjectIcon from "@mui/icons-material/Eject";
import moment from "moment";
import { sortAmount } from '../../../../utils/helpers/helper';

export default function Table({data}) {

  const [invoices, setInvoices] = useState(data);

  const dateFormatter = (timestampData) => {
    const docDate = moment(timestampData.toDate());
    return docDate.toISOString();
  };

  const handleSortDate = ()=>{

  }

  const handleSortAmount = () =>{
    let dummy = sortAmount(data);
    console.log("dummy", dummy);
    setInvoices(dummy);
  }

  const handleSortType = ()=>{

  }

  console.log("invoices", invoices);

  return (
    <div>
      <table className="w-full border border-[#ddd]">
        <thead className="bg-[#f5f5f5] border-b border-gray-200">
          <tr className="bg-[#f9f9f9]">
            <th className="p-[10px] text-center border-r border-gray-200">
              INVOICE/RECEIPT No.
            </th>
            <th className="p-[10px] flex justify-center items-center gap-1 text-center border-r border-gray-200">
              DATE/TIME <EjectIcon />
            </th>
            <th className="p-[10px] text-center border-r border-gray-200">
              Name Of Depositor <EjectIcon />
            </th>
            <th className="p-[10px]  text-center border-r border-gray-200">
              Email <EjectIcon />
            </th>
            <th className="p-[10px] text-center border-r border-gray-200">
              Amount <EjectIcon onClick={handleSortAmount}/>
            </th>
            <th className="p-[10px] text-center border-r border-gray-200">
              {/* Amount <EjectIcon /> */}
            </th>
          </tr>
        </thead>
        <tbody className="border-b border-gray-200">
          {invoices && invoices.length>0 && invoices.map((row) => (
            <tr
              key={row.invoiceNum}
              className="bg-[#f9f9f9] border-b border-gray-200"
            >
              <td className="p-[10px] text-center border-r border-gray-200">
                {row?.invoice?.invoiceId}
              </td>
              <td className="p-[10px] text-center border-r border-gray-200">
                {dateFormatter(row?.invoice?.time)}
              </td>
              <td className="p-[10px] text-center border-r border-gray-200">
                {row?.user?.name}
              </td>
              <td className="p-[10px] text-center border-r border-gray-200">
              {row?.user?.email}
              </td>
              <td className="p-[10px] text-center  border-r border-gray-200">
                {row?.invoice?.amount}
              </td>
              <td className="p-[6px] text-center">Download PDF</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
