
import PharmacistTable from "@/components/PharmacistTable";

const Pharmacists = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">All Pharmacists</h1>
      
      <PharmacistTable />
    </div>
  );
};

export default Pharmacists;
