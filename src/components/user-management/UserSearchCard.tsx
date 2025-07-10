import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface UserSearchCardProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const UserSearchCard = ({ searchTerm, onSearchChange }: UserSearchCardProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Search Users</CardTitle>
        <CardDescription>Find users by name, email, or role</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardContent>
    </Card>
  );
};