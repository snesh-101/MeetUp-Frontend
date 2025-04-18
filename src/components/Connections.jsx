import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";
import { Link } from "react-router-dom";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();

  const fetchConnections = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      console.log(res.data);
      dispatch(addConnections(res.data.data));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (!connections) return <h1 className="flex justify-center p-5 text-2xl">No connections found</h1>;
  if (connections.length === 0) return <h1>No Connections Found</h1>;

  return (
    <div className="text-center my-10">
      <h1 className="font-bold text-white text-3xl mb-6">Connections</h1>

      {connections.map((connection) => {
        const { _id, firstName, lastName, photoUrl, age, gender, about } =
          connection;

        return (
          <div
            key={_id}
            className="flex flex-col sm:flex-row items-center sm:items-start m-4 p-4 rounded-lg bg-base-300 w-full  sm:w-3/4 lg:w-1/2 mx-auto"
          >
            {/* Profile Photo */}
            <div className="mb-2 sm:mb-0">
              <img
                alt="photo"
                className="w-20 h-20 rounded-full object-cover"
                src={photoUrl}
              />
            </div>

            {/* Details (hidden on small screens) */}
            <div className="text-left mx-4 hidden sm:block flex-1">
              <h2 className="font-bold text-xl">{firstName + " " + lastName}</h2>
              {age && gender && <p>{age + ", " + gender}</p>}
              <p>{about}</p>
            </div>

            {/* Visible on all screens: name + chat */}
            <div className="sm:hidden mt-2 text-center">
              <h2 className="font-bold text-lg">{firstName + " " + lastName}</h2>
            </div>

            <Link to={"/chat/" + _id} className="sm:ml-auto mt-2 sm:mt-0">
              <button className="btn btn-primary rounded-3xl mt-4">Chat</button>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default Connections;
