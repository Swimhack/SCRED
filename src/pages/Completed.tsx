
import PharmacistTable from "@/components/PharmacistTable";

const Completed = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Completed Pharmacist Credentialing</h1>
      
      <PharmacistTable filterStatus="Completed" />
    </div>
  );
};

export default Completed;
