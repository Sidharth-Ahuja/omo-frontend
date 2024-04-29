import React, { useState } from "react";
import { Link } from "react-router-dom";
import ChooseTablePage from "../../../ChooseTablePage";
import TablesCard from "./TablesCard";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useEffect } from "react";
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
import SearchIcon from "@mui/icons-material/Search";
import app from "../../../../config/firebase";
import moment from "moment";
import { useRecoilState } from "recoil";
import { DarkMode } from "../../../../atom/Atom";

const ActiveUsersPage = () => {
  const fireStore = getFirestore(app);
  const adminAuthID = localStorage.getItem("adminAuthID");
  const tablesData = [
    { tableNum: 1, tableAmount: 0.25 },
    { tableNum: 2, tableAmount: 0.5 },
    { tableNum: 3, tableAmount: 1 },
    { tableNum: 4, tableAmount: 5 },
    { tableNum: 5, tableAmount: 10 },
    { tableNum: 6, tableAmount: 25 },
    { tableNum: 7, tableAmount: 50 },
    { tableNum: 8, tableAmount: 100 },
    { tableNum: 9, tableAmount: 500 },
  ];

  const color = "blue";

  const [openDateTab, setOpenDateTab] = useState("Today");

  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useRecoilState(DarkMode)

  const [withdraws, setWithdraws] = useState(0);
  const [deposits, setDeposits] = useState(0);
  const [withdrawDoc, setWithdrawDoc] = useState([]);
  const [depositDoc, setDepositDoc] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const handleShowOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleOptionChange = (event) => {
    const value = event.target.value;
    fetchWithDrawalsForDate(value);
    fetchDepositsForDate(value);
    setSelectedOption(value);
  };

  // Function to fetch all documents for a particular date for all users
  const fetchWithDrawalsForDate = async (time) => {
    try {
      // Initialize an array to store the results
      const allDocuments = [];
      setLoading(true);

      // Query all users' documents
      const usersWithDrawRef = collection(fireStore, "users");
      const usersQuerySnapshot1 = query(usersWithDrawRef);
      const usersQuerySnapshot = await getDocs(usersQuerySnapshot1);
      // console.log("no of withdrawls", usersQuerySnapshot.docs.length);
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
          where("type", "==", "withdraw")
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
                allDocuments.push(doc.data());
              }
              break;

            case "Yesterday":
              const yesterday = moment().subtract(1, "days");
              if (docDate.isSame(yesterday, "day")) {
                allDocuments.push(doc.data());
              }
              break;

            case "LastMonth":
              const lastWeekStart = moment()
                .subtract(1, "month")
                .startOf("month");
              const lastWeekEnd = new Date();
              if (docDate.isBetween(lastWeekStart, lastWeekEnd, null, "[]")) {
                allDocuments.push(doc.data());
              }
              break;
            case "Custom":
              if (docDate.isBetween(startDate, endDate, null, "[]")) {
                allDocuments.push(doc.data());
              }
              break;

            default:
              allDocuments.push(doc.data());
              break;
          }
        });
      }
      const totalWithdrawsAmount = allDocuments.reduce((sum, document) => {
        return sum + document.amount * 1;
      }, 0);
      setLoading(false);

      setWithdraws(totalWithdrawsAmount);

      return allDocuments;
    } catch (error) {
      setLoading(false);
      console.error("Error fetching documents:", error);
      throw error;
    }
  };

  // Function to fetch all documents for a particular date for all users
  const fetchDepositsForDate = async (time) => {
    setLoading(true);
    try {
      const allDocuments = [];

      const userDepositRef = collection(fireStore, "users");
      const userDepositSnapshot1 = query(userDepositRef);
      const userDepositSnapshot = await getDocs(userDepositSnapshot1);
      console.log("no of deposits", userDepositSnapshot.docs.length);

      // Loop through user documents
      for (const userDoc of userDepositSnapshot.docs) {
        const userId = userDoc.id;

        // Reference the user's "withdrawals" collection
        const userWithdrawalsRef1 = collection(
          fireStore,
          "users",
          userId,
          "transactions"
        );
        const usersQuerySnapshot2 = query(
          userWithdrawalsRef1,
          where("type", "==", "deposit")
        );
        const querySnapshot = await getDocs(usersQuerySnapshot2);

        querySnapshot.forEach((doc) => {
          const timestampData = doc.data().time;
          const docDate = moment(timestampData.toDate());
          const currentDate = moment();

          switch (time) {
            case "Today":
              if (currentDate.isSame(docDate, "day")) {
                allDocuments.push(doc.data());
              }
              break;

            case "Yesterday":
              const yesterday = moment().subtract(1, "days");
              if (docDate.isSame(yesterday, "day")) {
                allDocuments.push(doc.data());
              }
              break;

            case "LastMonth":
              const lastWeekStart = moment()
                .subtract(1, "month")
                .startOf("month");
              const lastWeekEnd = new Date();
              if (docDate.isBetween(lastWeekStart, lastWeekEnd, null, "[]")) {
                allDocuments.push(doc.data());
              }
              break;
            case "Custom":
              if (docDate.isBetween(startDate, endDate, null, "[]")) {
                allDocuments.push(doc.data());
              }
              break;

            default:
              allDocuments.push(doc.data());
              break;
          }
        });
      }
      const totalDepositAmount = allDocuments.reduce((sum, document) => {
        return sum + document.amount;
      }, 0);
      setDeposits(totalDepositAmount);
      setLoading(false);
      // Return the array containing all documents for the desired date across all users
      return allDocuments;
    } catch (error) {
      setLoading(false);
      console.error("Error fetching documents:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchDepositsForDate("Today");
    fetchWithDrawalsForDate("Today");
  }, []);

  return adminAuthID ? (
    <div className={"p-4 sm:ml-64 bg-[#FAFAFA]"}>
      <div className="flex flex-col gap-4">
        {/* <div className="flex justify-end m-4">
          <div className="flex flex-row-reverse shadow-lg p-6 rounded-lg">
            {showOptions && (
              <div className="relative">
                <select
                  value={selectedOption}
                  onChange={handleOptionChange}
                  className="border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value="">Choose Option</option>
                  <option value="Today">Today</option>
                  <option value="Yesterday">Yesterday</option>
                  <option value="LastWeek">Last Week</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            )}

            {showOptions && selectedOption === "Custom" && (
              <div className="flex space-x-2 items-center">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    fetchDepositsForDate("Custom");
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
                    fetchDepositsForDate("Custom");
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
          </div>
        </div> */}

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
          {showOptions && (
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
                    fetchDepositsForDate("Today");
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
                    fetchDepositsForDate("Yesterday");
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
                    fetchDepositsForDate("LastMonth");
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
                    fetchDepositsForDate("Custom");
                  }}
                  data-toggle="tab"
                  // href='#link3'
                  role="tablist"
                >
                  Custom
                </a>
              </li>
            </ul>
          )}
        </div>

        {showOptions && openDateTab === "Custom" && (
          <div className="flex space-x-2 items-center justify-end pb-4">
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                setStartDate(date);
                fetchDepositsForDate("Custom");
                fetchWithDrawalsForDate("Custom");
              }}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={new Date()}
              className="border border-gray-300 rounded-md px-2 py-1"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => {
                setEndDate(date);
                fetchDepositsForDate("Custom");
                fetchWithDrawalsForDate("Custom");
              }}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              maxDate={new Date()}
              className="border border-gray-300 rounded-md px-2 py-1"
            />
          </div>
        )}

        <div className="w-[100%] flex justify-between py-4 px-4 shadow-sm p-6 items-center">
          <p className="text-lg font-bold text-gray-600 px-4">
            Account Balance:-{" "}
            <span className="font-light">
              {isLoading
                ? "Fetching.. "
                : Intl.NumberFormat("en-US", {
                  minimumFractionDigits: 2,
                }).format(deposits - withdraws)}
            </span>
          </p>
          <p className="text-lg font-bold text-gray-600 px-4">
            Total Deposits:-{" "}
            <span className="font-light">
              {" "}
              {isLoading
                ? "Fetching.. "
                : Intl.NumberFormat("en-US", {
                  minimumFractionDigits: 2,
                }).format(deposits)}
            </span>
          </p>
          <p className="text-lg font-bold text-gray-600 px-4">
            Total Withdraws:-{" "}
            <span className="font-light">
              {isLoading
                ? "Fetching.. "
                : Intl.NumberFormat("en-US", {
                  minimumFractionDigits: 2,
                }).format(withdraws)}
            </span>
          </p>

          <button
            className="text-blue-700 font-bold px-4 py-1 rounded "
            onClick={handleShowOptions}
          >
            SHOW HISTORY
          </button>
        </div>

        <div className="w-[50%] mx-auto">
          <TablesCard
            starNum={1}
            lockTime={3}
            time={10}
            tablesData={tablesData.slice(0, 3)}
            minLimit={0.25}
          />
          <TablesCard
            starNum={2}
            time={15}
            tablesData={tablesData.slice(3, 6)}
            minLimit={5}
          />
          <TablesCard
            starNum={3}
            time={45}
            tablesData={tablesData.slice(6, 9)}
            minLimit={50}
          />
        </div>
      </div>
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

export default ActiveUsersPage;
