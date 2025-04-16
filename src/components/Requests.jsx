import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../utils/requestSlice";
import { useEffect } from "react";

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const reviewRequest = async (status, _id) => {
    try {
      const res = axios.post(
        BASE_URL + "/review/" + status + "/" + _id,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(_id));
    } catch (err) {}
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/requests/received", {
        withCredentials: true,
      });

      dispatch(addRequests(res.data.data));
    } catch (err) {}
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (!requests) return null;

  if (requests.length === 0)
    return <h1 className="text-center my-10 text-lg">No Requests Found</h1>;

  return (
    <div className="text-center my-10">
      <h1 className="font-bold text-white text-2xl mb-5">Connection Requests</h1>

      <div className="space-y-4">
        {requests.map((request) => {
          const { _id, firstName, lastName, photoUrl, age, gender, about } =
            request.fromUserId;

          return (
            <div
              key={_id}
              className="flex justify-between items-center p-4 rounded-xl bg-base-300 mx-auto max-w-xl"
            >
              <div className="flex items-center">
                <img
                  alt="photo"
                  className="w-16 h-16 rounded-full mr-4"
                  src={photoUrl}
                />
                <div className="text-left">
                  <h2 className="font-semibold text-lg">{`${firstName} ${lastName}`}</h2>
                  {age && gender && (
                    <p className="text-sm text-gray-300">{`${age}, ${gender}`}</p>
                  )}
                  <p className="text-sm text-gray-300">{about}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  className="btn bg-rose-500 px-4 py-2 text-sm rounded-2xl"
                  onClick={() => reviewRequest("rejected", request._id)}
                >
                  Reject
                </button>
                <button
                  className="btn bg-green-500 px-4 py-2 text-sm rounded-2xl"
                  onClick={() => reviewRequest("accepted", request._id)}
                >
                  Accept
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;
