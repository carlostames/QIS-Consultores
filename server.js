/**
 * QIS Consultores — Express Server
 * Serves static files + GoHighLevel CRM integration endpoint
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from root
app.use(express.static(path.join(__dirname), {
  extensions: ['html'],
  index: 'index.html'
}));

// ---- GoHighLevel CRM Lead Capture ----
app.post('/api/lead', async (req, res) => {
  try {
    const { name, email, company, role } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const GHL_API_KEY = process.env.GHL_API_KEY;
    const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

    if (!GHL_API_KEY || !GHL_LOCATION_ID) {
      console.error('Missing GHL environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Split name into first/last
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Upsert contact in GoHighLevel (creates or updates based on email)
    const ghlResponse = await fetch(
      'https://services.leadconnectorhq.com/contacts/upsert',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
        body: JSON.stringify({
          locationId: GHL_LOCATION_ID,
          firstName,
          lastName,
          email,
          companyName: company || '',
          tags: ['PDF Download', 'QIS One-Pager'],
          source: 'Website - One Pager Download',
        }),
      }
    );

    const ghlData = await ghlResponse.json();

    if (!ghlResponse.ok) {
      console.error('GHL API error:', JSON.stringify(ghlData));
      return res.status(ghlResponse.status).json({ 
        error: 'CRM error', 
        details: ghlData 
      });
    }

    console.log(`✅ Lead captured: ${firstName} ${lastName} (${email}) — ${company || 'N/A'}`);

    return res.json({
      success: true,
      contactId: ghlData.contact?.id,
    });

  } catch (err) {
    console.error('Lead capture error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Fallback: serve index.html for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 QIS Consultores server running on port ${PORT}`);
});
