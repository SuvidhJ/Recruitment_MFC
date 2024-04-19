import { useEffect, useState } from "react";
import { ToastContent } from "../components/CustomToast";
import axios from "axios";
import Cookies from "js-cookie";
import Navbar from "../components/Navbar";
import secureLocalStorage from "react-secure-storage";

const ChangeProfile = () => {
  const [domain, setDomain] = useState<string[]>([]);
  const [isProfile, setIsProfile] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [error, setError] = useState(false);
  const [toastContent, setToastContent] = useState<ToastContent>({});
  const [isDomainChanged, setIsDomainChanged] = useState(false);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setDomain((prevDomains) => [...prevDomains, value]);
    } else {
      setDomain((prevDomains) =>
        prevDomains.filter((domain) => domain !== value)
      );
    }
    setIsDomainChanged(true);
  };

  const handleUserDomain = async (e: React.FormEvent<HTMLFormElement>) => {
    const formData = {
      domain,
    };
    e.preventDefault();
    try {
      const id = secureLocalStorage.getItem("id");

      if (!id) {
        throw new Error("User id not found in secureLocalStorage");
      }
      const token = Cookies.get("jwtToken");
      const response = await axios.put(
        `https://mfc-recruitment-portal-be.vercel.app/user/updateuserdomain/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        // fetchUserDetails();
        secureLocalStorage.setItem(
          "userDetails",
          JSON.stringify(response.data)
        );

        console.log("ProfileIsDone", response.data.isProfileDone);
        setIsProfile(response.data.isProfileDone);
      }
      if (response.data.message) {
        setOpenToast(true);
        setToastContent({
          message: response.data.message,
        });
      }

      setError(false);
      setIsDomainChanged(false);
    } catch (error) {
      console.log(error);
      setOpenToast(true);
      setToastContent({
        message: "Invalid Username or Password",
        type: "error",
      });
      setError(true);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const id = secureLocalStorage.getItem("id");

      if (!id) {
        throw new Error("User id not found in secureLocalStorage");
      }
      const token = Cookies.get("jwtToken");
      const response = await axios.get(
        `https://mfc-recruitment-portal-be.vercel.app/user/user/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      // TODO: After updating, show some message and redirect to dashboard
      secureLocalStorage.setItem("userDetails", JSON.stringify(response.data));

      console.log("ProfileIsDone", response.data.isProfileDone);
      setIsProfile(response.data.isProfileDone);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const localData = secureLocalStorage.getItem("userDetails");
    if (typeof localData === "string") {
      const data = JSON.parse(localData);
      console.log(data.domain);
      setDomain(data?.domain || []);
    } else {
      console.error(
        "Unexpected data type retrieved from local storage:",
        typeof localData
      );
    }
  }, []);

  useEffect(() => {
    const userDetailsstore = secureLocalStorage.getItem("userDetails");
    if (typeof userDetailsstore === "string") {
      const userDetails = JSON.parse(userDetailsstore);
      setIsProfile(userDetails.isProfileDone);
    }
  }, []);

  return (
    <div className="w-full h-full bg-black p-12 flex flex-grow">
      <Navbar />
      <div
        className="border-8 border-dashed border-prime h-full flex-grow p-4 text-white flex flex-col gap-4 items-center justify-center"
        style={{ background: "rgba(0,0,0,0)" }}
      >
        {isProfile ? (
          <div className="nes-container is-rounded is-dark">
            <h1 className="text-xl md:text-2xl lg:text-3xl">
              Update Your Profile
            </h1>
            <hr className="h-1 bg-white" />
            <form onSubmit={handleUserDomain}>
              <section className="flex items-start text-xs md:text-base lg:items-center flex-col lg:flex-row mt-8">
                <p className="w-full text-xl">Update domain:</p>
                <div className="flex flex-col w-full">
                  <label>
                    <input
                      type="checkbox"
                      className="nes-checkbox is-dark"
                      value="tech"
                      checked={domain && domain.includes("tech")}
                      onChange={handleCheckboxChange}
                    />
                    <span className="text-xs md:text-sm lg:text-base">
                      Technical
                    </span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      className="nes-checkbox is-dark"
                      value="design"
                      checked={domain && domain.includes("design")}
                      onChange={handleCheckboxChange}
                    />
                    <span className="text-xs md:text-sm lg:text-base">
                      Design
                    </span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      className="nes-checkbox is-dark"
                      value="management"
                      checked={domain && domain.includes("management")}
                      onChange={handleCheckboxChange}
                    />
                    <span className="text-xs md:text-sm lg:text-base">
                      Management
                    </span>
                  </label>
                </div>
              </section>
              <button
                type="submit"
                className="nes-btn is-success float-right"
                style={{ marginBlock: "10px" }}
                disabled={!isDomainChanged}
              >
                Update &rarr;
              </button>
            </form>
          </div>
        ) : (
          <section className="flex items-start text-xs md:text-base lg:items-center flex-col lg:flex-row mt-8">
            <p className="w-full text-xl">
              Fill the profile to update the domain
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

export default ChangeProfile;
