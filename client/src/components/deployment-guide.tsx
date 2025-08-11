import { Smartphone, Globe, Download, Code, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function DeploymentGuide() {
  const deploymentOptions = [
    {
      icon: Globe,
      title: "Web App (Current)",
      status: "Available Now",
      description: "Test immediately on any Android device",
      steps: ["Open Replit URL on Android Chrome", "Navigate to /auth-demo", "Test SMS parsing manually", "Add to Home Screen"],
      effort: "0 minutes",
      color: "text-green-600",
      badge: "Ready"
    },
    {
      icon: Smartphone,
      title: "Capacitor Android App",
      status: "Recommended",
      description: "Convert React app to native Android with SMS access",
      steps: ["Install Capacitor", "Add Android platform", "Configure SMS permissions", "Build APK"],
      effort: "30-60 minutes",
      color: "text-blue-600",
      badge: "Best Option"
    },
    {
      icon: Download,
      title: "APK Generation",
      status: "Requires Setup",
      description: "Native Android app with full SMS integration",
      steps: ["Setup Android Studio", "Configure build environment", "Add SMS BroadcastReceiver", "Generate signed APK"],
      effort: "2-3 hours",
      color: "text-purple-600",
      badge: "Full Native"
    },
    {
      icon: Code,
      title: "React Native",
      status: "Complete Rewrite",
      description: "Full native performance with SMS access",
      steps: ["Convert React components", "Setup native modules", "Implement SMS receiver", "Build and test"],
      effort: "2-3 days",
      color: "text-orange-600",
      badge: "Advanced"
    }
  ];

  const currentAppUrl = window.location.origin;

  return (
    <div className="space-y-6">
      {/* Quick Test Section */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Globe className="w-5 h-5" />
            Test Now on Android (No APK needed)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-green-700 dark:text-green-300">
              Open this URL on your Android device to test SMS parsing immediately:
            </p>
            <div className="flex items-center gap-2 p-3 bg-white dark:bg-green-900/40 rounded border">
              <code className="text-sm font-mono flex-1">{currentAppUrl}/auth-demo</code>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigator.clipboard.writeText(`${currentAppUrl}/auth-demo`)}
              >
                Copy
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => window.open(`${currentAppUrl}/auth-demo`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Open Demo
              </Button>
              <span className="text-xs text-green-600 dark:text-green-400">
                Works on any mobile browser
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Options */}
      <div className="space-y-4">
        <h4 className="font-medium">Android Deployment Options</h4>
        {deploymentOptions.map((option, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <option.icon className={`w-5 h-5 ${option.color}`} />
                  <CardTitle className="text-lg">{option.title}</CardTitle>
                </div>
                <Badge variant={option.badge === "Ready" ? "default" : "secondary"}>
                  {option.badge}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{option.description}</p>
                
                <div className="flex items-center gap-4 text-xs">
                  <span className="font-medium">Setup Time:</span>
                  <Badge variant="outline">{option.effort}</Badge>
                  <span className="font-medium">Status:</span>
                  <span className={option.color}>{option.status}</span>
                </div>

                <div>
                  <span className="text-sm font-medium">Steps:</span>
                  <ol className="mt-1 space-y-1">
                    {option.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-4 h-4 flex items-center justify-center bg-muted rounded-full text-xs font-medium">
                          {stepIndex + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SMS Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>SMS Testing on Mobile Browser</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Test the SMS parsing engine with real bank messages:
            </p>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs font-medium mb-2">Sample Bank SMS:</p>
              <code className="text-xs">
                HDFC Bank: Rs 1,500.00 debited from A/c **1234 on 09-Aug-25 via UPI-SWIGGY BANGALORE. Available bal: Rs 25,000.00
              </code>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Copy any bank SMS from your phone</p>
              <p>• Paste into the SMS parsing demo</p>
              <p>• See instant transaction creation</p>
              <p>• Test with different bank formats</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacitor Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle>Capacitor Quick Start (Recommended)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
{`# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize Capacitor
npx cap init visor com.yourcompany.visor
npx cap add android

# Build and open in Android Studio
npm run build
npx cap sync
npx cap open android

# Add SMS permissions to AndroidManifest.xml
<uses-permission android:name="android.permission.READ_SMS" />
<uses-permission android:name="android.permission.RECEIVE_SMS" />`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}