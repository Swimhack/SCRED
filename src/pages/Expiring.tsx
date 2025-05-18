
import PharmacistTable from "@/components/PharmacistTable";

const Expiring = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Expiring Soon Pharmacist Credentials</h1>
      
      <PharmacistTable filterStatus="Expiring Soon" />
    </div>
  );
};

export default Expiring;
