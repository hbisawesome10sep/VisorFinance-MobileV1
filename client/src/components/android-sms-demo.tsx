import { Smartphone, Zap, DollarSign, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AndroidSMSDemo() {
  const androidFlow = [
    {
      step: 1,
      icon: Smartphone,
      title: "SMS Arrives",
      description: "Bank sends transaction SMS to Android device",
      detail: "HDFC: Rs.1500 debited from A/c **1234...",
      color: "text-blue-600"
    },
    {
      step: 2, 
      icon: Zap,
      title: "Instant Detection",
      description: "BroadcastReceiver catches SMS automatically",
      detail: "No user interaction needed",
      color: "text-yellow-600"
    },
    {
      step: 3,
      icon: DollarSign,
      title: "Parse & Create",
      description: "Your SMS parser extracts transaction data",
      detail: "Amount: ₹1500, Category: Food, Merchant: Swiggy",
      color: "text-green-600"
    },
    {
      step: 4,
      icon: Clock,
      title: "Update Dashboard",
      description: "Transaction appears in Visor immediately",
      detail: "Real-time sync with dashboard and insights",
      color: "text-purple-600"
    }
  ];

  const permissions = [
    { name: "READ_SMS", purpose: "Read incoming bank SMS messages", required: true },
    { name: "RECEIVE_SMS", purpose: "Detect new SMS arrivals", required: true },
    { name: "INTERNET", purpose: "Sync transactions to backend", required: false }
  ];

  return (
    <div className="space-y-6">
      {/* Android Flow Steps */}
      <div className="space-y-4">
        <h4 className="font-medium">Android SMS Processing Flow</h4>
        {androidFlow.map((step, index) => (
          <div key={index} className="flex items-start gap-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {step.step}
            </div>
            <step.icon className={`w-5 h-5 mt-1 ${step.color}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{step.title}</span>
                <Badge variant="outline" className="text-xs">
                  {step.step === 1 ? '0ms' : step.step === 2 ? '<100ms' : step.step === 3 ? '<200ms' : '<500ms'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{step.description}</p>
              <p className="text-xs font-mono bg-background px-2 py-1 rounded border">
                {step.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Android Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Required Android Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {permissions.map((permission, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <span className="font-mono text-sm font-medium">{permission.name}</span>
                  <p className="text-xs text-muted-foreground">{permission.purpose}</p>
                </div>
                <Badge variant={permission.required ? "default" : "secondary"}>
                  {permission.required ? "Required" : "Optional"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Platform Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Platform</th>
                  <th className="text-left p-2">SMS Access</th>
                  <th className="text-left p-2">Twilio Needed</th>
                  <th className="text-left p-2">Real-time</th>
                  <th className="text-left p-2">Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">Android</td>
                  <td className="p-2">
                    <Badge variant="default" className="bg-green-100 text-green-800">Native APIs</Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant="secondary">No</Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant="default" className="bg-green-100 text-green-800">Yes</Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant="default" className="bg-green-100 text-green-800">Free</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">iOS</td>
                  <td className="p-2">
                    <Badge variant="destructive">Restricted</Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant="default">Yes</Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant="secondary">Limited</Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline">Paid</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Web</td>
                  <td className="p-2">
                    <Badge variant="destructive">No Access</Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant="default">Yes</Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant="secondary">Manual</Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline">Paid</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Code Example */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Android Implementation Example</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
{`// AndroidManifest.xml
<uses-permission android:name="android.permission.READ_SMS" />
<uses-permission android:name="android.permission.RECEIVE_SMS" />

// BroadcastReceiver
class SMSReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
        messages.forEach { sms ->
            val sender = sms.originatingAddress
            val body = sms.messageBody
            
            // Call your existing API
            visorAPI.parseSMS(sender, body)
        }
    }
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}