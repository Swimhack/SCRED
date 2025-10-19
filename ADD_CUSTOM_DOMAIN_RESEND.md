# Add streetcredrx.com Domain to Resend

## Why This Is Needed

Currently using Resend's sandbox domain (`@resend.dev`) which can only send to verified emails. Adding your custom domain allows:
- ✅ Send from `noreply@streetcredrx.com` 
- ✅ Send to ANY email address (not just verified ones)
- ✅ Better email deliverability
- ✅ Professional sender address

## Step 1: Add Domain in Resend Dashboard

1. **Go to Resend Domains:**
   - https://resend.com/domains

2. **Click "Add Domain" button**

3. **Enter your domain:**
   ```
   streetcredrx.com
   ```

4. **Click "Add"**

## Step 2: Get DNS Records

After adding the domain, Resend will provide DNS records that look like this:

### SPF Record (TXT)
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
TTL: 3600 (or auto)
```

### DKIM Records (CNAME)
Resend provides 3 CNAME records:
```
Type: CNAME
Name: resend._domainkey
Value: [unique-value].resend.com
TTL: 3600

Type: CNAME
Name: resend2._domainkey
Value: [unique-value].resend.com
TTL: 3600

Type: CNAME
Name: resend3._domainkey
Value: [unique-value].resend.com
TTL: 3600
```

### DMARC Record (TXT) - Optional but Recommended
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:aj@streetcredrx.com
TTL: 3600
```

## Step 3: Add DNS Records to Your Domain

You need to add these records where your DNS is hosted. Common providers:

### If DNS is with your domain registrar:
- **GoDaddy:** DNS Management → Add Records
- **Namecheap:** Domain List → Manage → Advanced DNS
- **Google Domains:** DNS → Custom records
- **Cloudflare:** DNS → Add Record

### How to Add Records:

1. **Log in to your DNS provider**

2. **Go to DNS Management / DNS Settings**

3. **Add the SPF TXT record:**
   - Type: `TXT`
   - Name/Host: `@` (or leave blank, or `streetcredrx.com`)
   - Value: `v=spf1 include:_spf.resend.com ~all`
   - TTL: `3600` or `Auto`

4. **Add the 3 DKIM CNAME records:**
   - For each record:
     - Type: `CNAME`
     - Name/Host: `resend._domainkey`, `resend2._domainkey`, `resend3._domainkey`
     - Value: Copy from Resend dashboard
     - TTL: `3600` or `Auto`

5. **Add DMARC TXT record (optional):**
   - Type: `TXT`
   - Name/Host: `_dmarc`
   - Value: `v=DMARC1; p=none; rua=mailto:aj@streetcredrx.com`
   - TTL: `3600` or `Auto`

## Step 4: Wait for DNS Propagation

- DNS changes can take **5-15 minutes** to propagate
- Sometimes up to **48 hours** (rare)
- You can check status in Resend dashboard

**Resend will show:**
- ⏳ "Pending verification..." (orange)
- ✅ "Verified" (green) when done

## Step 5: Update Edge Function

Once the domain is verified in Resend, update the Edge Function:

### Change the `from` address:

**File:** `supabase/functions/send-contact-email/index.ts`

**Find (around line 217):**
```typescript
from: 'StreetCredRx Contact Form <noreply@resend.dev>',
```

**Replace with:**
```typescript
from: 'StreetCredRx <noreply@streetcredrx.com>',
```

### Redeploy the Edge Function:

1. Go to: https://supabase.com/dashboard/project/tvqyozyjqcswojsbduzw/functions
2. Click on `send-contact-email`
3. Click **"Deploy"**
4. Wait 30-60 seconds

## Step 6: Test Email Sending

1. Visit: https://streetcredrx1.fly.dev/contact
2. Submit a test message
3. Check `aj@streetcredrx.com` for the email

**Expected Result:**
```
From: StreetCredRx <noreply@streetcredrx.com>
To: aj@streetcredrx.com
Subject: 💼 New Contact Form Submission from [Name]
```

## Troubleshooting

### Domain stuck in "Pending" status

**Check DNS records are correct:**
```powershell
# Check SPF record
nslookup -type=TXT streetcredrx.com

# Check DKIM records
nslookup -type=CNAME resend._domainkey.streetcredrx.com
nslookup -type=CNAME resend2._domainkey.streetcredrx.com
nslookup -type=CNAME resend3._domainkey.streetcredrx.com
```

**Common issues:**
- Wrong record type (TXT vs CNAME)
- Trailing dot in CNAME value (remove it)
- TTL too high (lower to 300 or 3600)
- DNS provider requires full domain name instead of `@`

### Emails still not sending after verification

1. **Check Resend domain is verified** (green checkmark)
2. **Verify Edge Function was redeployed** after changing `from` address
3. **Check Edge Function logs** for errors
4. **Check Resend dashboard** for bounce/delivery logs

### "Domain already exists" error

If you get this error, the domain might already be added. Check:
1. Your Resend dashboard for existing domains
2. If it exists, just get the DNS records and add them
3. Wait for verification

## DNS Provider Specific Instructions

### GoDaddy
1. My Products → Domains → Manage DNS
2. Click "Add" under Records section
3. Select record type (TXT or CNAME)
4. Enter Name and Value
5. Click "Save"

### Namecheap
1. Domain List → Manage → Advanced DNS
2. Click "Add New Record"
3. Select Type, enter Host and Value
4. Click checkmark to save

### Cloudflare
1. Select domain → DNS
2. Click "Add record"
3. Select Type, enter Name and Content
4. **Important:** Set Proxy status to "DNS only" (gray cloud)
5. Click "Save"

### Google Domains
1. My domains → Manage → DNS
2. Scroll to "Custom resource records"
3. Enter Name, select Type, enter Data
4. Click "Add"

## Quick Reference

**Resend Dashboard:**
- Domains: https://resend.com/domains
- Email Logs: https://resend.com/emails

**Test Commands:**
```powershell
# Check DNS propagation
nslookup -type=TXT streetcredrx.com
nslookup -type=CNAME resend._domainkey.streetcredrx.com

# Or use online tools:
# https://mxtoolbox.com/SuperTool.aspx?action=txt:streetcredrx.com
# https://dnschecker.org/
```

**After Setup:**
- Recipient: `aj@streetcredrx.com` ✅
- Sender: `noreply@streetcredrx.com` (after domain verified)
- Can send to ANY email address ✅

---

## Current Status

- [x] Contact form recipient set to `aj@streetcredrx.com`
- [x] Edge Function code ready
- [ ] **YOU DO:** Add domain to Resend
- [ ] **YOU DO:** Add DNS records
- [ ] **WAIT:** DNS verification (5-15 min)
- [ ] **THEN DO:** Update `from` address in Edge Function
- [ ] **THEN DO:** Redeploy Edge Function
- [ ] Test email sending

---

**Let me know when the domain is verified in Resend, and I'll update the Edge Function to use the custom domain!**
