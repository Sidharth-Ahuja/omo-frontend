import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  getDoc,
  where,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import app from "../../../../config/firebase";
import { Link } from "react-router-dom";
import { DateUtil } from "../../../../utils/DateUtils";

const fireStore = getFirestore(app);

const HistoryComponent = () => {
  const color = "blue";
  const [openTab, setOpenTab] = useState(1);
  const [allIssues, setAllIssues] = useState([]);
  const [unResolvedIssues, setUnResolvedIssues] = useState([]);
  const [resolvedIssues, setResolvedIssues] = useState([]);
  const [clicked, setClicked] = useState(false);

  const desiredDate = new Date();

  // Function to fetch all documents for a particular date for all users
  const fetchWithDrawalsForDate = async (desiredDate) => {
    try {
      // Initialize an array to store the results
      const allDocuments = [];

      // Query all users' documents
      const usersWithDrawRef = collection(fireStore, "users");
      const usersQuerySnapshot1 = query(usersWithDrawRef);
      const usersQuerySnapshot = await getDocs(usersQuerySnapshot1);
      console.log("no of withdrawls", usersQuerySnapshot.docs.length);

      // Loop through user documents
      for (const userDoc of usersQuerySnapshot.docs) {
        const userId = userDoc.id;
        console.log(userId);

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
          // Example timestamp data
          let isValidDate = DateUtil(doc.data().time.seconds, doc.data().time.nanoseconds);
          if (isValidDate) {
            allDocuments.push(doc.data())
          }
        });
      }

      // Return the array containing all documents for the desired date across all users
      return allDocuments;
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  };

  // Function to fetch all documents for a particular date for all users
  const fetchDepositsForDate = async (desiredDate) => {
    try {
      // Initialize an array to store the results
      const allDocuments = [];

      // Query all users' documents
      const userDepositRef = collection(fireStore, "users");
      const userDepositSnapshot1 = query(userDepositRef);
      const userDepositSnapshot = await getDocs(userDepositSnapshot1);
      console.log("no of deposits", userDepositSnapshot.docs.length);

      // Loop through user documents
      for (const userDoc of userDepositSnapshot.docs) {
        const userId = userDoc.id;
        console.log("userId", userId);

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

        // Loop through the documents and add them to the results
        querySnapshot.forEach((doc) => {
          let isValidDate = DateUtil(doc.data().time.seconds, doc.data().time.nanoseconds);
          if (isValidDate) {
            allDocuments.push(doc.data())
          }
        });
      }

      // Return the array containing all documents for the desired date across all users
      return allDocuments;
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  };

  // Example usage:
  // const desiredDate = '2023-05-28';

  const readableTime = (microTime) => {
    const milliTime = microTime / 1000;
    const cyprusTimezoneOffset = 2; // In hours
    const date = new Date(milliTime);
    const cyprusTime = new Date(
      date.getTime() + cyprusTimezoneOffset * 60 * 60 * 1000
    );
    const hours = cyprusTime.getUTCHours();
    const minutes = cyprusTime.getUTCMinutes();
    const seconds = cyprusTime.getUTCSeconds();
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    return formattedTime;
  };

  const handleUnResolveClick = async (id) => {
    const issueRef = doc(fireStore, "public", "reports", "reportedIssues", id);
    try {
      await updateDoc(issueRef, {
        status: "unresolved",
      });
      console.log("Issue status updated successfully!");
    } catch (error) {
      console.error("Error updating issue status: ", error);
    }
    setClicked(!clicked);
  };

  const handleResolveClick = async (id) => {
    const issueRef = doc(fireStore, "public", "reports", "reportedIssues", id);
    try {
      await updateDoc(issueRef, {
        status: "resolved",
      });
      console.log("Issue status updated successfully!");
    } catch (error) {
      console.error("Error updating issue status: ", error);
    }
    setClicked(!clicked);
  };

  useEffect(() => {
    // fetchAllIssues()
    fetchWithDrawalsForDate(desiredDate)
      .then((res) => {
        console.log("withdrawals", res);
      })
      .catch((err) => { });

    fetchDepositsForDate(desiredDate)
      .then((res) => {
        console.log("deposits", res);
      })
      .catch((err) => { });
  }, []);

  const adminAuthID = localStorage.getItem("adminAuthID");

  return adminAuthID ? (
    <div className="p-4 lg:ml-64 bg-[#FAFAFA]">
      <div style={{ color: "blue", fontWeight: "bold" }}>SHOW HISTORY</div>
      <div className="flex flex-wrap">
        <div className="w-full">
          <ul
            className="flex mb-0 list-none flex-wrap pt-3 pb-4 flex-row"
            role="tablist"
          >
            <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
              <a
                className={
                  "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
                  (openTab === 1
                    ? "text-white bg-" + color + "-600"
                    : "text-blue-600 bg-white")
                }
                onClick={(e) => {
                  e.preventDefault();
                  setOpenTab(1);
                }}
                data-toggle="tab"
                href="#link1"
                role="tablist"
              >
                TODAY
              </a>
            </li>
            <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
              <a
                className={
                  "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
                  (openTab === 2
                    ? "text-white bg-" + color + "-600"
                    : "text-blue-600 bg-white")
                }
                onClick={(e) => {
                  e.preventDefault();
                  setOpenTab(2);
                }}
                data-toggle="tab"
                href="#link1"
                role="tablist"
              >
                YESTERDAY
              </a>
            </li>
            <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
              <a
                className={
                  "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
                  (openTab === 3
                    ? "text-white bg-blue-600"
                    : "text-" + color + "-600 bg-white")
                }
                onClick={(e) => {
                  e.preventDefault();
                  setOpenTab(3);
                }}
                data-toggle="tab"
                href="#link2"
                role="tablist"
              >
                WEEK
              </a>
            </li>
            <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
              <a
                className={
                  "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
                  (openTab === 4
                    ? "text-white bg-" + color + "-600"
                    : "text-" + color + "-600 bg-white")
                }
                onClick={(e) => {
                  e.preventDefault();
                  setOpenTab(4);
                }}
                data-toggle="tab"
                href="#link1"
                role="tablist"
              >
                MONTH
              </a>
            </li>
            <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
              <a
                className={
                  "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
                  (openTab === 5
                    ? "text-white bg-" + color + "-600"
                    : "text-" + color + "-600 bg-white")
                }
                onClick={(e) => {
                  e.preventDefault();
                  setOpenTab(5);
                }}
                data-toggle="tab"
                href="#link1"
                role="tablist"
              >
                CUSTOM
              </a>
            </li>
          </ul>
          <div className="relative flex flex-col ">
            <div className=" flex-auto">
              <div className="tab-content tab-space">
                <div className={openTab != 5 ? "block" : "hidden"} id="link1">
                  <div className="flex flex-col">
                    {allIssues.map((issue, index) => {
                      return (
                        <div
                          key={index}
                          className="border px-4 py-5 min-w-0 break-words bg-white w-full mb-6 shadow-sm rounded"
                        >
                          <div>
                            <span className="text-blue-500">
                              Account Balance:{" "}
                            </span>
                            <span>{issue.comments}</span>
                          </div>

                          <div>
                            <span className="text-blue-500">
                              Total Deposits:{" "}
                            </span>

                            <span>{issue.comments}</span>
                          </div>
                          <div>
                            <span className="text-blue-500">
                              Total Withdraws:{" "}
                            </span>
                            <span>{issue.comments}</span>
                          </div>
                          {/* <div>
                            <span className='text-blue-500'>Time: </span>
                            <span>
                              {issue.time.toDate().toLocaleDateString()}{' '}
                              {issue.time.toDate().toLocaleTimeString()}
                            </span>
                          </div>
                          <div>
                            <span className='text-blue-500'>Status: </span>
                            <span>{issue.status}</span>
                          </div> */}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
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

export default HistoryComponent;
