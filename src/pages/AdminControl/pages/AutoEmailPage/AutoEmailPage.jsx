import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import AddIcon from "@mui/icons-material/Add";
import { allData } from "./EmailData";

function AutoEmailPage() {
  const [sideBarMenu, setSideBarMenu] = useState("Registration");
  const [showDropDown, setShowDropDown] = useState(false);

  const [AllData, setAllData] = useState(allData)
  const [emailData, setEmailData] = useState(null)
  const [language, setLanguage] = useState("english")
  const lang = ["English", "Arabic", "Spanish", "Chinese", "Thai", "Hindi", "Turkish"]

  function handleEdit(e) {
    let allData = [...emailData];
    let index = allData.findIndex((ele) => ele.option === sideBarMenu);
    let obj = { ...allData[index] };
    obj.isEditEnable = !obj.isEditEnable;
    allData[index] = obj;
    setEmailData(allData);
  }

  function handleSubjectChange(e) {
    let allData = [...emailData];
    let index = allData.findIndex((ele) => ele.option === sideBarMenu);
    let obj = { ...allData[index] };
    obj.subject = e.target.value;
    allData[index] = obj;
    setEmailData(allData);
    let everything = [...AllData];
    let index1 = everything.findIndex((ele) => ele.language === language);
    let arr = everything[index1]
    arr.data = [...emailData];
    setAllData([...everything])
  }

  function handleTitle(e) {
    let allData = [...emailData];
    let index = allData.findIndex((ele) => ele.option === sideBarMenu);
    let obj = { ...allData[index] };
    obj.title = e.target.value;
    allData[index] = obj;
    setEmailData(allData);
    let everything = [...AllData];
    let index1 = everything.findIndex((ele) => ele.language === language);
    let arr = everything[index1]
    arr.data = [...emailData];
    setAllData([...everything])
  }

  console.log(AllData, "hey I am here", emailData)


  useEffect(() => {
    let data = AllData.filter((e) => e.language === language)
    let emailData = data[0].data
    setEmailData(emailData)
  }, [language])

  const handleLanguage = (ele) => {
    let language = ele.toLowerCase(ele);
    setLanguage(language);
    setShowDropDown(false);
  }


  return (
    <div className="p-4 sm:ml-64 bg-[#FAFAFA]">
      <div className="flex justify-between items-center">
        <h2 className="flex items-center gap-1 text-[1.4rem] font-[700] pb-2">
          Auto Email
        </h2>
        <div>

          <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 capitalize" type="button"
            onClick={() => setShowDropDown(!showDropDown)}
          >
            {language}
            <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
            </svg>
          </button>

          {/* <!-- Dropdown menu --> */}
          {
            showDropDown && <div className="z-10 absolute top-16 bg-white divide-y divide-gray-100 rounded-lg shadow  dark:bg-gray-700">
              <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" >
                {
                  lang.map((ele, i) => {
                    return (
                      <li key={i}>
                        <p className="block px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => handleLanguage(ele)}>{ele}</p>
                      </li>
                    )
                  })
                }
              </ul>
            </div>
          }
        </div>
      </div>


      <div className="flex gap-2">
        {/* side bar options  */}
        <aside className="w-1/6">
          <Stack direction="column" spacing={2}>
            <Button
              variant={
                sideBarMenu === "Registration" ? "contained" : "outlined"
              }
              onClick={() => setSideBarMenu("Registration")}
              sx={{ padding: "0.45rem" }}
            >
              Registration
            </Button>
            <Button
              variant={sideBarMenu === "Bonus" ? "contained" : "outlined"}
              sx={{ padding: "0.45rem" }}
              onClick={() => setSideBarMenu("Bonus")}
            >
              Bonus
            </Button>
            <Button
              variant={sideBarMenu === "Rewards" ? "contained" : "outlined"}
              sx={{ padding: "0.45rem" }}
              onClick={() => setSideBarMenu("Rewards")}
            >
              Rewards
            </Button>
            <Button
              variant={sideBarMenu === "Deposit" ? "contained" : "outlined"}
              sx={{ padding: "0.45rem" }}
              onClick={() => setSideBarMenu("Deposit")}
            >
              Deposit
            </Button>
            <Button
              variant={sideBarMenu === "Withdraw" ? "contained" : "outlined"}
              sx={{ padding: "0.45rem" }}
              onClick={() => setSideBarMenu("Withdraw")}
            >
              Withdraw
            </Button>
            <Button
              variant={
                sideBarMenu === "Document Approved(ID)"
                  ? "contained"
                  : "outlined"
              }
              sx={{ padding: "0.45rem" }}
              onClick={() => setSideBarMenu("Document Approved(ID)")}
            >
              Document Approved(ID)
            </Button>
            <Button
              variant={
                sideBarMenu === "Document Approved(Address)"
                  ? "contained"
                  : "outlined"
              }
              sx={{ padding: "0.45rem" }}
              onClick={() => setSideBarMenu("Document Approved(Address)")}
            >
              Document Approved(Address)
            </Button>
            <Button
              variant={
                sideBarMenu === "Document Declined(ID)"
                  ? "contained"
                  : "outlined"
              }
              sx={{ padding: "0.45rem" }}
              onClick={() => setSideBarMenu("Document Declined(ID)")}
            >
              Document Declined(ID)
            </Button>
            <Button
              variant={
                sideBarMenu === "Document Declined(Address)"
                  ? "contained"
                  : "outlined"
              }
              sx={{ padding: "0.45rem" }}
              onClick={() => setSideBarMenu("Document Declined(Address)")}
            >
              Document Declined(Address)
            </Button>
            <Button variant="contained" sx={{ display: "flex", gap: "0.5rem" }}>
              <AddIcon />
              Add New
            </Button>
          </Stack>
        </aside>
        {/* main section  */}
        <section className="w-5/6 justify-center flex">
          {emailData?.filter((e) => e?.option === sideBarMenu).map((ele, i) => {
            return (
              <>
                <div
                  key={i}
                  className="w-[90%] py-12 flex gap-4 flex-col items-center"
                >
                  <div className=" px-8 flex gap-2 items-center py-4 w-full">
                    <p className="text-[1.3rem] font-[700] text-gray-800">
                      TITLE:-
                    </p>
                    {
                      ele.isEditEnable ? <textarea className="text-[1.1rem] outline-none border border-gray-500 rounded-[0.45rem] px-2 py-1 h-[2.5rem] font-[400] w-full font-mono" value={ele.title} onChange={(e) => handleTitle(e)} ></textarea> :
                        <span className="text-[1.1rem] font-[400] font-mono">
                          {ele.title}
                        </span>
                    }
                  </div>
                  <div className=" px-8 flex gap-2 py-4 w-full">
                    <p className="text-[1.3rem] font-[700] text-gray-800">
                      SUBJECT:-
                    </p>
                    {
                      ele.isEditEnable ? <textarea className="text-[1.1rem] w-full outline-none border border-gray-500 rounded-[0.45rem] h-40 px-3 py-2 font-[400] font-mono" onChange={(e) => handleSubjectChange(e)} value={ele.subject}></textarea> :
                        <span className="text-[1.1rem] font-[400] font-mono">
                          {ele.subject}
                        </span>
                    }
                  </div>
                  <Button variant="contained" sx={{ padding: "0.45rem" }} onClick={() => handleEdit(ele)}>
                    {ele.isEditEnable ? "Save" : "Edit"}
                  </Button>
                </div>
              </>
            );
          })}
        </section>
      </div>
    </div>
  );
}

export default AutoEmailPage
