// BasicPetInfo.jsx
import { DetailRow } from "./DetailRow";

export const formatDate = (dateString, format = "default") => {
  if (!dateString) return "N/A";

  if (format === "yyyy-MM-dd'T'HH:mm") {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const BasicPetInfo = ({ petData }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6 border border-gray-100">
    <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
      <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mr-5 shadow-inner">
        <svg
          className="w-8 h-8 text-orange-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{petData.name}</h2>
        <p className="text-gray-600 text-base mt-1">
          {petData.breed} • {petData.species}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 mb-6">
      <div>
        <DetailRow label="Pet ID" value={petData.petId} />
        <DetailRow label="Age" value={petData.age} />
        <DetailRow label="Sex" value={petData.sex} />
      </div>
      <div>
        <DetailRow label="Owner" value={petData.owner.owner} />
        <DetailRow label="Contact" value={petData.owner.contact} />
        <DetailRow
          label="Registration No."
          value={petData.registrationNumber}
        />
      </div>
    </div>

    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Appointments</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
        <DetailRow
          label="Last Visit"
          value={formatDate(petData.lastAppointment)}
          className={
            petData.lastAppointment ? "text-gray-800" : "text-gray-400"
          }
        />
        <DetailRow
          label="Next Visit"
          value={formatDate(petData.nextAppointment)}
          className={
            petData.nextAppointment
              ? "text-orange-600 font-medium"
              : "text-gray-400"
          }
        />
      </div>
    </div>
  </div>
);
