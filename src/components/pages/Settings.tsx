import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Globe, 
  Key, 
  Database,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Sun,
  Moon
} from "lucide-react";

const Settings = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    transactions: true,
    security: true,
    updates: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    transactionHistory: 'friends',
    credentials: 'verified',
    location: 'city'
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    biometric: false,
    sessionTimeout: '24h',
    autoLock: true
  });

  const [appearance, setAppearance] = useState({
    theme: 'system',
    language: 'en',
    currency: 'USD',
    timezone: 'UTC'
  });

  // Initialize theme on component mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    setAppearance(prev => ({ ...prev, theme: isDark ? 'dark' : 'light' }));
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    setAppearance(prev => ({ ...prev, theme: newTheme }));
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 py-4 bg-card flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and security</p>
          </div>
          <div className="flex items-center space-x-2">
                         {/* Theme Toggle */}
             <div className="mr-4">
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={toggleTheme}
                 className="h-9 w-9 p-0"
               >
                 {isDarkMode ? (
                   <Sun className="w-4 h-4" />
                 ) : (
                   <Moon className="w-4 h-4" />
                 )}
               </Button>
             </div>
            <Button className="flex items-center space-x-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile Settings</span>
              </CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" placeholder="alex.agent.eth" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="alex@example.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={appearance.timezone} onValueChange={(value) => setAppearance({...appearance, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security & Privacy</span>
              </CardTitle>
              <CardDescription>Manage your account security and privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={security.twoFactor}
                    onCheckedChange={(checked) => setSecurity({...security, twoFactor: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Biometric Authentication</Label>
                    <p className="text-sm text-muted-foreground">Use fingerprint or face ID to sign in</p>
                  </div>
                  <Switch
                    checked={security.biometric}
                    onCheckedChange={(checked) => setSecurity({...security, biometric: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-lock Account</Label>
                    <p className="text-sm text-muted-foreground">Automatically lock account after inactivity</p>
                  </div>
                  <Switch
                    checked={security.autoLock}
                    onCheckedChange={(checked) => setSecurity({...security, autoLock: checked})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Session Timeout</Label>
                  <Select value={security.sessionTimeout} onValueChange={(value) => setSecurity({...security, sessionTimeout: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="8h">8 Hours</SelectItem>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select value={privacy.profileVisibility} onValueChange={(value) => setPrivacy({...privacy, profileVisibility: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>Choose how you want to be notified about important events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications on mobile</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Transaction Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified about transactions</p>
                  </div>
                  <Switch
                    checked={notifications.transactions}
                    onCheckedChange={(checked) => setNotifications({...notifications, transactions: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Appearance & Language</span>
              </CardTitle>
              <CardDescription>Customize the look and feel of your interface</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select 
                    value={appearance.theme} 
                    onValueChange={(value) => {
                      setAppearance({...appearance, theme: value});
                      if (value === 'dark') {
                        setIsDarkMode(true);
                        document.documentElement.classList.add('dark');
                      } else if (value === 'light') {
                        setIsDarkMode(false);
                        document.documentElement.classList.remove('dark');
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={appearance.language} onValueChange={(value) => setAppearance({...appearance, language: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={appearance.currency} onValueChange={(value) => setAppearance({...appearance, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Data & Privacy</span>
              </CardTitle>
              <CardDescription>Manage your data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Export</Label>
                    <p className="text-sm text-muted-foreground">Download a copy of your data</p>
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    Export Data
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Delete Account</Label>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
                  </div>
                  <Button variant="destructive" size="sm" className="flex items-center space-x-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
