
import PharmacistTable from "@/components/PharmacistTable";

const Pending = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Pending Pharmacist Requests</h1>
      
      <PharmacistTable filterStatus="Pending" />
    </div>
  );
};

export default Pending;
