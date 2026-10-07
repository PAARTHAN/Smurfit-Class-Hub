/*
  Class Hub settings.
  With the Supabase details filled in, the app runs LIVE: everyone signs in with a
  code sent to their UCD email and shares the same real-time data.
  Leave supabase as null to run in DEMO mode (sample data on this device only).
*/
window.HUB_CONFIG = {
  supabase: {
    url: "https://xbibcwkmejeidwigaogx.supabase.co",
    key: "sb_publishable_4psD7S0a3P4mzKDn9qtvFw_QDagU8Nx"   // publishable key: safe in the app; the database rules protect the data
  },

  // The hub owner (Developer badge, chooses Class Ambassadors). Must match supabase-setup.sql.
  ownerEmails: ["paarthan.chandrasekaran@ucdconnect.ie"],

  // Email domains allowed to sign in. Must match supabase-setup.sql.
  allowedDomains: ["ucdconnect.ie", "ucd.ie"]
};
