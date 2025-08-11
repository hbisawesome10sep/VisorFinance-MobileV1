# Twilio SMS Configuration Setup

## Current Status ✅ Partially Fixed
- Phone number format is correct (+918947819840)
- SMS parsing engine works perfectly 
- Issue: Phone number not verified with Twilio account

## Next Step Required
The phone number `+918947819840` needs to be purchased or verified through your Twilio console.

### Option 1: Purchase a Twilio Phone Number
1. Go to your Twilio Console
2. Navigate to Phone Numbers → Manage → Buy a number
3. Purchase an Indian (+91) phone number
4. Update TWILIO_PHONE_NUMBER with the purchased number

### Option 2: Verify Current Number (if you own it)
1. Go to Twilio Console → Phone Numbers → Manage → Verified Caller IDs  
2. Add +918947819840 for verification
3. Follow Twilio's verification process

## How to Fix in Replit

1. **Go to the Secrets tab** in your Replit workspace
2. **Find TWILIO_PHONE_NUMBER** in the list
3. **Update the value** from `8947819840` to `+918947819840`
4. **Click Save**
5. **Restart the workflow** to apply changes

## Verification
After updating, test SMS sending again. You should see:
- ✅ SMS sending successful
- ✅ Proper international format logs
- ✅ No more "Invalid From Number" errors

## Format Rules
- **Must start with `+`** (plus sign)
- **Include country code** (91 for India)
- **No spaces or special characters** except the initial +
- **Example:** `+918947819840` for Indian numbers

## Error Code 21212
This Twilio error specifically means the "From" number (caller ID) is not in the correct format or not verified with your Twilio account.

Make sure your Twilio phone number:
1. Is purchased/verified in your Twilio console
2. Is formatted with international prefix (+91 for India)
3. Matches exactly the number in your Twilio account