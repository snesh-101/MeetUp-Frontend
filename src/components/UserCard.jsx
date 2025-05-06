const UserCard = ({ user, onAction }) => {
    const { _id, firstName, lastName, photoUrl, age, skills, gender, about } = user;
  
    return (
      <div className="card bg-[#1E1E2F] w-72 shadow-2xl border-white border-1  rounded-2xl overflow-hidden transform transition hover:scale-105 shadow-cyan-500/50 ">
        <figure className="relative">
          <img
            className="w-full h-[245px] object-cover"
            src={photoUrl}
            alt={`${firstName} ${lastName}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </figure>
        <div className="card-body p-4">
          <h2 className="card-title text-xl font-bold text-indigo-200">
            {firstName} {lastName}
          </h2>
          {age && gender && (
            <p className="text-gray-400 text-sm">
              {age} years old • {gender}
            </p>
          )}
          <p className="text-gray-300 text-sm">
            {about}
          </p>
          <div>
            <h3 className="font-semibold text-indigo-300">Skills</h3>
            <ul className="flex flex-wrap gap-2 mt-2">
              {skills.map((skill, index) => (
                <li
                  key={index}
                  className="bg-emerald-200/10 text-emerald-300 text-sm font-medium px-3 py-1 rounded-full border border-emerald-400/30"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-actions flex justify-between mt-2">
            <button
              onClick={() => onAction("ignored", _id)}
              className="btn rounded-full px-6 border border-red-500 text-red-400 hover:bg-red-600 hover:text-white transition"
            >
              Ignore
            </button>
            <button
              onClick={() => onAction("interested", _id)}
              className="btn rounded-full px-6 bg-indigo-600 text-white hover:bg-indigo-500 transition"
            >
              Connect
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default UserCard;
  