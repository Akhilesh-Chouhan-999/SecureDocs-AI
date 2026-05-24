import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { FiUser, FiBriefcase, FiLock, FiSave } from "react-icons/fi";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Account Settings
        </h1>
        <p className="text-neutral-400 mt-1">
          Manage your profile, preferences, and security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <nav className="flex flex-col space-y-1">
            <button className="flex items-center px-4 py-3 bg-blue-500/10 text-blue-500 font-medium rounded-xl">
              <FiUser className="mr-3 w-5 h-5" /> Profile
            </button>
            <button className="flex items-center px-4 py-3 text-neutral-400 hover:bg-white/5 hover:text-foreground font-medium rounded-xl transition-colors">
              <FiLock className="mr-3 w-5 h-5" /> Security
            </button>
            <button className="flex items-center px-4 py-3 text-neutral-400 hover:bg-white/5 hover:text-foreground font-medium rounded-xl transition-colors">
              <FiBriefcase className="mr-3 w-5 h-5" /> Organization
            </button>
          </nav>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <h2 className="text-xl font-semibold mb-6 border-b border-white/10 pb-4">
              Personal Information
            </h2>
            <form className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                defaultValue={user?.email || ""}
                icon={<FiUser />}
                disabled
              />
              <Input
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                icon={<FiUser />}
              />
              <Input
                label="Company / Organization"
                type="text"
                defaultValue={user?.company || ""}
                icon={<FiBriefcase />}
              />
              <div className="pt-4 flex justify-end">
                <Button leftIcon={<FiSave />}>Save Changes</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
