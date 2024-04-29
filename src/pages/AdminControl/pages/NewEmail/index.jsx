import React, { useEffect, useState, useRef } from "react";
import {
  setDoc,
  getDoc,
  doc,
  collection,
  getFirestore,
  serverTimestamp,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import app from "../../../../config/firebase";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import axios from "../../../../config/axios";
import { Editor } from "@tinymce/tinymce-react";
import TagsInput from "react-tagsinput";
import "react-tagsinput/react-tagsinput.css";
import { MultiSelect } from "react-multi-select-component";

const fireStore = getFirestore(app);

const NewEmail = ({ match }) => {
  // States
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dobToFilter, setDobToFilter] = useState("");

  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    emails: [],
  });

  // Options for the country selection
  const countryOptions = [
    { value: "United States 🇺🇸", label: "United States" },
    { value: "Canada 🇨🇦", label: "Canada" },
    { value: "United Kingdom 🇬🇧", label: "United Kingdom" },
    { value: "Australia 🇦🇺", label: "Australia" },
    { value: "Germany 🇩🇪", label: "Germany" },
    { value: "France 🇫🇷", label: "France" },
    { value: "India 🇮🇳", label: "India" },
    { value: "Japan 🇯🇵", label: "Japan" },
  ];

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from Firebase Firestore
  const fetchUsers = async () => {
    try {
      const usersCollectionRef = collection(fireStore, "users");
      const querySnapshot = await getDocs(usersCollectionRef);
      const usersData = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        usersData.push(userData);
      });

      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Handle input change for subject
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle change in the TinyMCE editor
  const handleEditorChange = (content, editor) => {
    setFormData({
      ...formData,
      message: content,
    });
  };

  // Handle change in email tags input
  const handleEmailChange = (value) => {
    console.log("emailsss", value);
    setFormData((prev) => {
      return {
        ...prev,
        emails: value,
      };
    });
  };

  // Handle file input change
  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  // Handle removing a file
  const handleRemoveFile = (file) => {
    const updatedFiles = selectedFiles.filter((f) => f !== file);
    setSelectedFiles(updatedFiles);
  };

  // Handle uploading files
  const handleUpload = async (e) => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  // Handle filtering users by date of birth
  const handleDOBFilter = (event) => {
    const dobToFilter = event.target.value;
    setDobToFilter(dobToFilter);
    const selectedEmails = users
      .filter((user) => {
        const userDOB = new Date(user.dob);
        return userDOB.toDateString() === new Date(dobToFilter).toDateString();
      })
      .map((item) => item.email);

    setFormData({
      ...formData,
      emails: selectedEmails,
    });
  };

  // Handle selecting all users
  const handleSelectAllUsers = () => {
    const emails = users.map((item) => item.email);
    setFormData({
      ...formData,
      emails: emails,
    });
  };

  // Handle clearing user selection
  const handleClearUser = () => {
    setFormData({
      ...formData,
      emails: [],
    });
  };

  // Handle selecting countries
  const handleCountryChange = (selectedValues) => {
    setSelectedCountries([...selectedValues]);
    if (selectedValues.length) {
      selectedValues = selectedValues.map((item) => item.value);
    }
    const selectedEmails = users
      .filter((user) => selectedValues.includes(user.country))
      .map((item) => item.email);

    setFormData({
      ...formData,
      emails: selectedEmails,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    sendEmail();
  };

  const sendEmail = () => {
    let payload = {
      subject: formData.subject,
      message: formData.message,
      emails: formData.emails,
    };

    console.log("payload", payload);

    axios
      .post("/sendmail/admin", payload)
      .then((response) => {
        console.log("Response:", response);
        window.alert("Email has sent successfully!");
        // Do something with the response data
      })
      .catch((error) => {
        console.error("Error:", error);
        window.alert("Some error occured while sending the email!");
        // Handle the error
      });
  };

  return (
    <div className="p-4 sm:ml-64 bg-[#FAFAFA]">
      <div className="font-semibold mb-5 px-3 text-2xl">Email Page</div>
      <div className="bg-white p-6 rounded shadow-md">
        <form className="space-y-4">
          {/* {/* {selectedCountries && selectedCountries.length || formData.emails && formData.emails.length?  */}
          <div className="space-y-2">
            <label htmlFor="users" className="text-lg">
              Emails:
            </label>
            <TagsInput
              value={formData.emails}
              id="users"
              name="users"
              onChange={handleEmailChange}
              inputProps={{ placeholder: "Emails" }}
              className="border border-gray-300 p-2 rounded w-full"
            />
          </div>

          {/* <div className="space-y-2">
            <label htmlFor="users" className="text-lg">
              Emails:
            </label>
            <input
              value={individualEmails}
              id="users"
              name="users"
              onChange={(e)=>setIndividualEmails(e.target.value)}
              inputProps={{ placeholder: "Emails" }}
              className="border border-gray-300 p-2 rounded w-full"
            />
            
          </div> */}
          {/* } */}

          <div className="space-y-2">
            <label htmlFor="countrySelect" className="text-lg">
              Select users by Country:
            </label>
            <MultiSelect
              options={countryOptions}
              value={selectedCountries}
              onChange={handleCountryChange}
              labelledBy="Select Country"
            />
          </div>

          <div className="space-y-2">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-l"
              onClick={handleSelectAllUsers}
            >
              All Users
            </button>
            <button
              onClick={handleClearUser}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-r"
            >
              Clear User
            </button>
            <input
              type="date"
              value={dobToFilter}
              onChange={handleDOBFilter}
              className="border border-gray-300 p-2 rounded"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-lg">
              Subject:
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Subject"
              required
              className="border border-gray-300 p-2 rounded w-full"
            />
          </div>

          <div className="space-y-2">
            {/* <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
              onClick={handleUpload}
            >
              Add Media
            </button>
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            /> */}
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span>{file.name}</span>
                  <button
                    onClick={() => handleRemoveFile(file)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-lg">
              Message:
            </label>
            <Editor
              apiKey="5fdt201c69bf7k7cpnbv6bs05w9qb0fw20qc1tzy95ynl9st"
              id="message"
              name="message"
              value={formData.message}
              onEditorChange={handleEditorChange}
              init={{
                height: 300,
                menubar: true,
                plugins: [
                  "advlist autolink lists link image charmap print preview anchor help",
                  "searchreplace visualblocks code insertdatetime media table paste wordcount",
                ],
                toolbar:
                  "undo redo | formatselect | bold italic | forecolor backcolor | \
                      alignleft aligncenter alignright alignjustify | \
                      bullist numlist outdent indent | removeformat | help",
              }}
              className="border border-gray-300 p-2 rounded"
            />
          </div>

          <button
            onClick={handleSubmit}
            // type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
          >
            Send Emails
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewEmail;
