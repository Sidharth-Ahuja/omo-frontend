// Inside the AccountingPage component

import React, { useEffect, useState } from "react";
import InvoiceList from "../../../../components/InvoiceList";
import {
  setDoc,
  getDoc,
  doc,
  collection,
  getFirestore,
  serverTimestamp,
  updateDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import app from "../../../../config/firebase";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SearchIcon from "@mui/icons-material/Search";
import DatePicker from "react-datepicker";
import moment from "moment";

const AccountingPage = () => {
  const fireStore = getFirestore(app);
  const color = "blue";

  const [withdraws, setWithdraws] = useState([]);
  const [users, setUsers] = useState([]);
  // const [deposits, setDeposits] = useState(0);

  const [openDateTab, setOpenDateTab] = useState("Today");
  const [openTab, setOpenTab] = useState(1);

  // const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Today");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [isLoading, setLoading] = useState(false);

  const handleOptionChange = (event) => {
    const value = event.target.value;
    fetchWithDrawalsForDate(value);
    // fetchDepositsForDate(value);
    setSelectedOption(value);
  };


  // Function to fetch all documents for a particular date for all users
  const fetchWithDrawalsForDate = async (time) => {
    try {
      // Initialize an array to store the results
      const allDocuments = [];
      let userData = {};
      setLoading(true);

      // Query all users' documents
      const usersWithDrawRef = collection(fireStore, "users");
      const usersQuerySnapshot1 = query(usersWithDrawRef);
      const usersQuerySnapshot = await getDocs(usersQuerySnapshot1);
      // setDeposits(usersQuerySnapshot.docs.length);

      // Loop through user documents
      for (const userDoc of usersQuerySnapshot.docs) {
        const userId = userDoc.id;

        // Reference the user's "withdrawals" collection
        const userWithdrawalsRef1 = collection(
          fireStore,
          `users/${userId}/transactions`
        );
        const usersQuerySnapshot2 = query(
          userWithdrawalsRef1
          // where("type", "==", "withdraw")
        );
        const querySnapshot = await getDocs(usersQuerySnapshot2);
        // Loop through the documents and add them to the results

        querySnapshot.forEach((doc) => {
          const timestampData = doc.data().time;
          const docDate = moment(timestampData.toDate());
          const currentDate = moment();

          switch (time) {
            case "Today":
              if (currentDate.isSame(docDate, "day")) {
                userData = { userId:userId, user: userDoc.data(), invoice: doc.data() };
                allDocuments.push(userData);
              }
              break;

            case "Yesterday":
              const yesterday = moment().subtract(1, "days");
              if (docDate.isSame(yesterday, "day")) {
                userData = { userId:userId, user: userDoc.data(), invoice: doc.data() };
                allDocuments.push(userData);
              }
              break;

            case "LastMonth":
              const lastWeekStart = moment()
                .subtract(1, "month")
                .startOf("month");
              const lastWeekEnd = new Date();

              if (docDate.isBetween(lastWeekStart, lastWeekEnd, null, "[]")) {
                userData = { userId:userId, user: userDoc.data(), invoice: doc.data() };
                allDocuments.push(userData);
              }
              break;
            case "Custom":
              if (docDate.isBetween(startDate, endDate, null, "[]")) {
                userData = { userId:userId, user: userDoc.data(), invoice: doc.data() };
                allDocuments.push(userData);
              }
              break;

            default:
              userData = { userId:userId, user: userDoc.data(), invoice: doc.data() };
              allDocuments.push(userData);
              break;
          }
        });
      }
      // const totalWithdrawsAmount = allDocuments.reduce((sum, document) => {
      //   return sum + document.amount * 1;
      // }, 0);
      setLoading(false);

      setWithdraws(allDocuments);
      setUsers(userData);

      // return allDocuments;
    } catch (error) {
      setLoading(false);
      console.error("Error fetching documents:", error);
      throw error; ``
    }
  };

  useEffect(() => {
    fetchWithDrawalsForDate("Today");
  }, [openDateTab]);

  console.log("withdraws", withdraws);
  const [invoices, setInvoices] = useState([
    { id: 1, date: "2023-11-25", invoiceId: "INV001", proofOfDelivery: "Yes" },
    // Add more sample invoices as needed
  ]);

  const sortByDate = () => {
    const sortedInvoices = [...invoices].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    setInvoices(sortedInvoices);
  };

  // Add similar functions for sorting by month and year

  return (
    <div className="p-4 sm:ml-64 bg-[#FAFAFA]">
      <h2 className="flex items-center gap-2 text-[1.4rem] font-[700] pb-2">
        Accounting{" "}
        <AccountBalanceIcon sx={{ color: "goldenrod", height: "100%" }} />
      </h2>

      <div className=" flex items-center">
        <div className="w-[31.5%] mr-2 flex relative ">
          <input
            type="text"
            placeholder="Search here"
            className="border border-gray-200 pl-2 w-[100%] h-9 rounded-lg outline-blue-300 focus:shadow-sm"
          />
          <SearchIcon
            sx={{
              color: "#3B82F6",
              cursor: "pointer",
              position: "absolute",
              right: "0.4rem",
              height: "100%",
              width: "1.75rem",
            }}
          />
        </div>

        {/* date option  */}
        <ul
          className="flex mb-0 list-none flex-wrap pt-3 pb-4 flex-row w-[69%]"
          role="tablist"
        >
          <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
            <a
              className={
                "text-xs font-bold uppercase px-5 py-2 cursor-pointer shadow-lg rounded block leading-normal " +
                (openDateTab === "Today"
                  ? "text-white bg-" + color + "-600"
                  : "text-blue-600 bg-white")
              }
              onClick={(e) => {
                e.preventDefault();
                setOpenDateTab("Today");
                fetchWithDrawalsForDate("Today");
              }}
              data-toggle="tab"
              // href='#link1'
              role="tablist"
            >
              Today
            </a>
          </li>
          <li className="-mb-px cursor-pointer mr-2 last:mr-0 flex-auto text-center">
            <a
              className={
                "text-xs font-bold uppercase px-5 py-2 shadow-lg rounded block leading-normal " +
                (openDateTab === "Yesterday"
                  ? "text-white bg-blue-600"
                  : "text-" + color + "-600 bg-white")
              }
              onClick={(e) => {
                e.preventDefault();
                setOpenDateTab("Yesterday");
                fetchWithDrawalsForDate("Yesterday");
              }}
              data-toggle="tab"
              // href='#link2'
              role="tablist"
            >
              Yesterday
            </a>
          </li>
          <li className="-mb-px cursor-pointer mr-2 last:mr-0 flex-auto text-center">
            <a
              className={
                "text-xs font-bold uppercase px-5 py-2 shadow-lg rounded block leading-normal " +
                (openDateTab === "LastMonth"
                  ? "text-white bg-" + color + "-600"
                  : "text-" + color + "-600 bg-white")
              }
              onClick={(e) => {
                e.preventDefault();
                setOpenDateTab("LastMonth");
                fetchWithDrawalsForDate("LastMonth");
              }}
              data-toggle="tab"
              // href='#link3'
              role="tablist"
            >
              This Month
            </a>
          </li>
          <li className="-mb-px cursor-pointer mr-2 last:mr-0 flex-auto text-center">
            <a
              className={
                "text-xs font-bold uppercase px-5 py-2 shadow-lg rounded block leading-normal " +
                (openDateTab === "Custom"
                  ? "text-white bg-" + color + "-600"
                  : "text-" + color + "-600 bg-white")
              }
              onClick={(e) => {
                e.preventDefault();
                setOpenDateTab("Custom");
                fetchWithDrawalsForDate("Custom");
              }}
              data-toggle="tab"
              // href='#link3'
              role="tablist"
            >
              Custom
            </a>
          </li>
        </ul>
      </div>

      {openDateTab === "Custom" && (
        <div className="flex space-x-2 items-center justify-end pb-4">
          <DatePicker
            selected={startDate}
            onChange={(date) => {
              setStartDate(date);
              // fetchDepositsForDate("Custom");
              fetchWithDrawalsForDate("Custom");
            }}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="border border-gray-300 rounded-md px-2 py-1"
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => {
              setEndDate(date);
              // fetchDepositsForDate("Custom");
              fetchWithDrawalsForDate("Custom");
            }}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            className="border border-gray-300 rounded-md px-2 py-1"
          />
        </div>
      )}

      <ul
        className="flex mb-0 list-none flex-wrap pt-3 pb-4 flex-row"
        role="tablist"
      >
        <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
          <a
            className={
              "text-xs font-bold uppercase px-5 py-3 cursor-pointer shadow-lg rounded block leading-normal " +
              (openTab === 1
                ? "text-white bg-" + color + "-600"
                : "text-blue-600 bg-white")
            }
            onClick={(e) => {
              e.preventDefault();
              setOpenTab(1);
            }}
            data-toggle="tab"
            role="tablist"
          >
            All
          </a>
        </li>
        <li className="-mb-px cursor-pointer mr-2 last:mr-0 flex-auto text-center">
          <a
            className={
              "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
              (openTab === 2
                ? "text-white bg-blue-600"
                : "text-" + color + "-600 bg-white")
            }
            onClick={(e) => {
              e.preventDefault();
              setOpenTab(2);
            }}
            data-toggle="tab"
            role="tablist"
          >
            WITHDRAW
          </a>
        </li>
        <li className="-mb-px cursor-pointer mr-2 last:mr-0 flex-auto text-center">
          <a
            className={
              "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
              (openTab === 3
                ? "text-white bg-" + color + "-600"
                : "text-" + color + "-600 bg-white")
            }
            onClick={(e) => {
              e.preventDefault();
              setOpenTab(3);
            }}
            data-toggle="tab"
            role="tablist"
          >
            DEPOSIT
          </a>
        </li>
      </ul>


      {openTab == 1 ? (
        <InvoiceList invoices={withdraws} isLoading={isLoading} />
      ) : openTab === 2 ? (
        <InvoiceList
          invoices={withdraws.filter((e) => e?.invoice?.type === "withdraw")}
          isLoading={isLoading}
        />
      ) : (
        <InvoiceList
          invoices={withdraws.filter((e) => e?.invoice?.type === "deposit")}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default AccountingPage;
