import React from "react";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import EjectIcon from "@mui/icons-material/Eject";
import moment from "moment";


export default function Table({ data }) {
  const dateFormatter = (timestampData) => {
    const docDate = moment(timestampData.toDate());
    return docDate.toISOString();
  };

  return (
    <div>
      <table className="w-full border border-[#ddd]">
        <thead className="bg-[#f5f5f5] border-b border-gray-200">
          <tr className="bg-[#f9f9f9]">
            <th className="p-[10px] text-center border-r border-gray-200">
              USER ID
            </th>
            <th className="p-[10px] flex justify-center items-center gap-1 text-center border-r border-gray-200">
              DATE/TIME <EjectIcon />
            </th>
            <th className="p-[10px] text-center border-r border-gray-200">
              Withdraw Amount(BTC) <EjectIcon />
            </th>
            <th className="p-[10px]  text-center border-r border-gray-200">
              Withdraw Sent To <EjectIcon />
            </th>
            <th className="p-[10px] text-center border-r border-gray-200">
              Status <EjectIcon />
            </th>
            <th className="p-[10px] text-center border-r border-gray-200"></th>
            <th className="p-[10px] text-center border-r border-gray-200"></th>
          </tr>
        </thead>
        <tbody className="border-b border-gray-200">
          {data.map((row) => (
            <tr
              key={row?.user?._id}
              className="bg-[#f9f9f9] border-b border-gray-200"
            >
              <td className="p-[10px] text-center border-r border-gray-200">
                {row?.user?._id}
              </td>
              <td className="p-[10px] text-center border-r border-gray-200">
              {dateFormatter(row?.invoice?.time)}
              </td>
              <td className="p-[10px] text-center border-r border-gray-200">
              {row?.invoice?.amount}
              </td>
              <td className="p-[10px] text-center border-r border-gray-200">
              {row?.user?.email}
              </td>
              <td className="p-[10px] text-center border-r border-gray-200">
                {row?.status}
              </td>
              <td className="p-[5px] text-center border-r border-gray-200">
                <CheckIcon sx={{ color: "green", cursor: "pointer" }} />
              </td>

              <td className="p-[5px] text-center ">
                <ClearIcon sx={{ color: "red", cursor: "pointer" }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
