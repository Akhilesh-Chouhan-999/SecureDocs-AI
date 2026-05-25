import React, { useState } from "react";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../store/authStore";
import { FiUser, FiBriefcase, FiLock, FiSave, FiEye, FiEyeOff, FiCpu } from "react-icons/fi";
import toast from "react-hot-toast";

type TabType = "profile" | "security" | "organization";

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  // Profile Form State
  const [fullName, setFullName] = useState(user?.name || "Akhilesh Chouhan");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [role, setRole] = useState(user?.role || "admin");

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [multiNodeAuth, setMultiNodeAuth] = useState(false);

  // Organization Form State
  const [company, setCompany] = useState(user?.company || "Obsidian Corp");
  const [corporateId, setCorporateId] = useState("CID-9082-1082");
  const [nodeTunnel, setNodeTunnel] = useState("ENCRYPTED_TUNNEL_04");

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }
    
    // Update store user state dynamically
    useAuthStore.setState({
      user: {
        ...user,
        name: fullName,
        avatar: avatarUrl,
        role: role,
      } as any,
    });
    
    toast.success("Profile information updated successfully.");
  };

  const handleSecuritySave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword || currentPassword || confirmPassword) {
      if (!currentPassword) {
        toast.error("Current passphrase is required to set a new one.");
        return;
      }
      if (newPassword.length < 12) {
        toast.error("New passphrase must be at least 12 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New passphrase confirmation does not match.");
        return;
      }
    }

    toast.success("Security configuration and telemetry synchronized.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleOrgSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) {
      toast.error("Organization name cannot be empty");
      return;
    }

    // Update store user state dynamically
    useAuthStore.setState({
      user: {
        ...user,
        company: company,
      } as any,
    });

    toast.success("Corporate node registry settings updated.");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto pb-safe">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Account Settings
        </h1>
        <p className="text-neutral-400 mt-1">
          Manage your profile, preferences, and telemetry security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="md:col-span-4 space-y-2">
          <nav className="flex flex-col space-y-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center px-4 py-3 font-medium rounded-xl transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-neutral-400 hover:bg-white/5 hover:text-foreground border border-transparent"
              }`}
            >
              <FiUser className="mr-3 w-5 h-5" /> Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center px-4 py-3 font-medium rounded-xl transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-neutral-400 hover:bg-white/5 hover:text-foreground border border-transparent"
              }`}
            >
              <FiLock className="mr-3 w-5 h-5" /> Security
            </button>
            <button
              onClick={() => setActiveTab("organization")}
              className={`flex items-center px-4 py-3 font-medium rounded-xl transition-all cursor-pointer ${
                activeTab === "organization"
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-neutral-400 hover:bg-white/5 hover:text-foreground border border-transparent"
              }`}
            >
              <FiBriefcase className="mr-3 w-5 h-5" /> Organization
            </button>
          </nav>

          <div className="glass-card p-4 rounded-xl border border-white/5 bg-surface-container-low hidden md:block">
            <div className="flex items-center gap-2 text-primary text-[11px] font-label-mono mb-2">
              <FiCpu className="w-3.5 h-3.5" /> TELEMETRY ACTIVE
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Cryptographic tokens and telemetry parameters are locked to this node. Ensure correct identity handshake details.
            </p>
          </div>
        </div>

        {/* Content Form Cards */}
        <div className="md:col-span-8 space-y-6">
          {activeTab === "profile" && (
            <Card className="glass-card p-6 md:p-8 rounded-xl shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-semibold border-b border-white/10 pb-4">
                  Personal Information
                </h2>
                <p className="text-xs text-neutral-400 mt-2">
                  Update your identity context and profile parameters.
                </p>
              </div>
              <form onSubmit={handleProfileSave} className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  value={user?.email || "admin@securedocs.ai"}
                  icon={<FiUser />}
                  disabled
                  className="bg-neutral-800/30 text-neutral-500 cursor-not-allowed"
                />
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  icon={<FiUser />}
                />
                <Input
                  label="Role / Title"
                  type="text"
                  placeholder="e.g. Administrator, Security Analyst"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  icon={<FiBriefcase />}
                />
                <Input
                  label="Profile Image Avatar URL"
                  type="text"
                  placeholder="https://..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  icon={<FiUser />}
                />
                <div className="pt-4 flex justify-end">
                  <Button type="submit" leftIcon={<FiSave />}>Save Changes</Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="glass-card p-6 md:p-8 rounded-xl shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-semibold border-b border-white/10 pb-4">
                  Security Parameters
                </h2>
                <p className="text-xs text-neutral-400 mt-2">
                  Maintain authentication keys and biosecurity handshake status.
                </p>
              </div>
              <form onSubmit={handleSecuritySave} className="space-y-5">
                <div className="relative">
                  <Input
                    label="Current Passphrase"
                    type={showPass ? "text" : "password"}
                    placeholder="Enter current passphrase"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    icon={<FiLock />}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-[38px] text-neutral-400 hover:text-primary transition-colors cursor-pointer"
                  >
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <Input
                  label="New Passphrase"
                  type="password"
                  placeholder="At least 12 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  icon={<FiLock />}
                />
                <Input
                  label="Confirm New Passphrase"
                  type="password"
                  placeholder="Repeat new passphrase"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<FiLock />}
                />

                <div className="h-[1px] bg-white/5 my-4" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-white/5">
                    <div>
                      <h4 className="text-body-md font-semibold text-on-surface">Biometric Telemetry</h4>
                      <p className="text-[11px] text-neutral-400">Sync with fingerprint/face sensors on host machine.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={biometricsEnabled}
                        onChange={(e) => setBiometricsEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-300 after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-white/5">
                    <div>
                      <h4 className="text-body-md font-semibold text-on-surface">Multi-Node Authentication</h4>
                      <p className="text-[11px] text-neutral-400">Require approval from adjacent tunnels for vault edits.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={multiNodeAuth}
                        onChange={(e) => setMultiNodeAuth(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-300 after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" leftIcon={<FiSave />}>Save Security Configuration</Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === "organization" && (
            <Card className="glass-card p-6 md:p-8 rounded-xl shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-semibold border-b border-white/10 pb-4">
                  Organization Registry
                </h2>
                <p className="text-xs text-neutral-400 mt-2">
                  Configure corporate parameters and encrypted entry tunnels.
                </p>
              </div>
              <form onSubmit={handleOrgSave} className="space-y-5">
                <Input
                  label="Company Name"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  icon={<FiBriefcase />}
                />
                <Input
                  label="Corporate CID"
                  type="text"
                  placeholder="CID-XXXX-XXXX"
                  value={corporateId}
                  onChange={(e) => setCorporateId(e.target.value)}
                  icon={<FiUser />}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-on-surface mb-1">
                    Primary Encryption Node Tunnel
                  </label>
                  <select
                    value={nodeTunnel}
                    onChange={(e) => setNodeTunnel(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-all duration-300 font-label-mono"
                  >
                    <option value="ENCRYPTED_TUNNEL_01">ENCRYPTED_TUNNEL_01 (Region: US-East)</option>
                    <option value="ENCRYPTED_TUNNEL_02">ENCRYPTED_TUNNEL_02 (Region: EU-West)</option>
                    <option value="ENCRYPTED_TUNNEL_03">ENCRYPTED_TUNNEL_03 (Region: AP-South)</option>
                    <option value="ENCRYPTED_TUNNEL_04">ENCRYPTED_TUNNEL_04 (Region: Default Global)</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" leftIcon={<FiSave />}>Save Registry Settings</Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
