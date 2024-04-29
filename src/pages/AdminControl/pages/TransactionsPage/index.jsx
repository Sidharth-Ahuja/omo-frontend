import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DatePicker from "react-datepicker";
import Table from "./Table";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import app from "../../../../config/firebase";
import moment from "moment";

const TransactionsPage = () => {
  const fireStore = getFirestore(app);
  const adminAuthID = localStorage.getItem("adminAuthID");
  const color = "blue";
  const [openTab, setOpenTab] = useState(1);
  const [openDateTab, setOpenDateTab] = useState("Today");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState([]);


    // Function to fetch all documents for a particular date for all users
    const fetchTransactionsForDate = async (time) => {
      try {
        setData([]);
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
            userWithdrawalsRef1,
            where("type", "==", "deposit")
          );
          const querySnapshot = await getDocs(usersQuerySnapshot2);

          // console.log("querySnapshot", querySnapshot);
          // Loop through the documents and add them to the results
  
          querySnapshot.forEach((doc) => {
           console.log("querySnapshot", doc.data());
            
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
  
        setData(allDocuments);
        // setUsers(userData);
  
        return allDocuments;
      } catch (error) {
        setLoading(false);
        console.error("Error fetching documents:", error);
        throw error;``
      }
    };

    console.log("TRANSACTION DATA", data)

    // useEffect(()=>{
    //   fetchTransactionsForDate('Today');
    // },[openDateTab])

    const handleTab = (e, tab) =>{

      console.log("SELECTED TAB", tab);
      
        e.preventDefault();
        setOpenDateTab(tab);
        fetchTransactionsForDate(tab);
      
    }


  return adminAuthID ? (
    <div className="p-4 sm:ml-64 bg-[#FAFAFA]">
      <h2 className="flex items-center gap-1 text-[1.4rem] font-[700] pb-2">
        Transactions <ReceiptIcon sx={{ color: "goldenrod", height: "100%" }} />{" "}
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
              onClick={(e)=>handleTab(e, "Today")}
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
              onClick={(e) => handleTab(e, "Yesterday")}
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
                (openDateTab === "ThisMonth"
                  ? "text-white bg-" + color + "-600"
                  : "text-" + color + "-600 bg-white")
              }
              onClick={(e) => {handleTab(e, "ThisMonth")}}
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
                (openDateTab === "LastMonth"
                  ? "text-white bg-" + color + "-600"
                  : "text-" + color + "-600 bg-white")
              }
              onClick={(e) => {handleTab(e, "LastMonth")}}
              data-toggle="tab"
              // href='#link3'
              role="tablist"
            >
              Last Month
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
              onClick={(e) => handleTab(e, "Custom")}
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
              // fetchWithDrawalsForDate("Custom");
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
              // fetchWithDrawalsForDate("Custom");
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
            // href='#link1'
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
            // href='#link2'
            role="tablist"
          >
            BITCOIN
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
            // href='#link3'
            role="tablist"
          >
            STRIPE
          </a>
        </li>
      </ul>

      <Table data={data} />
    </div>
  ) : (
    <div className="flex flex-col justify-center h-[70vh] text-center items-center">
      <div className="font-bold text-[21px] mb-[20px]">Not Authorised</div>
      <Link to="/login" className="text-blue-500 font-bold">
        Go back
      </Link>
    </div>
  );
};

export default TransactionsPage;
